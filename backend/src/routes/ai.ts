import express from "express";
import multer from "multer";
import path from "path";
import { asyncHandler, createError } from "../middleware/errorHandler.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  analyzeProductImage,
  generateProductDescription,
  categorizeProduct,
} from "../services/aiService.js";

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || "uploads/");
  },
  filename: (req, file, cb) => {
    const orig =
      path
        .parse(file.originalname)
        .name.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "image";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `ai-${orig}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880") },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Analyze uploaded image
router.post(
  "/analyze-image",
  authenticateToken,
  upload.single("image"),
  asyncHandler(async (req: any, res: any) => {
    if (!req.file) {
      throw createError("Image file is required", 400);
    }

    try {
      const analysis = await analyzeProductImage(req.file.path);

      res.json({
        message: "Image analyzed successfully",
        analysis,
      });
    } catch (error) {
      throw createError("Failed to analyze image", 500);
    }
  })
);

// Generate product description
router.post(
  "/generate-description",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { productName, tags } = req.body;

    if (!productName) {
      throw createError("Product name is required", 400);
    }

    try {
      const description = await generateProductDescription(
        productName,
        tags || []
      );

      res.json({
        message: "Description generated successfully",
        description,
      });
    } catch (error) {
      throw createError("Failed to generate description", 500);
    }
  })
);

// Categorize product
router.post(
  "/categorize",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { productName, tags } = req.body;

    if (!productName) {
      throw createError("Product name is required", 400);
    }

    try {
      const category = await categorizeProduct(productName, tags || []);

      res.json({
        message: "Product categorized successfully",
        category,
      });
    } catch (error) {
      throw createError("Failed to categorize product", 500);
    }
  })
);

export default router;
