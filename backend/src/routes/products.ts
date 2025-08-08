import express from "express";
import multer from "multer";
import path from "path";
import { getDatabase } from "../config/database.js";
import { asyncHandler, createError } from "../middleware/errorHandler.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { validateProduct } from "../utils/validation.js";
import { analyzeProductImage } from "../services/aiService.js";
import { updateProductPricing } from "../services/pricingService.js";
import {
  registerProduct as evmRegisterProduct,
  registerBusiness as evmRegisterBusiness,
} from "../services/evmSupplyChainService.js";

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

    const db = getDatabase();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (businessId) {
      where.businessId = businessId;
    }

    if (category && category !== "all") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.currentPrice = {};
      if (minPrice) where.currentPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.currentPrice.lte = parseFloat(maxPrice);
    }

    try {
      const [products, total] = await Promise.all([
        db.product.findMany({
          where,
          include: {
            business: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                isVerified: true,
              },
            },
          },
          skip,
          take: parseInt(limit),
          orderBy: { [sortBy]: sortOrder },
        }),
        db.product.count({ where }),
      ]);

      // Transform the data to match frontend expectations
      const origin = `${req.protocol}://${req.get("host")}`;
      const transformedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        originalPrice: product.originalPrice,
        discountedPrice: product.currentPrice,
        discountPercentage: Math.round(
          ((product.originalPrice - product.currentPrice) /
            product.originalPrice) *
            100
        ),
        expiryDate: product.expiryDate.toISOString().split("T")[0],
        category: product.category,
        imageUrl: product.imageUrl
          ? product.imageUrl.startsWith("/uploads/")
            ? `${origin}${product.imageUrl}`
            : product.imageUrl
          : "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
        businessId: product.businessId,
        businessName: product.business?.name || "Unknown Business",
        location: product.business?.address || "Location not specified",
        latitude: 40.7128, // Mock coordinates for demo
        longitude: -74.006,
        quantity: product.quantity,
        status: product.status,
        isOrganic: false, // Default value since not in schema
        tags: product.aiTags ? JSON.parse(product.aiTags) : [],
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        hederaTransactionId: product.hederaTransactionId,
        productOnChainId: (product as any).productOnChainId || null,
        productOnChainTxHash: (product as any).productOnChainTxHash || null,
        businessWalletAddress: (product.business as any)?.walletAddress || null,
      }));

      res.json({
        products: transformedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Database error:", error);
      // Fallback to mock data if database fails
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
      ];

      // Apply filters to mock data
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

      res.json({
        products: filteredProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredProducts.length,
          pages: Math.ceil(filteredProducts.length / parseInt(limit)),
        },
      });
    }
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
        productOnChainId: (product as any).productOnChainId || null,
        productOnChainTxHash: (product as any).productOnChainTxHash || null,
        businessWalletAddress: (product.business as any)?.walletAddress || null,
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

    // Verify business ownership (fallback: auto-select or create business if none supplied/exists)
    let business = await db.business.findFirst({
      where: {
        ownerId: req.user.id,
        id: req.body.businessId,
      },
    });
    if (!business) {
      // Try any existing business for this owner
      business = await db.business.findFirst({
        where: { ownerId: req.user.id },
      });
    }
    if (!business) {
      // Auto-create minimal business profile so product can be persisted
      business = await db.business.create({
        data: {
          name: req.user.businessName || `${req.user.firstName}'s Business`,
          description: "Auto-created business profile",
          address: req.user.address || "Unknown address",
          phone: req.user.phone || "N/A",
          email: req.user.email,
          ownerId: req.user.id,
        },
      });
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

    // Ensure business registered on-chain (id is business.id)
    let onChainTxHash: string | undefined;
    let onChainProductId: string | undefined;
    try {
      await evmRegisterBusiness(
        business.id,
        business.name,
        req.user.firstName + " " + req.user.lastName
      ).catch(() => {});
      onChainProductId = value.batchNumber
        ? `${value.batchNumber}-${Date.now()}`
        : `p-${Date.now()}`;
      const expirySeconds = Math.floor(
        new Date(value.expiryDate).getTime() / 1000
      );
      const manufacturedSeconds = value.manufacturedDate
        ? Math.floor(new Date(value.manufacturedDate).getTime() / 1000)
        : Math.floor(Date.now() / 1000);
      const priceWei = BigInt(
        Math.round(value.originalPrice * 1e18)
      ).toString();
      const registerHash = await evmRegisterProduct({
        productId: onChainProductId,
        name: value.name,
        businessId: business.id,
        batchNumber: value.batchNumber || "batch-1",
        manufacturedDate: manufacturedSeconds,
        expiryDate: expirySeconds,
        originalPrice: priceWei,
        metadata: JSON.stringify({ category: value.category }),
      });
      onChainTxHash = registerHash;
    } catch (chainErr) {
      console.warn("On-chain product registration failed", chainErr);
    }

    // Ensure category relation exists (by name); create if missing
    let categoryRecord = await db.category.findFirst({
      where: { name: value.category },
    });
    if (!categoryRecord) {
      categoryRecord = await db.category.create({
        data: {
          name: value.category,
          description: `${value.category} products`,
        },
      });
    }

    // Create product (store tx hash if available)
    const product = await db.product.create({
      data: {
        ...value,
        imageUrl,
        businessId: business.id,
        categoryId: categoryRecord.id,
        aiConfidence: aiAnalysis?.confidence || null,
        // aiTags stored as JSON string or null (Prisma expects String / Null)
        aiTags: aiAnalysis?.tags ? JSON.stringify(aiAnalysis.tags) : null,
        hederaTransactionId: onChainTxHash,
        productOnChainId: onChainProductId,
        productOnChainTxHash: onChainTxHash,
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

    // Normalize image URL (absolute) to match GET /api/products formatting
    const origin = `${req.protocol}://${req.get("host")}`;
    const normalizedProduct = {
      ...product,
      imageUrl: product.imageUrl
        ? product.imageUrl.startsWith("/uploads/")
          ? `${origin}${product.imageUrl}`
          : product.imageUrl
        : null,
    };

    res.status(201).json({
      message: "Product created successfully",
      product: normalizedProduct,
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
