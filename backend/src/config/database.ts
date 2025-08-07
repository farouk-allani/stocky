import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

let prisma: PrismaClient;

export const initializeDatabase = async () => {
  try {
    prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    await prisma.$connect();
    logger.info('Database connection established');
    
    return prisma;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!prisma) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return prisma;
};

export const closeDatabase = async () => {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  }
};
