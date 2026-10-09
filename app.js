import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";

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

// Routes (⚠️ -s-тэй!)
import userRoute from "./routes/userRoutes.js";
import productRoute from "./routes/productRoutes.js";
import orderRoute from "./routes/orderRoutes.js";
import paymentRoute from "./routes/paymentRoutes.js";
import wishlistRoute from "./routes/wishlistRoutes.js";

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
app.use(helmetConfig);
app.use(cors(corsConfig));
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(sanitizeData);

// ============================================
// 3. RATE LIMITERS
// ============================================
app.use("/api", generalLimiter);
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
app.use("/api/v1", paymentRoute);
app.use("/api/v1", wishlistRoute);

// ============================================
// 5. ERROR HANDLER (хамгийн сүүлд!)
// ============================================
app.use(errorMiddleware);

export default app;