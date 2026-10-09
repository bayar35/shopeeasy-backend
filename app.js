import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Security Middleware
import {
  helmetConfig,
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  sanitizeData,
  corsConfig,
} from "./middleware/security.js";

// Error Middleware
import errorMiddleware from "./middleware/error.js";

// Routes
import userRoute from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";
import orderRoute from "./routes/orderRoute.js";

dotenv.config();

const app = express();

// ============================================
// 1. HEALTH CHECK (ХАМГИЙН ТҮРҮҮНД!)
// ============================================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================
// 2. SECURITY MIDDLEWARE
// ============================================

// Helmet — HTTP headers
app.use(helmetConfig);

// CORS — Cross-origin
app.use(cors(corsConfig));

// Compression — Хариултыг шахах
app.use(compression());

// Body Parser — Хэмжээг хязгаарлах
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie Parser
app.use(cookieParser());

// Data Sanitization — NoSQL, XSS, HPP
app.use(sanitizeData);

// ============================================
// 3. RATE LIMITERS
// ============================================

// General Rate Limiter — Бүх API
app.use("/api", generalLimiter);

// Auth routes-д тусгай хатуу limiter
app.use("/api/v1/login", authLimiter);
app.use("/api/v1/register", authLimiter);
app.use("/api/v1/password/forgot", passwordResetLimiter);
app.use("/api/v1/password/reset", passwordResetLimiter);

// ============================================
// 4. ROUTES
// ============================================
app.use("/api/v1", userRoute);
app.use("/api/v1", productRoute);
app.use("/api/v1", orderRoute);

// ============================================
// 5. ERROR HANDLER (хамгийн сүүлд байх ёстой!)
// ============================================
app.use(errorMiddleware);

export default app;