import express from "express";
import { getDatabase } from "../config/database.js";
import { asyncHandler, createError } from "../middleware/errorHandler.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { validateBusiness } from "../utils/validation.js";

const router = express.Router();

// Get business stats (aggregated from DB)
router.get(
  "/stats",
  authenticateToken,
  requireRole(["BUSINESS"]),
  asyncHandler(async (req: any, res: any) => {
    const db = getDatabase();

    // Fetch all businesses owned by the user (usually 1)
    const businesses = await db.business.findMany({
      where: { ownerId: req.user.id },
      include: {
        products: true,
        orders: true,
      },
    });

    if (!businesses.length) {
      return res.json({
        totalProducts: 0,
        totalRevenue: 0,
        totalOrders: 0,
        averageDiscount: 0,
        wasteReduced: 0,
        co2Saved: 0,
        monthlyGrowth: 0,
      });
    }

    // Aggregate across all businesses for this owner
    let totalProducts = 0;
    let totalOrders = 0;
    let totalRevenue = 0;
    let discountSum = 0;
    let discountCount = 0;
    let wasteReducedKg = 0; // heuristic
    let co2SavedKg = 0; // heuristic

    // Order-based month growth calculation
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();
    let currentMonthOrders = 0;
    let lastMonthOrders = 0;

    for (const b of businesses) {
      totalProducts += b.products.length;
      totalOrders += b.orders.length;

      // Revenue: sum of paid orders (or all totals if isPaid unknown)
      for (const o of b.orders) {
        if (o.isPaid || o.isPaid === false) {
          // include regardless, but you could filter
          totalRevenue += o.total;
        }
        const d = new Date(o.createdAt);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear)
          currentMonthOrders++;
        if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear)
          lastMonthOrders++;
      }

      // Product discount + waste heuristics
      for (const p of b.products) {
        if (p.originalPrice > 0) {
          const discPct =
            ((p.originalPrice - p.currentPrice) / p.originalPrice) * 100;
          if (discPct >= 0 && isFinite(discPct)) {
            discountSum += discPct;
            discountCount++;
          }
        }
        // Heuristic: consider discount value * quantity as prevented waste weight proxy
        // Assume each unit ~0.5kg (adjustable)
        const unitWeightKg = 0.5;
        const priceDiff = Math.max(0, p.originalPrice - p.currentPrice);
        // Waste reduced proxy: if discounted, treat portion of quantity kept from waste
        if (priceDiff > 0) {
          wasteReducedKg +=
            unitWeightKg *
            Math.min(
              p.quantity,
              Math.ceil(p.quantity * (priceDiff / p.originalPrice)) || 1
            );
        }
        // CO2 saved proxy: 1kg food waste ~4.5kg CO2e (typical average across food types)
        // We'll use 4.5 multiplier on wasteReducedKg contribution for this product
      }
    }

    // After iterating products compute co2 from waste
    co2SavedKg = wasteReducedKg * 4.5;

    const averageDiscount = discountCount
      ? +(discountSum / discountCount).toFixed(2)
      : 0;
    const wasteReduced = +wasteReducedKg.toFixed(2);
    const co2Saved = +co2SavedKg.toFixed(2);
    let monthlyGrowth = 0;
    if (lastMonthOrders > 0) {
      monthlyGrowth = +(
        ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) *
        100
      ).toFixed(2);
    } else if (currentMonthOrders > 0) {
      monthlyGrowth = 100; // first month baseline
    }

    res.json({
      totalProducts,
      totalRevenue: +totalRevenue.toFixed(2),
      totalOrders,
      averageDiscount,
      wasteReduced, // kg
      co2Saved, // kg CO2e
      monthlyGrowth,
    });
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
      walletAddress: (business as any).walletAddress || null,
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

    res.json({
      business: {
        ...business,
        walletAddress: (business as any)?.walletAddress || null,
      },
    });
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
        walletAddress: req.body.walletAddress || null,
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

// Update business wallet address
router.patch(
  "/:id/wallet",
  authenticateToken,
  requireRole(["BUSINESS", "ADMIN"]),
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const { walletAddress } = req.body;
    if (!walletAddress || typeof walletAddress !== "string") {
      throw createError("walletAddress required", 400);
    }
    const db = getDatabase();
    const business = await db.business.findUnique({
      where: { id },
      include: { owner: true },
    });
    if (!business) throw createError("Business not found", 404);
    if (req.user.role !== "ADMIN" && business.ownerId !== req.user.id) {
      throw createError("Forbidden", 403);
    }
    const updated = await db.business.update({
      where: { id },
      data: { walletAddress } as any,
    });
    res.json({ message: "Wallet address updated", business: updated });
  })
);

export default router;
