import express from "express";
import { getDatabase } from "../config/database.js";
import { asyncHandler, createError } from "../middleware/errorHandler.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateOrder } from "../utils/validation.js";

const router = express.Router();

// Get orders (with filters for different user roles)
router.get(
  "/",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { status, businessId, page = 1, limit = 20 } = req.query;

    const db = getDatabase();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let where: any = {};

    // Filter based on user role
    if (req.user.role === "CONSUMER") {
      where.customerId = req.user.id;
    } else if (req.user.role === "BUSINESS") {
      // Get user's businesses
      const businesses = await db.business.findMany({
        where: { ownerId: req.user.id },
        select: { id: true },
      });

      const businessIds = businesses.map((b) => b.id);
      if (businessIds.length === 0) {
        return res.json({
          orders: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        });
      }

      where.businessId = { in: businessIds };
    }

    if (status) where.status = status.toUpperCase();
    if (businessId && req.user.role !== "BUSINESS")
      where.businessId = businessId;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          business: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
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
                  expiryDate: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      db.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  })
);

// Get order by ID
router.get(
  "/:id",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;

    const db = getDatabase();

    const order = await db.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            owner: {
              select: {
                id: true,
              },
            },
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw createError("Order not found", 404);
    }

    // Check access permissions
    const hasAccess =
      req.user.role === "ADMIN" ||
      order.customerId === req.user.id ||
      (req.user.role === "BUSINESS" && order.business.owner.id === req.user.id);

    if (!hasAccess) {
      throw createError("Access denied", 403);
    }

    res.json({ order });
  })
);

// Create order
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { error, value } = validateOrder(req.body);
    if (error) {
      throw createError(error.details[0].message, 400);
    }

    const { items, pickupTime, notes, paymentMethod } = value;

    const db = getDatabase();

    // Validate products and calculate totals
    let subtotal = 0;
    let businessId = null;
    const orderItems = [];

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
        include: { business: true },
      });

      if (!product) {
        throw createError(`Product ${item.productId} not found`, 404);
      }

      if (product.status === "EXPIRED") {
        throw createError(`Product ${product.name} is expired`, 400);
      }

      if (product.quantity < item.quantity) {
        throw createError(`Insufficient quantity for ${product.name}`, 400);
      }

      // All products must be from the same business
      if (!businessId) {
        businessId = product.businessId;
      } else if (businessId !== product.businessId) {
        throw createError("All products must be from the same business", 400);
      }

      const itemTotal = product.currentPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.currentPrice,
      });
    }

    // Create order
    const order = await db.order.create({
      data: {
        customerId: req.user.id,
        businessId: businessId!,
        subtotal,
        total: subtotal, // No additional fees for now
        pickupTime,
        notes,
        paymentMethod,
        items: {
          create: orderItems,
        },
      },
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
    });

    // Update product quantities
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Emit real-time notification to business
    const io = req.app.get("io");
    io.to(`business-${businessId}`).emit("newOrder", {
      orderId: order.id,
      customerName: `${req.user.firstName} ${req.user.lastName}`,
      total: order.total,
      itemCount: order.items.length,
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  })
);

// Update order status (Business only)
router.patch(
  "/:id/status",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "CONFIRMED", "PICKED_UP", "CANCELLED"].includes(status)) {
      throw createError("Invalid status", 400);
    }

    const db = getDatabase();

    const order = await db.order.findUnique({
      where: { id },
      include: {
        business: {
          include: {
            owner: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      throw createError("Order not found", 404);
    }

    // Check permissions
    if (req.user.role !== "ADMIN" && order.business.owner.id !== req.user.id) {
      throw createError("Access denied", 403);
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: { status },
      include: {
        business: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Emit real-time notification to customer
    const io = req.app.get("io");
    io.to(`user-${order.customer.id}`).emit("orderStatusUpdate", {
      orderId: order.id,
      status,
      businessName: order.business.name,
    });

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  })
);

export default router;
