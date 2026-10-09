import express from "express";
import fileUpload from "express-fileupload";
import product from "./routes/productRoutes.js";
import user from "./routes/userRoutes.js";
import errorHandleMiddleware from "./middleware/error.js";
import cookieParser from "cookie-parser";
import order from "./routes/orderRoutes.js";
import wishlist from "./routes/wishlistRoutes.js";   // ← НЭМЭГДСЭН

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(fileUpload());
app.use(cookieParser());

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", wishlist);   // ← НЭМЭГДСЭН

app.use(errorHandleMiddleware);

export default app;