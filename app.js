import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";

import {
  helmetConfig,
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  sanitizeData,
  corsConfig,
} from "./middleware/security.js";

import errorMiddleware from "./middleware/error.js";

// Routes
import userRoute from "./routes/userRoutes.js";
import productRoute from "./routes/productRoutes.js";
import orderRoute from "./routes/orderRoutes.js";
import wishlistRoute from "./routes/wishlistRoutes.js";
import paymentRoute from "./routes/paymentRoutes.js";
import aiRoute from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Security Middleware
app.use(helmetConfig);
app.use(cors(corsConfig));
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(sanitizeData);

// Rate Limiters
app.use("/api", generalLimiter);
app.use("/api/v1/login", authLimiter);
app.use("/api/v1/register", authLimiter);
app.use("/api/v1/password/forgot", passwordResetLimiter);
app.use("/api/v1/password/reset", passwordResetLimiter);

// Routes
app.use("/api/v1", userRoute);
app.use("/api/v1", productRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", wishlistRoute);
app.use("/api/v1", paymentRoute);
app.use("/api/v1", aiRoute);  // ⭐ НЭМЭХ

// Error Handler
app.use(errorMiddleware);

export default app;