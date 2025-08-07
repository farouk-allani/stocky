import express from "express";
import { getDatabase } from "../config/database.js";
import { asyncHandler, createError } from "../middleware/errorHandler.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { validateBusiness } from "../utils/validation.js";

const router = express.Router();

// Get business stats (mock data for demo)
router.get(
  "/stats",
  authenticateToken,
  requireRole(["BUSINESS"]),
  asyncHandler(async (req: any, res: any) => {
    // Mock business stats for demo
    const stats = {
      totalProducts: 24,
      totalRevenue: 2847.65,
      totalOrders: 67,
      averageDiscount: 42,
      wasteReduced: 89.2,
      co2Saved: 156.7,
      monthlyGrowth: 23,
    };

    res.json(stats);
  })
);

// Update business profile (mock)
router.put(
  "/profile",
  authenticateToken,
  requireRole(["BUSINESS"]),
  asyncHandler(async (req: any, res: any) => {
    const profileData = req.body;

    // Mock response
    res.json({ message: "Profile updated successfully", data: profileData });
  })
);

// Get all businesses
router.get(
  "/",
  asyncHandler(async (req: any, res: any) => {
    const { page = 1, limit = 20, search, verified } = req.query;

    const db = getDatabase();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (verified !== undefined) {
      where.isVerified = verified === "true";
    }

    const [businesses, total] = await Promise.all([
      db.business.findMany({
        where,
        include: {
          owner: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          products: {
            where: { status: "ACTIVE" },
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      db.business.count({ where }),
    ]);

    const businessesWithCounts = businesses.map((business) => ({
      ...business,
      productCount: business.products.length,
    }));

    res.json({
      businesses: businessesWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  })
);

// Get business by ID
router.get(
  "/:id",
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;

    const db = getDatabase();

    const business = await db.business.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        products: {
          where: { status: { in: ["ACTIVE", "DISCOUNTED"] } },
          include: {
            categoryRef: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!business) {
      throw createError("Business not found", 404);
    }

    res.json({ business });
  })
);

// Create business
router.post(
  "/",
  authenticateToken,
  requireRole(["BUSINESS"]),
  asyncHandler(async (req: any, res: any) => {
    const { error, value } = validateBusiness(req.body);
    if (error) {
      throw createError(error.details[0].message, 400);
    }

    const db = getDatabase();

    // Check if user already has a business
    const existingBusiness = await db.business.findFirst({
      where: { ownerId: req.user.id },
    });

    if (existingBusiness) {
      throw createError("User already has a business registered", 409);
    }

    const business = await db.business.create({
      data: {
        ...value,
        ownerId: req.user.id,
      },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Business created successfully",
      business,
    });
  })
);

// Update business
router.put(
  "/:id",
  authenticateToken,
  requireRole(["BUSINESS"]),
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;

    const db = getDatabase();

    // Verify ownership
    const existingBusiness = await db.business.findUnique({
      where: { id },
    });

    if (!existingBusiness) {
      throw createError("Business not found", 404);
    }

    if (existingBusiness.ownerId !== req.user.id) {
      throw createError("Access denied", 403);
    }

    const business = await db.business.update({
      where: { id },
      data: req.body,
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: "Business updated successfully",
      business,
    });
  })
);

// Get my businesses (for authenticated business user)
router.get(
  "/my/businesses",
  authenticateToken,
  requireRole(["BUSINESS"]),
  asyncHandler(async (req: any, res: any) => {
    const db = getDatabase();

    const businesses = await db.business.findMany({
      where: { ownerId: req.user.id },
      include: {
        products: {
          select: {
            id: true,
            status: true,
            expiryDate: true,
          },
        },
      },
    });

    const businessesWithStats = businesses.map((business) => {
      const totalProducts = business.products.length;
      const activeProducts = business.products.filter(
        (p) => p.status === "ACTIVE"
      ).length;
      const discountedProducts = business.products.filter(
        (p) => p.status === "DISCOUNTED"
      ).length;
      const expiredProducts = business.products.filter(
        (p) => p.status === "EXPIRED"
      ).length;
      const expiringToday = business.products.filter((p) => {
        const today = new Date().toDateString();
        return new Date(p.expiryDate).toDateString() === today;
      }).length;

      return {
        ...business,
        stats: {
          totalProducts,
          activeProducts,
          discountedProducts,
          expiredProducts,
          expiringToday,
        },
      };
    });

    res.json({ businesses: businessesWithStats });
  })
);

export default router;
