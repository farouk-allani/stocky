import express from 'express';
import { getDatabase } from '../config/database.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, asyncHandler(async (req: any, res: any) => {
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
      updatedAt: true
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({ user });
}));

// Update user profile
router.put('/profile', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const { firstName, lastName, phone, address } = req.body;
  
  const db = getDatabase();
  
  const user = await db.user.update({
    where: { id: req.user.id },
    data: {
      firstName,
      lastName,
      phone,
      address
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
      updatedAt: true
    }
  });

  res.json({
    message: 'Profile updated successfully',
    user
  });
}));

// Get user orders
router.get('/orders', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const db = getDatabase();
  
  const orders = await db.order.findMany({
    where: { customerId: req.user.id },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          address: true
        }
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              unit: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ orders });
}));

export default router;
