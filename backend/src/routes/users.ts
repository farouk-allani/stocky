import express from "express";
import { getDatabase } from "../config/database.js";
import { asyncHandler, createError } from "../middleware/errorHandler.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get consumer stats (mock data for demo)
router.get(
  "/consumer-stats",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    // Mock consumer stats for demo
    const stats = {
      totalSaved: 156.78,
      totalOrders: 23,
      averageDiscount: 38,
      favoriteStores: ["Green Grocer", "Corner Bakery", "Fresh Market"],
      monthlySpending: 89.45,
      co2Saved: 12.4,
    };

    res.json(stats);
  })
);

// Get user favorites (mock data for demo)
router.get(
  "/favorites",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    // Mock favorites for demo
    const favorites = [
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
      },
    ];

    res.json(favorites);
  })
);

// Add to favorites
router.post(
  "/favorites",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { productId } = req.body;

    // Mock response
    res.json({ message: "Added to favorites", productId });
  })
);

// Remove from favorites
router.delete(
  "/favorites/:productId",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { productId } = req.params;

    // Mock response
    res.json({ message: "Removed from favorites", productId });
  })
);

// Get user profile
router.get(
  "/profile",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const db = getDatabase();

    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        businessName: true,
        businessType: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw createError("User not found", 404);
    }

    res.json({ user });
  })
);

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { firstName, lastName, phone, address } = req.body;

    const db = getDatabase();

    const user = await db.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone,
        address,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        businessName: true,
        businessType: true,
        isVerified: true,
        updatedAt: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      user,
    });
  })
);

// Get user orders
router.get(
  "/orders",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const db = getDatabase();

    const orders = await db.order.findMany({
      where: { customerId: req.user.id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                unit: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ orders });
  })
);

export default router;
