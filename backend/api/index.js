const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

// Create Express app (serverless handler)
const app = express();

// Core middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: true,
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --- Lazy initialization of full backend (DB, Redis, routes) ---
let initialized = false;
let initError = null;
async function initialize() {
  if (initialized || initError) return;
  try {
    // Load compiled backend pieces (ensure build produced dist/)
    const { initializeDatabase } = require("../dist/config/database.js");
    const { initializeRedis } = require("../dist/config/redis.js");
    const { logger } = require("../dist/utils/logger.js");

    await initializeDatabase();
    try { await initializeRedis(); } catch (e) { logger?.warn?.("Redis init skipped", e); }

    // Static uploads
    const uploadsDir = path.join(process.cwd(), "uploads");
    app.use(
      "/uploads",
      (req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        next();
      },
      express.static(uploadsDir)
    );

    // Import routes
    const authRoutes = require("../dist/routes/auth.js").default;
    const userRoutes = require("../dist/routes/users.js").default;
    const businessRoutes = require("../dist/routes/businesses.js").default;
    const productRoutes = require("../dist/routes/products.js").default;
    const orderRoutes = require("../dist/routes/orders.js").default;
    const aiRoutes = require("../dist/routes/ai.js").default;
    const hederaRoutes = require("../dist/routes/hedera.js").default;
    const paymentsRoutes = require("../dist/routes/payments.js").default;
    const { errorHandler } = require("../dist/middleware/errorHandler.js");

    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/businesses", businessRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api/ai", aiRoutes);
    app.use("/api/hedera", hederaRoutes);
    app.use("/api/payments", paymentsRoutes);

    // Attach error handler & 404 after routes
    app.use(errorHandler);
    app.use((req, res) => {
      res.status(404).json({ error: "Route not found" });
    });

    initialized = true;
    logger?.info?.("Serverless backend initialized");
  } catch (e) {
    initError = e;
    console.error("Initialization failure", e);
  }
}

// Kick off init (non-blocking) so first request is fast; still awaited when needed
initialize();

// Ensure init before hitting API routes (lightweight gate)
app.use(async (req, res, next) => {
  if (!initialized && !initError) {
    try { await initialize(); } catch {/* already captured */}
  }
  if (initError) {
    return res.status(500).json({ error: "Backend init failed", details: initError?.message });
  }
  return next();
});

// Basic health/root (do not depend on full init)
app.get("/", (req, res) => {
  res.json({
    message: "Stocky Backend API is running!",
    initialized,
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: initialized ? "ready" : "initializing",
    initialized,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    api: "working",
    initialized,
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;
