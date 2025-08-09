import winston from "winston";
import fs from "fs";
import path from "path";

// Detect serverless/Vercel environment
const isServerless = !!process.env.VERCEL || !!process.env.NOW_REGION;

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Resolve a writable log directory. In serverless FS is read-only except /tmp
let logDir = path.join(process.cwd(), "logs");
if (isServerless) {
  logDir = path.join("/tmp", "logs");
}

let fileTransports: winston.transport[] = [];
try {
  // Attempt to create directory (best-effort)
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  // Only add file transports if directory creation succeeded
  fileTransports = [
    new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
    new winston.transports.File({ filename: path.join(logDir, "combined.log") }),
  ];
} catch (e) {
  // Fallback: disable file transports in read-only environments
  // We'll rely solely on console logging
  fileTransports = [];
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "stocky-backend" },
  transports: [
    // Always have a console transport (structured in production)
    new winston.transports.Console({
      format: isServerless
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, stack }) => {
              return stack
                ? `[${timestamp}] ${level}: ${message}\n${stack}`
                : `[${timestamp}] ${level}: ${message}`;
            })
          ),
    }),
    ...fileTransports,
  ],
});

// Provide a helper to note logging mode if needed
logger.debug(`Logger initialized (serverless=${isServerless}) dir=${logDir}`);
