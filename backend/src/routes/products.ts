import express from "express";
import multer from "multer";
import path from "path";
import { getDatabase } from "../config/database.js";
import { asyncHandler, createError } from "../middleware/errorHandler.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { validateProduct } from "../utils/validation.js";
import { analyzeProductImage } from "../services/aiService.js";
import { updateProductPricing } from "../services/pricingService.js";

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880") },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Get all products with filters
router.get(
  "/",
  asyncHandler(async (req: any, res: any) => {
    const {
      category,
      businessId,
      status = "ACTIVE",
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Mock products data for demo
    const mockProducts = [
      {
        id: "1",
        name: "Organic Bananas",
        description:
          "Fresh organic bananas, slightly overripe - perfect for smoothies!",
        originalPrice: 4.99,
        discountedPrice: 2.99,
        discountPercentage: 40,
        expiryDate: "2025-08-09",
        category: "Fruits",
        imageUrl:
          "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
        businessId: "1",
        businessName: "Green Grocer",
        location: "Downtown Market, 123 Main St",
        latitude: 40.7128,
        longitude: -74.006,
        quantity: 15,
        status: "ACTIVE",
        isOrganic: true,
        tags: ["organic", "fruit", "healthy"],
        createdAt: "2025-08-07T08:00:00Z",
        updatedAt: "2025-08-07T08:00:00Z",
        hederaTransactionId: "0.0.123456@1691404800.123456789",
      },
      {
        id: "2",
        name: "Artisan Bread",
        description:
          "Freshly baked sourdough bread from this morning, ends today!",
        originalPrice: 8.99,
        discountedPrice: 4.99,
        discountPercentage: 44,
        expiryDate: "2025-08-08",
        category: "Bakery",
        imageUrl:
          "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400",
        businessId: "2",
        businessName: "Corner Bakery",
        location: "Artisan Street, 456 Baker Ave",
        latitude: 40.7589,
        longitude: -73.9851,
        quantity: 8,
        status: "ACTIVE",
        isOrganic: false,
        tags: ["bread", "bakery", "artisan"],
        createdAt: "2025-08-07T06:00:00Z",
        updatedAt: "2025-08-07T06:00:00Z",
        hederaTransactionId: "0.0.789012@1691404801.987654321",
      },
      {
        id: "3",
        name: "Premium Yogurt",
        description:
          "Greek yogurt variety pack, expires tomorrow but still delicious!",
        originalPrice: 12.99,
        discountedPrice: 6.99,
        discountPercentage: 46,
        expiryDate: "2025-08-08",
        category: "Dairy",
        imageUrl:
          "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
        businessId: "1",
        businessName: "Green Grocer",
        location: "Downtown Market, 123 Main St",
        latitude: 40.7128,
        longitude: -74.006,
        quantity: 12,
        status: "ACTIVE",
        isOrganic: true,
        tags: ["dairy", "protein", "healthy"],
        createdAt: "2025-08-07T07:30:00Z",
        updatedAt: "2025-08-07T07:30:00Z",
        hederaTransactionId: "0.0.345678@1691404802.111222333",
      },
      {
        id: "4",
        name: "Fresh Salmon Fillets",
        description: "Premium Atlantic salmon, perfect for tonight's dinner",
        originalPrice: 18.99,
        discountedPrice: 12.99,
        discountPercentage: 32,
        expiryDate: "2025-08-08",
        category: "Seafood",
        imageUrl:
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
        businessId: "3",
        businessName: "Ocean Fresh Market",
        location: "Seaside Plaza, 789 Ocean Blvd",
        latitude: 40.759,
        longitude: -73.9845,
        quantity: 6,
        status: "ACTIVE",
        isOrganic: false,
        tags: ["seafood", "protein", "fresh"],
        createdAt: "2025-08-07T09:00:00Z",
        updatedAt: "2025-08-07T09:00:00Z",
        hederaTransactionId: "0.0.567890@1691404803.444555666",
      },
      {
        id: "5",
        name: "Organic Baby Spinach",
        description: "Fresh organic spinach leaves, great for salads",
        originalPrice: 6.99,
        discountedPrice: 3.99,
        discountPercentage: 43,
        expiryDate: "2025-08-09",
        category: "Vegetables",
        imageUrl:
          "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
        businessId: "1",
        businessName: "Green Grocer",
        location: "Downtown Market, 123 Main St",
        latitude: 40.7128,
        longitude: -74.006,
        quantity: 20,
        status: "ACTIVE",
        isOrganic: true,
        tags: ["vegetables", "organic", "healthy"],
        createdAt: "2025-08-07T10:00:00Z",
        updatedAt: "2025-08-07T10:00:00Z",
        hederaTransactionId: "0.0.234567@1691404804.777888999",
      },
    ];

    // Apply filters
    let filteredProducts = mockProducts;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.businessName.toLowerCase().includes(searchLower)
      );
    }

    if (category && category !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (businessId) {
      filteredProducts = filteredProducts.filter(
        (product) => product.businessId === businessId
      );
    }

    if (minPrice) {
      filteredProducts = filteredProducts.filter(
        (product) => product.discountedPrice >= parseFloat(minPrice)
      );
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(
        (product) => product.discountedPrice <= parseFloat(maxPrice)
      );
    }

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    res.json({
      products: paginatedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredProducts.length,
        pages: Math.ceil(filteredProducts.length / parseInt(limit)),
      },
    });
  })
);

// Get product by ID
router.get(
  "/:id",
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;

    const db = getDatabase();

    const product = await db.product.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        categoryRef: true,
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      throw createError("Product not found", 404);
    }

    const averageRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : null;

    res.json({
      product: {
        ...product,
        averageRating,
        reviewCount: product.reviews.length,
      },
    });
  })
);

// Create product (Business only)
router.post(
  "/",
  authenticateToken,
  requireRole(["BUSINESS"]),
  upload.single("image"),
  asyncHandler(async (req: any, res: any) => {
    const { error, value } = validateProduct(req.body);
    if (error) {
      throw createError(error.details[0].message, 400);
    }

    const db = getDatabase();

    // Verify business ownership
    const business = await db.business.findFirst({
      where: {
        ownerId: req.user.id,
        id: req.body.businessId,
      },
    });

    if (!business) {
      throw createError("Business not found or access denied", 403);
    }

    let imageUrl = null;
    let aiAnalysis = null;

    // Process uploaded image
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;

      // Analyze image with AI
      try {
        aiAnalysis = await analyzeProductImage(req.file.path);
      } catch (error) {
        console.warn("AI analysis failed:", error);
      }
    }

    // Create product
    const product = await db.product.create({
      data: {
        ...value,
        imageUrl,
        businessId: business.id,
        aiConfidence: aiAnalysis?.confidence || null,
        aiTags: aiAnalysis?.tags || [],
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        categoryRef: true,
      },
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  })
);

// Update product (Business owner only)
router.put(
  "/:id",
  authenticateToken,
  requireRole(["BUSINESS"]),
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;

    const db = getDatabase();

    // Verify ownership
    const existingProduct = await db.product.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!existingProduct) {
      throw createError("Product not found", 404);
    }

    if (existingProduct.business.ownerId !== req.user.id) {
      throw createError("Access denied", 403);
    }

    const product = await db.product.update({
      where: { id },
      data: req.body,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        categoryRef: true,
      },
    });

    res.json({
      message: "Product updated successfully",
      product,
    });
  })
);

// Delete product (Business owner only)
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["BUSINESS"]),
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;

    const db = getDatabase();

    // Verify ownership
    const existingProduct = await db.product.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!existingProduct) {
      throw createError("Product not found", 404);
    }

    if (existingProduct.business.ownerId !== req.user.id) {
      throw createError("Access denied", 403);
    }

    await db.product.delete({ where: { id } });

    res.json({ message: "Product deleted successfully" });
  })
);

export default router;
