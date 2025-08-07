import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger.js";
import { MockAiService } from "./mockAiService.js";

// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null;
const USE_MOCK = !process.env.OPENAI_API_KEY;

if (!USE_MOCK) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  logger.info("OpenAI API key not found, using mock AI service");
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
    // Use mock service if OpenAI is not available
    if (USE_MOCK || !openai) {
      logger.info("Using mock AI service for image analysis");
      const imageBuffer = fs.readFileSync(imagePath);
      const filename = path.basename(imagePath);
      const mockResult = await MockAiService.analyzeProductImage(
        imageBuffer,
        filename
      );

      return {
        confidence: 0.85,
        tags: mockResult.tags,
        freshness: mockResult.freshness,
        quality: mockResult.freshness,
        estimatedShelfLife: mockResult.estimatedShelfLife,
        detectedItems: [mockResult.productName],
      };
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food product image and provide the following information in JSON format:
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
              - confidence: Overall confidence in analysis (0-1)`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    const analysisResult = JSON.parse(content);

    logger.info("AI analysis completed", { imagePath, result: analysisResult });

    return analysisResult;
  } catch (error) {
    logger.error("AI analysis failed:", error);

    // Return fallback result
    return {
      confidence: 0.1,
      tags: ["unanalyzed"],
      detectedItems: ["unknown"],
      freshness: 0.5,
      quality: 0.5,
    };
  }
};

export const generateProductDescription = async (
  productName: string,
  tags: string[]
): Promise<string> => {
  try {
    // Use mock service if OpenAI is not available
    if (USE_MOCK || !openai) {
      logger.info("Using mock AI service for product description");
      return await MockAiService.generateProductDescription(
        productName,
        tags[0] || "OTHER"
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Generate a brief, appealing product description for "${productName}" with these characteristics: ${tags.join(
            ", "
          )}. 
          Keep it under 100 words and focus on freshness, quality, and value.`,
        },
      ],
      max_tokens: 150,
    });

    return (
      response.choices[0]?.message?.content ||
      `Fresh ${productName} - high quality and great value!`
    );
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

    // Use mock service if OpenAI is not available
    if (USE_MOCK || !openai) {
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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Categorize "${productName}" with tags ${tags.join(
            ", "
          )} into one of these categories: ${categories.join(", ")}. 
          Respond with only the category name.`,
        },
      ],
      max_tokens: 10,
    });

    const category = response.choices[0]?.message?.content?.toUpperCase();

    if (categories.includes(category || "")) {
      return category!;
    }

    return "OTHER";
  } catch (error) {
    logger.error("Categorization failed:", error);
    return "OTHER";
  }
};
