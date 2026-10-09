import express from "express";
import cors from "cors"; // 🔥 CORS санг шинээр импортлов
import fileUpload from "express-fileupload";
import product from "./routes/productRoutes.js";
import user from "./routes/userRoutes.js";
import errorHandleMiddleware from "./middleware/error.js";
import cookieParser from "cookie-parser";
import order from "./routes/orderRoutes.js";
import wishlist from "./routes/wishlistRoutes.js";

const app = express();

// =========================================================================
// 🔥 PRODUCTION-READY CORS CONFIGURATION (Энд Сеньёр хамгаалалтыг суулгав)
// =========================================================================
app.use(
  cors({
    origin: function (origin, callback) {
      // Локал хаяг болон vercel.app-аар төгссөн бүх хаягийг шууд зөвшөөрөх уян хатан шийдэл
      if (!origin || origin.includes("localhost") || origin.includes("vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("CORS бодлогоор хандахыг хориглосон байна."));
      }
    },
    credentials: true, // Күүки болон JWT Token дамжуулахад заавал хэрэгтэй
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(fileUpload());
app.use(cookieParser());

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", wishlist);

app.use(errorHandleMiddleware);

export default app;
