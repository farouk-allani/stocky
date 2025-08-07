// Mock AI Service for development without OpenAI API key
export class MockAiService {
  static async analyzeProductImage(imageBuffer: Buffer, filename: string) {
    // Simulate AI analysis delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock different responses based on filename patterns
    const name = filename.toLowerCase();

    if (name.includes("apple") || name.includes("fruit")) {
      return {
        productName: "Fresh Apple",
        category: "PRODUCE",
        freshness: 85,
        estimatedShelfLife: 7,
        description: "Fresh red apple, good quality",
        suggestedPrice: 1.99,
        tags: ["fruit", "fresh", "organic"],
        nutritionalInfo: {
          calories: 95,
          carbs: "25g",
          fiber: "4g",
          sugar: "19g",
        },
      };
    }

    if (name.includes("bread") || name.includes("bakery")) {
      return {
        productName: "Artisan Bread",
        category: "BAKERY",
        freshness: 75,
        estimatedShelfLife: 3,
        description: "Fresh artisan bread, soft texture",
        suggestedPrice: 3.99,
        tags: ["bread", "bakery", "fresh"],
        nutritionalInfo: {
          calories: 120,
          carbs: "24g",
          fiber: "2g",
          protein: "4g",
        },
      };
    }

    if (name.includes("milk") || name.includes("dairy")) {
      return {
        productName: "Organic Milk",
        category: "DAIRY",
        freshness: 90,
        estimatedShelfLife: 5,
        description: "Fresh organic whole milk",
        suggestedPrice: 4.49,
        tags: ["milk", "dairy", "organic"],
        nutritionalInfo: {
          calories: 150,
          carbs: "12g",
          protein: "8g",
          fat: "8g",
        },
      };
    }

    // Default mock response
    return {
      productName: "Unknown Product",
      category: "OTHER",
      freshness: 70,
      estimatedShelfLife: 5,
      description: "Product detected but needs manual verification",
      suggestedPrice: 2.99,
      tags: ["unknown", "needs-review"],
      nutritionalInfo: {
        calories: 100,
        carbs: "20g",
        protein: "3g",
      },
    };
  }

  static async suggestOptimalPrice(product: any, marketData?: any) {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const basePrice = product.originalPrice || 5.99;
    const freshness = product.freshness || 70;
    const daysToExpiry = product.estimatedShelfLife || 5;

    // Mock dynamic pricing algorithm
    let discountFactor = 1;

    // Apply freshness discount
    if (freshness < 60) {
      discountFactor *= 0.5; // 50% off for low freshness
    } else if (freshness < 80) {
      discountFactor *= 0.7; // 30% off for medium freshness
    }

    // Apply expiry discount
    if (daysToExpiry <= 1) {
      discountFactor *= 0.4; // 60% off for expires today/tomorrow
    } else if (daysToExpiry <= 3) {
      discountFactor *= 0.6; // 40% off for expires in 2-3 days
    }

    const suggestedPrice = Math.max(0.99, basePrice * discountFactor);
    const discountPercentage = Math.round((1 - discountFactor) * 100);

    return {
      originalPrice: basePrice,
      suggestedPrice: Math.round(suggestedPrice * 100) / 100,
      discountPercentage,
      reasoning: [
        `Freshness level: ${freshness}%`,
        `Days to expiry: ${daysToExpiry}`,
        `Applied discount: ${discountPercentage}%`,
      ],
      confidence: 0.85,
      priceRange: {
        min: Math.max(0.99, suggestedPrice * 0.8),
        max: suggestedPrice * 1.2,
      },
    };
  }

  static async generateProductDescription(
    productName: string,
    category: string
  ) {
    // Mock description generation
    await new Promise((resolve) => setTimeout(resolve, 300));

    const descriptions = {
      PRODUCE: `Fresh ${productName.toLowerCase()} sourced from local farms. Perfect for healthy meals and snacks.`,
      DAIRY: `Premium ${productName.toLowerCase()} with rich taste and high nutritional value.`,
      BAKERY: `Artisan ${productName.toLowerCase()} baked fresh daily with quality ingredients.`,
      MEAT: `High-quality ${productName.toLowerCase()} perfect for your favorite recipes.`,
      OTHER: `Quality ${productName.toLowerCase()} at an affordable price.`,
    };

    return (
      descriptions[category as keyof typeof descriptions] || descriptions.OTHER
    );
  }
}
