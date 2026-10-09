import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";

// ============================================
// 1. HELMET — HTTP Headers хамгаалалт
// ============================================
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://lh3.googleusercontent.com"],
      scriptSrc: ["'self'", "https://accounts.google.com"],
      connectSrc: ["'self'", process.env.CLIENT_URL || "http://localhost:5173"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
});

// ============================================
// 2. GENERAL RATE LIMITER — Бүх API-д
// ============================================
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // 100 хүсэлт
  message: {
    success: false,
    message: "Хэт олон хүсэлт илгээлээ. 15 минутын дараа дахин оролдоно уу.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// 3. AUTH RATE LIMITER — Login/Register/Forgot-д хатуу
// ============================================
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // 5 удаа буруу оролдвол блоклоно
  message: {
    success: false,
    message: "Хэт олон удаа оролдлоо. 15 минутын дараа дахин оролдоно уу.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Амжилттай хүсэлтийг тоохгүй
});

// ============================================
// 4. PASSWORD RESET RATE LIMITER
// ============================================
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 цаг
  max: 3, // 3 удаа л имэйл илгээх боломжтой
  message: {
    success: false,
    message: "Хэт олон удаа нууц үг сэргээх хүсэлт илгээлээ. 1 цагийн дараа оролдоно уу.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// 5. DATA SANITIZATION
// ============================================
export const sanitizeData = [
  mongoSanitize(), // NoSQL Injection
  xss(), // XSS
  hpp(), // Parameter Pollution
];

// ============================================
// 6. CORS CONFIGURATION
// ============================================
export const corsConfig = {
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "https://shopeeasy-frontend.vercel.app",
  ],
  credentials: true, // Cookie дамжуулахад шаардлагатай
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};