import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";

// ============================================
// 1. HELMET — HTTP Headers хамгаалалт (ЗАСВАР ОРСОН)
// ============================================
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://lh3.googleusercontent.com"],
      scriptSrc: ["'self'", "https://accounts.google.com"],
      connectSrc: ["'self'", "*"], // Энд * тавьснаар API холболтыг хөтөч блок хийхгүй
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
});

// OPTIONS хүсэлтийг rate limit-ээс алгасах функц
const skipOptionsRequests = (req) => req.method === "OPTIONS";

// ============================================
// 2. GENERAL RATE LIMITER (ЗАСВАР ОРСОН)
// ============================================
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Хэт олон хүсэлт илгээлээ. 15 минутын дараа дахин оролдоно уу.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptionsRequests, // OPTIONS хүсэлтийг тоолохгүй
});

// ============================================
// 3. AUTH RATE LIMITER (ЗАСВАР ОРСОН)
// ============================================
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Хэт олон удаа оролдлоо. 15 минутын дараа дахин оролдоно уу.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: skipOptionsRequests, // OPTIONS хүсэлтийг тоолохгүй
});

// ============================================
// 4. PASSWORD RESET RATE LIMITER (ЗАСВАР ОРСОН)
// ============================================
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Хэт олон удаа нууц үг сэргээх хүсэлт илгээлээ. 1 цагийн дараа оролдоно уу.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptionsRequests, // OPTIONS хүсэлтийг тоолохгүй
});

// ============================================
// 5. DATA SANITIZATION
// ============================================
export const sanitizeData = [
  mongoSanitize(),
  xss(),
  hpp(),
];

// ============================================
// 6. CORS CONFIGURATION
// ============================================
export const corsConfig = {
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "https://shopeeasy-frontend.vercel.app", // Сүүлийн налуу зураасгүй зөв байна
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
