import cron from 'node-cron';
import { getDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { io } from '../index.js';

export const updateProductPricing = async () => {
  try {
    const db = getDatabase();
    
    // Get products nearing expiry
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Products expiring in 1 day - 50% discount
    const criticalProducts = await db.product.findMany({
      where: {
        expiryDate: {
          lte: tomorrow
        },
        status: 'ACTIVE',
        quantity: { gt: 0 }
      }
    });

    // Products expiring in 2-3 days - 30% discount
    const urgentProducts = await db.product.findMany({
      where: {
        expiryDate: {
          gte: tomorrow,
          lte: threeDaysFromNow
        },
        status: 'ACTIVE',
        quantity: { gt: 0 }
      }
    });

    // Products expiring in 4-7 days - 15% discount
    const soonExpiringProducts = await db.product.findMany({
      where: {
        expiryDate: {
          gte: threeDaysFromNow,
          lte: sevenDaysFromNow
        },
        status: 'ACTIVE',
        quantity: { gt: 0 }
      }
    });

    let updatedCount = 0;

    // Update critical products (50% off)
    for (const product of criticalProducts) {
      const newPrice = product.originalPrice * 0.5;
      const discount = 50;
      
      await db.product.update({
        where: { id: product.id },
        data: {
          currentPrice: newPrice,
          discount,
          status: 'DISCOUNTED'
        }
      });

      // Log price history
      await db.priceHistory.create({
        data: {
          productId: product.id,
          price: newPrice
        }
      });

      updatedCount++;
      
      // Notify via WebSocket
      io.to(`business-${product.businessId}`).emit('priceUpdate', {
        productId: product.id,
        newPrice,
        discount,
        reason: 'Critical expiry (1 day)'
      });
    }

    // Update urgent products (30% off)
    for (const product of urgentProducts) {
      if (product.discount < 30) { // Only increase discount
        const newPrice = product.originalPrice * 0.7;
        const discount = 30;
        
        await db.product.update({
          where: { id: product.id },
          data: {
            currentPrice: newPrice,
            discount,
            status: 'DISCOUNTED'
          }
        });

        await db.priceHistory.create({
          data: {
            productId: product.id,
            price: newPrice
          }
        });

        updatedCount++;
        
        io.to(`business-${product.businessId}`).emit('priceUpdate', {
          productId: product.id,
          newPrice,
          discount,
          reason: 'Urgent expiry (2-3 days)'
        });
      }
    }

    // Update soon expiring products (15% off)
    for (const product of soonExpiringProducts) {
      if (product.discount < 15) { // Only increase discount
        const newPrice = product.originalPrice * 0.85;
        const discount = 15;
        
        await db.product.update({
          where: { id: product.id },
          data: {
            currentPrice: newPrice,
            discount,
            status: 'DISCOUNTED'
          }
        });

        await db.priceHistory.create({
          data: {
            productId: product.id,
            price: newPrice
          }
        });

        updatedCount++;
        
        io.to(`business-${product.businessId}`).emit('priceUpdate', {
          productId: product.id,
          newPrice,
          discount,
          reason: 'Soon expiring (4-7 days)'
        });
      }
    }

    // Mark expired products
    const expiredProducts = await db.product.updateMany({
      where: {
        expiryDate: {
          lt: new Date()
        },
        status: { not: 'EXPIRED' }
      },
      data: {
        status: 'EXPIRED'
      }
    });

    logger.info('Pricing update completed', {
      updatedCount,
      expiredCount: expiredProducts.count,
      criticalCount: criticalProducts.length,
      urgentCount: urgentProducts.length,
      soonExpiringCount: soonExpiringProducts.length
    });

    return { updatedCount, expiredCount: expiredProducts.count };
    
  } catch (error) {
    logger.error('Pricing update failed:', error);
    throw error;
  }
};

// Schedule pricing updates every hour
export const startPricingScheduler = () => {
  cron.schedule('0 * * * *', async () => {
    logger.info('Starting scheduled pricing update');
    try {
      await updateProductPricing();
    } catch (error) {
      logger.error('Scheduled pricing update failed:', error);
    }
  });
  
  logger.info('Pricing scheduler started (runs every hour)');
};
