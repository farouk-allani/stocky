import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDatabase } from "../config/database.js";
import { asyncHandler, createError } from "../middleware/errorHandler.js";
import { validateRegistration, validateLogin } from "../utils/validation.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Register
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { error, value } = validateRegistration(req.body);
    if (error) {
      throw createError(error.details[0].message, 400);
    }

    const {
      email,
      password,
      firstName,
      lastName,
      role,
      businessName,
      businessType,
    } = value;

    const db = getDatabase();

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      throw createError("User already exists with this email", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        businessName,
        businessType,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        businessName: true,
        businessType: true,
        createdAt: true,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  })
);

// Login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { error, value } = validateLogin(req.body);
    if (error) {
      throw createError(error.details[0].message, 400);
    }

    const { email, password } = value;

    const db = getDatabase();

    // Find user
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        businessName: true,
        businessType: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw createError("Invalid credentials", 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw createError("Invalid credentials", 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
    });
  })
);

// Refresh token
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      throw createError("Refresh token required", 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      const db = getDatabase();
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        throw createError("User not found", 401);
      }

      // Generate new token
      const newToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      res.json({
        message: "Token refreshed successfully",
        token: newToken,
      });
    } catch (error) {
      throw createError("Invalid refresh token", 401);
    }
  })
);

// Get current user
router.get(
  "/me",
  authenticateToken,
  asyncHandler(async (req: any, res) => {
    const db = getDatabase();

    const user = await db.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        businessName: true,
        businessType: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw createError("User not found", 404);
    }

    res.json({
      user,
    });
  })
);

export default router;
