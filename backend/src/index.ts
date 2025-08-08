import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import businessRoutes from "./routes/businesses.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import aiRoutes from "./routes/ai.js";
import hederaRoutes from "./routes/hedera.js";
import paymentsRoutes from "./routes/payments.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";
import { initializeDatabase } from "./config/database.js";
import { initializeRedis } from "./config/redis.js";

// Load environment variables
dotenv.config();

// Global error handlers to avoid silent crashes
process.on("unhandledRejection", (reason: any) => {
  logger.error("Unhandled promise rejection", { reason });
});
process.on("uncaughtException", (err: any) => {
  logger.error("Uncaught exception", { error: err });
});

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Middleware
// Configure helmet to allow cross-origin resource loading so frontend (different port) can display images
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static file serving for uploaded images with explicit CORS/resource headers
const uploadsDir = path.join(process.cwd(), "uploads");
app.use(
  "/uploads",
  (req, res, next) => {
    // Extra safety headers for image assets
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsDir)
);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Handle preflight requests
app.options("*", (req, res) => {
  res.sendStatus(200);
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Environment readiness / status summary
app.get("/api/status", async (req, res) => {
  const dbOk = true; // if initializeDatabase succeeded earlier
  let signerAddress: string | null = null;
  let signerAuthorized: boolean | null = null;
  let contractsSummary: any = {};
  try {
    const { contracts } = await import("./services/evmContracts.js");
    contractsSummary = {
      supplyChain: contracts.supplyChain.address,
      payments: contracts.payments.address,
      carbon: contracts.carbon.address,
    };
    const payments: any = contracts.payments;
    const signer: any =
      (payments as any).signer || (payments as any).provider?.getSigner?.();
    if (signer) {
      signerAddress = await signer.getAddress();
      try {
        signerAuthorized = await payments.authorizedUsers(signerAddress);
      } catch {
        signerAuthorized = null;
      }
    }
  } catch (e) {
    // ignore
  }
  res.json({
    db: dbOk,
    signerAddress,
    signerAuthorized,
    contracts: contractsSummary,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/hedera", hederaRoutes);
app.use("/api/payments", paymentsRoutes);

// Socket.IO for real-time updates
io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on("join-business", (businessId) => {
    socket.join(`business-${businessId}`);
    logger.info(`Client ${socket.id} joined business room: ${businessId}`);
  });

  socket.on("join-user", (userId) => {
    socket.join(`user-${userId}`);
    logger.info(`Client ${socket.id} joined user room: ${userId}`);
  });

  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set("io", io);

// Error handling
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize services and start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info("Database connected successfully");

    // Initialize Redis
    await initializeRedis();
    logger.info("Redis connected successfully");

    // Start server
    server.listen(PORT, () => {
      logger.info(
        `Server running on port ${PORT} in ${
          process.env.NODE_ENV || "development"
        } mode`
      );
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });

    // Periodic on-chain stats sync (placeholder - extend to persist in DB)
    setInterval(async () => {
      try {
        const stats = await (
          await import("./services/evmContracts.js")
        ).contracts.supplyChain.getPlatformStats();
        logger.info("Synced on-chain stats", {
          totalProducts: stats[0].toString(),
          totalBusinesses: stats[1].toString(),
          totalTransactions: stats[2].toString(),
        });
        // TODO: Persist stats into a database table if desired
      } catch (e) {
        logger.warn("Failed on-chain stats sync", e as any);
      }
    }, 60_000); // every 60s
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
  });
});

startServer();

export { app, io };
