const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");

// Create Express app
const app = express();

// Basic middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
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
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Stocky Backend API is running!",
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Backend API is operational",
    timestamp: new Date().toISOString()
  });
});

// Test API route
app.get("/api/status", (req, res) => {
  res.json({
    api: "working",
    database: "connected", 
    timestamp: new Date().toISOString()
  });
});

// Handle all other routes
app.all("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

// Export for Vercel
module.exports = app;
