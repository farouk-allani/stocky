import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger.js";
import { MockAiService } from "./mockAiService.js";

// Initialize Gemini client only if API key is available
let genAI: GoogleGenerativeAI | null = null;
const USE_MOCK = !process.env.GEMINI_API_KEY;

if (!USE_MOCK) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
} else {
  logger.info("Gemini API key not found, using mock AI service");
}

export interface AIAnalysisResult {
  confidence: number;
  tags: string[];
  freshness?: number;
  quality?: number;
  estimatedShelfLife?: number;
  detectedItems: string[];
}

export const analyzeProductImage = async (
  imagePath: string
): Promise<AIAnalysisResult> => {
  try {
    // Use mock service if Gemini is not available
    if (USE_MOCK || !genAI) {
      logger.info("Using mock AI service for image analysis");
      const imageBuffer = fs.readFileSync(imagePath);
      const filename = path.basename(imagePath);
      const mockResult = await MockAiService.analyzeProductImage(
        imageBuffer,
        filename
      );

      // Simple color heuristic enrichment (no paid API)
      let heuristicTags: string[] = [];
      let heuristicDetected: string | null = null;
      try {
        const statsBuf = await sharp(imagePath)
          .resize(128, 128, { fit: "inside" })
          .removeAlpha()
          .raw()
          .toBuffer();
        const pixels = statsBuf.length / 3;
        let rSum = 0,
          gSum = 0,
          bSum = 0;
        for (let i = 0; i < statsBuf.length; i += 3) {
          rSum += statsBuf[i];
          gSum += statsBuf[i + 1];
          bSum += statsBuf[i + 2];
        }
        const r = rSum / pixels;
        const g = gSum / pixels;
        const b = bSum / pixels;
        const avg = (r + g + b) / 3;
        // Heuristic classification
        // Red / Apple
        if (r > 170 && g < 120 && b < 120) {
          heuristicDetected = "Red Apple";
          heuristicTags.push("fruit", "apple", "fresh");
        } else if (g > 165 && r < 140 && b < 140) {
          heuristicDetected = "Leafy Greens";
          heuristicTags.push("vegetable", "greens", "fresh");
        } else if (r > 200 && g > 200 && b > 200) {
          heuristicDetected = "Dairy Product";
          heuristicTags.push("dairy", "white", "perishable");
        } else if (r > 185 && g > 160 && b < 110 && r - b > 70) {
          heuristicDetected = "Bread";
          heuristicTags.push("bakery", "bread", "carbs");
        } else if (r > 180 && g > 180 && b < 150 && (r + g) / 2 - b > 60) {
          // Yellow dominant (banana)
          heuristicDetected = "Banana";
          heuristicTags.push("fruit", "banana", "ripe");
        } else if (avg < 70) {
          heuristicDetected = "Dark Produce";
          heuristicTags.push("produce", "dark", "needs-review");
        }
      } catch (heurErr) {
        // Ignore heuristic failure
      }

      // Filename keyword heuristics
      const baseName = filename.toLowerCase();
      if (/banana/.test(baseName)) {
        if (!heuristicDetected) heuristicDetected = "Banana";
        heuristicTags.push("banana", "fruit", "yellow");
      } else if (/apple/.test(baseName)) {
        if (!heuristicDetected) heuristicDetected = "Apple";
        heuristicTags.push("apple", "fruit");
      } else if (/bread|loaf/.test(baseName)) {
        if (!heuristicDetected) heuristicDetected = "Bread";
        heuristicTags.push("bread", "bakery");
      } else if (/milk/.test(baseName)) {
        if (!heuristicDetected) heuristicDetected = "Milk";
        heuristicTags.push("milk", "dairy");
      }

      const combinedTags = Array.from(
        new Set([...(mockResult.tags || []), ...heuristicTags])
      );
      const detected = heuristicDetected || mockResult.productName;
      const confidenceAdj = heuristicDetected ? 0.92 : 0.85;

      return {
        confidence: confidenceAdj,
        tags: combinedTags,
        freshness: mockResult.freshness,
        quality: mockResult.freshness,
        estimatedShelfLife: mockResult.estimatedShelfLife,
        detectedItems: [detected],
      };
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // Get Gemini Pro Vision model
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt = `Analyze this food product image and provide the following information in JSON format:
    {
      "detectedItems": ["item1", "item2"],
      "freshness": 0.8,
      "quality": 0.9,
      "estimatedShelfLife": 72,
      "tags": ["fresh", "organic", "vegetables"],
      "confidence": 0.95
    }
    
    Where:
    - detectedItems: Array of food items you can identify
    - freshness: Scale 0-1 (0=spoiled, 1=very fresh)
    - quality: Scale 0-1 (0=poor, 1=excellent)
    - estimatedShelfLife: Hours until expiry (estimate)
    - tags: Relevant descriptive tags
    - confidence: Overall confidence in analysis (0-1)`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error("No response from Gemini");
    }

    // Parse the JSON response
    let analysisResult;
    try {
      // Extract JSON from the response (remove any markdown formatting)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      logger.warn(
        "Failed to parse Gemini response as JSON, using fallback",
        parseError
      );
      // Fallback result
      analysisResult = {
        detectedItems: ["unknown food item"],
        freshness: 0.7,
        quality: 0.7,
        estimatedShelfLife: 48,
        tags: ["food", "product"],
        confidence: 0.5,
      };
    }

    logger.info("AI analysis completed", { imagePath, result: analysisResult });

    return analysisResult;
  } catch (error) {
    logger.error("AI analysis failed:", error);

    // Enhanced fallback logic: try mock service, then heuristic, then minimal fallback
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      // Attempt mock service for richer data
      const filename = path.basename(imagePath);
      const mock = await MockAiService.analyzeProductImage(
        imageBuffer,
        filename
      );
      // Apply same heuristic enrichment
      let heuristicTags: string[] = [];
      let heuristicDetected: string | null = null;
      try {
        const statsBuf = await sharp(imagePath)
          .resize(128, 128, { fit: "inside" })
          .removeAlpha()
          .raw()
          .toBuffer();
        const pixels = statsBuf.length / 3;
        let rSum = 0,
          gSum = 0,
          bSum = 0;
        for (let i = 0; i < statsBuf.length; i += 3) {
          rSum += statsBuf[i];
          gSum += statsBuf[i + 1];
          bSum += statsBuf[i + 2];
        }
        const r = rSum / pixels;
        const g = gSum / pixels;
        const b = bSum / pixels;
        const avg = (r + g + b) / 3;
        if (r > 170 && g < 120 && b < 120) {
          heuristicDetected = "Red Apple";
          heuristicTags.push("fruit", "apple", "fresh");
        } else if (g > 165 && r < 140 && b < 140) {
          heuristicDetected = "Leafy Greens";
          heuristicTags.push("vegetable", "greens", "fresh");
        } else if (r > 200 && g > 200 && b > 200) {
          heuristicDetected = "Dairy Product";
          heuristicTags.push("dairy", "white", "perishable");
        } else if (r > 185 && g > 160 && b < 110 && r - b > 70) {
          heuristicDetected = "Bread";
          heuristicTags.push("bakery", "bread", "carbs");
        } else if (r > 180 && g > 180 && b < 150 && (r + g) / 2 - b > 60) {
          heuristicDetected = "Banana";
          heuristicTags.push("fruit", "banana", "ripe");
        } else if (avg < 70) {
          heuristicDetected = "Dark Produce";
          heuristicTags.push("produce", "dark", "needs-review");
        }
      } catch {}
      const baseName = filename.toLowerCase();
      if (/banana/.test(baseName)) {
        if (!heuristicDetected) heuristicDetected = "Banana";
        heuristicTags.push("banana", "fruit", "yellow");
      } else if (/apple/.test(baseName)) {
        if (!heuristicDetected) heuristicDetected = "Apple";
        heuristicTags.push("apple", "fruit");
      } else if (/bread|loaf/.test(baseName)) {
        if (!heuristicDetected) heuristicDetected = "Bread";
        heuristicTags.push("bread", "bakery");
      } else if (/milk/.test(baseName)) {
        if (!heuristicDetected) heuristicDetected = "Milk";
        heuristicTags.push("milk", "dairy");
      }
      const combinedTags = Array.from(
        new Set([...(mock.tags || []), ...heuristicTags])
      );
      const detected = heuristicDetected || mock.productName;
      return {
        confidence: heuristicDetected ? 0.78 : 0.6,
        tags: combinedTags,
        freshness: mock.freshness / 100,
        quality: mock.freshness / 100,
        estimatedShelfLife: mock.estimatedShelfLife,
        detectedItems: [detected],
      };
    } catch (mockErr) {
      logger.warn(
        "Mock AI service fallback failed, applying heuristics",
        mockErr
      );

      // Simple heuristic based on filename keywords
      const base = path.basename(imagePath).toLowerCase();
      const tags: string[] = [];
      if (/apple|banana|orange|fruit/.test(base)) tags.push("fruit", "fresh");
      if (/bread|bakery/.test(base)) tags.push("bakery", "carbs");
      if (/milk|dairy|cheese|yogurt/.test(base)) tags.push("dairy", "protein");
      if (/meat|chicken|beef|pork/.test(base)) tags.push("meat", "protein");
      if (/spinach|lettuce|veg|vegetable/.test(base))
        tags.push("vegetable", "greens");
      const detected = tags.length ? [tags[0]] : ["unknown item"];
      return {
        confidence: tags.length ? 0.45 : 0.2,
        tags: tags.length ? tags : ["needs-review"],
        detectedItems: detected,
        freshness: 0.6,
        quality: 0.55,
        estimatedShelfLife: 48,
      };
    }
  }
};

export const generateProductDescription = async (
  productName: string,
  tags: string[]
): Promise<string> => {
  try {
    // Use mock service if Gemini is not available
    if (USE_MOCK || !genAI) {
      logger.info("Using mock AI service for product description");
      return await MockAiService.generateProductDescription(
        productName,
        tags[0] || "OTHER"
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate a brief, appealing product description for "${productName}" with these characteristics: ${tags.join(
      ", "
    )}. 
    Keep it under 100 words and focus on freshness, quality, and value.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || `Fresh ${productName} - high quality and great value!`;
  } catch (error) {
    logger.error("Description generation failed:", error);
    return `Fresh ${productName} - high quality and great value!`;
  }
};

export const categorizeProduct = async (
  productName: string,
  tags: string[]
): Promise<string> => {
  try {
    const categories = [
      "FRUITS",
      "VEGETABLES",
      "DAIRY",
      "MEAT",
      "SEAFOOD",
      "BAKERY",
      "GRAINS",
      "BEVERAGES",
      "SNACKS",
      "FROZEN",
      "OTHER",
    ];

    // Use mock service if Gemini is not available
    if (USE_MOCK || !genAI) {
      logger.info("Using mock AI service for product categorization");
      const productLower = productName.toLowerCase();

      if (
        productLower.includes("apple") ||
        productLower.includes("fruit") ||
        tags.includes("fruit")
      ) {
        return "FRUITS";
      }
      if (
        productLower.includes("bread") ||
        productLower.includes("bakery") ||
        tags.includes("bakery")
      ) {
        return "BAKERY";
      }
      if (
        productLower.includes("milk") ||
        productLower.includes("dairy") ||
        tags.includes("dairy")
      ) {
        return "DAIRY";
      }
      if (productLower.includes("meat") || tags.includes("meat")) {
        return "MEAT";
      }
      if (productLower.includes("vegetable") || tags.includes("vegetable")) {
        return "VEGETABLES";
      }

      return "OTHER";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Categorize "${productName}" with tags ${tags.join(
      ", "
    )} into one of these categories: ${categories.join(", ")}. 
    Respond with only the category name.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const category = response.text().trim().toUpperCase();

    if (categories.includes(category || "")) {
      return category!;
    }

    return "OTHER";
  } catch (error) {
    logger.error("Categorization failed:", error);
    return "OTHER";
  }
};
