import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords for demo accounts
  const hashedPassword = await bcrypt.hash("demo123", 10);

  // Create demo business user
  const businessUser = await prisma.user.create({
    data: {
      email: "demo@business.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      role: "BUSINESS",
      isVerified: true,
      businessType: "RESTAURANT",
      businessName: "Fresh Foods Market",
    },
  });

  // Create demo consumer user
  const consumerUser = await prisma.user.create({
    data: {
      email: "demo@consumer.com",
      password: hashedPassword,
      firstName: "Jane",
      lastName: "Smith",
      role: "CONSUMER",
      isVerified: true,
    },
  });

  // Create business
  const business = await prisma.business.create({
    data: {
      name: "Fresh Foods Market",
      description: "Your local source for fresh, organic produce and groceries",
      address: "123 Main St, New York, NY 10001",
      phone: "+1-555-0123",
      email: "contact@freshfoods.com",
      isVerified: true,
      owner: {
        connect: { id: businessUser.id },
      },
    },
  });

  // Create categories
  const categories = [
    { name: "Produce", description: "Fresh fruits and vegetables" },
    { name: "Bakery", description: "Fresh baked goods" },
    { name: "Dairy", description: "Milk, cheese, and dairy products" },
    { name: "Meat", description: "Fresh meat and poultry" },
    { name: "Beverages", description: "Drinks and beverages" },
  ];

  const categoryIds: string[] = [];
  for (const categoryData of categories) {
    const category = await prisma.category.create({
      data: categoryData,
    });
    categoryIds.push(category.id);
  }

  // Create sample products for the business
  const products = [
    {
      name: "Fresh Organic Apples",
      description: "Crisp and sweet organic apples from local farms",
      category: "PRODUCE",
      originalPrice: 3.99,
      currentPrice: 2.99,
      discount: 1.0,
      quantity: 50,
      unit: "lb",
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: "DISCOUNTED",
      aiConfidence: 0.92,
      aiTags: JSON.stringify(["fresh", "organic", "fruit", "apple"]),
      businessId: business.id,
      categoryId: categoryIds[0], // Produce
    },
    {
      name: "Artisan Sourdough Bread",
      description: "Freshly baked sourdough bread with crispy crust",
      category: "BAKERY",
      originalPrice: 5.99,
      currentPrice: 3.99,
      discount: 2.0,
      quantity: 12,
      unit: "loaf",
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status: "DISCOUNTED",
      aiConfidence: 0.88,
      aiTags: JSON.stringify(["bread", "bakery", "artisan", "sourdough"]),
      businessId: business.id,
      categoryId: categoryIds[1], // Bakery
    },
    {
      name: "Organic Whole Milk",
      description: "Fresh organic milk from grass-fed cows",
      category: "DAIRY",
      originalPrice: 4.49,
      currentPrice: 3.49,
      discount: 1.0,
      quantity: 25,
      unit: "gallon",
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: "DISCOUNTED",
      aiConfidence: 0.95,
      aiTags: JSON.stringify(["milk", "dairy", "organic", "fresh"]),
      businessId: business.id,
      categoryId: categoryIds[2], // Dairy
    },
    {
      name: "Premium Ground Beef",
      description: "Fresh ground beef, 80/20 lean to fat ratio",
      category: "MEAT",
      originalPrice: 8.99,
      currentPrice: 6.99,
      discount: 2.0,
      quantity: 15,
      unit: "lb",
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: "DISCOUNTED",
      aiConfidence: 0.9,
      aiTags: JSON.stringify(["meat", "beef", "ground", "protein"]),
      businessId: business.id,
      categoryId: categoryIds[3], // Meat
    },
    {
      name: "Mixed Greens Salad",
      description: "Fresh mixed organic greens ready to eat",
      category: "PRODUCE",
      originalPrice: 4.99,
      currentPrice: 2.49,
      discount: 2.5,
      quantity: 20,
      unit: "bag",
      expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      status: "DISCOUNTED",
      aiConfidence: 0.85,
      aiTags: JSON.stringify(["salad", "greens", "organic", "vegetables"]),
      businessId: business.id,
      categoryId: categoryIds[0], // Produce
    },
  ];

  const productIds: string[] = [];
  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });
    productIds.push(product.id);
  }

  // Create sample order
  const sampleOrder = await prisma.order.create({
    data: {
      customerId: consumerUser.id,
      businessId: business.id,
      subtotal: 12.97,
      total: 12.97,
      status: "PICKED_UP",
    },
  });

  // Create order items
  const orderItems = [
    {
      orderId: sampleOrder.id,
      productId: productIds[0], // Apples
      quantity: 2,
      price: 2.99,
    },
    {
      orderId: sampleOrder.id,
      productId: productIds[1], // Bread
      quantity: 1,
      price: 3.99,
    },
    {
      orderId: sampleOrder.id,
      productId: productIds[4], // Salad
      quantity: 1,
      price: 2.49,
    },
  ];

  for (const itemData of orderItems) {
    await prisma.orderItem.create({
      data: itemData,
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log("\n📧 Demo Credentials:");
  console.log("┌─────────────────────────────────────────┐");
  console.log("│              BUSINESS USER              │");
  console.log("├─────────────────────────────────────────┤");
  console.log("│ Email:    demo@business.com             │");
  console.log("│ Password: demo123                       │");
  console.log("│ Type:     Restaurant Business           │");
  console.log("│ Name:     John Doe                      │");
  console.log("└─────────────────────────────────────────┘");
  console.log("");
  console.log("┌─────────────────────────────────────────┐");
  console.log("│              CONSUMER USER              │");
  console.log("├─────────────────────────────────────────┤");
  console.log("│ Email:    demo@consumer.com             │");
  console.log("│ Password: demo123                       │");
  console.log("│ Type:     Regular Consumer              │");
  console.log("│ Name:     Jane Smith                    │");
  console.log("└─────────────────────────────────────────┘");
  console.log("");
  console.log("🛍️  Sample Products Created:");
  console.log("• Fresh Organic Apples - $2.99 (was $3.99)");
  console.log("• Artisan Sourdough Bread - $3.99 (was $5.99)");
  console.log("• Organic Whole Milk - $3.49 (was $4.49)");
  console.log("• Premium Ground Beef - $6.99 (was $8.99)");
  console.log("• Mixed Greens Salad - $2.49 (was $4.99)");
  console.log("");
  console.log("📊 Sample order and business data included!");
  console.log("🚀 Ready to test the MVP!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
