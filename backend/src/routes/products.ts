import express from 'express';
import multer from 'multer';
import path from 'path';
import { getDatabase } from '../config/database.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateProduct } from '../utils/validation.js';
import { analyzeProductImage } from '../services/aiService.js';
import { updateProductPricing } from '../services/pricingService.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all products with filters
router.get('/', asyncHandler(async (req: any, res: any) => {
  const { 
    category, 
    businessId, 
    status = 'ACTIVE',
    minPrice,
    maxPrice,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const db = getDatabase();
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const where: any = {
    status: status.toUpperCase()
  };

  if (category) where.category = category;
  if (businessId) where.businessId = businessId;
  if (minPrice) where.currentPrice = { ...where.currentPrice, gte: parseFloat(minPrice) };
  if (maxPrice) where.currentPrice = { ...where.currentPrice, lte: parseFloat(maxPrice) };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        categoryRef: true,
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: parseInt(limit)
    }),
    db.product.count({ where })
  ]);

  // Calculate average ratings
  const productsWithRatings = products.map(product => ({
    ...product,
    averageRating: product.reviews.length > 0 
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : null,
    reviewCount: product.reviews.length
  }));

  res.json({
    products: productsWithRatings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

// Get product by ID
router.get('/:id', asyncHandler(async (req: any, res: any) => {
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
          phone: true
        }
      },
      categoryRef: true,
      reviews: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!product) {
    throw createError('Product not found', 404);
  }

  const averageRating = product.reviews.length > 0 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : null;

  res.json({
    product: {
      ...product,
      averageRating,
      reviewCount: product.reviews.length
    }
  });
}));

// Create product (Business only)
router.post('/', 
  authenticateToken, 
  requireRole(['BUSINESS']), 
  upload.single('image'),
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
        id: req.body.businessId 
      }
    });

    if (!business) {
      throw createError('Business not found or access denied', 403);
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
        console.warn('AI analysis failed:', error);
      }
    }

    // Create product
    const product = await db.product.create({
      data: {
        ...value,
        imageUrl,
        businessId: business.id,
        aiConfidence: aiAnalysis?.confidence || null,
        aiTags: aiAnalysis?.tags || []
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        categoryRef: true
      }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  })
);

// Update product (Business owner only)
router.put('/:id', 
  authenticateToken, 
  requireRole(['BUSINESS']),
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    
    const db = getDatabase();
    
    // Verify ownership
    const existingProduct = await db.product.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!existingProduct) {
      throw createError('Product not found', 404);
    }

    if (existingProduct.business.ownerId !== req.user.id) {
      throw createError('Access denied', 403);
    }

    const product = await db.product.update({
      where: { id },
      data: req.body,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        categoryRef: true
      }
    });

    res.json({
      message: 'Product updated successfully',
      product
    });
  })
);

// Delete product (Business owner only)
router.delete('/:id', 
  authenticateToken, 
  requireRole(['BUSINESS']),
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    
    const db = getDatabase();
    
    // Verify ownership
    const existingProduct = await db.product.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!existingProduct) {
      throw createError('Product not found', 404);
    }

    if (existingProduct.business.ownerId !== req.user.id) {
      throw createError('Access denied', 403);
    }

    await db.product.delete({ where: { id } });

    res.json({ message: 'Product deleted successfully' });
  })
);

export default router;
