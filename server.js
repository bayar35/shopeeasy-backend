import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "config", "config.env") });

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { v2 as cloudinary } from "cloudinary";

console.log("Current directory:", process.cwd());
console.log("Env file path:", path.join(__dirname, "config", "config.env"));
console.log("ENV variables:", {
  PORT: process.env.PORT,
  DB_URI: process.env.DB_URI ? "exists" : "missing",
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ? "exists" : "missing",
  CLOUDINARY_NAME: process.env.CLOUDINARY_NAME ? "exists" : "missing",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "exists" : "missing",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
    ? "exists"
    : "missing",
  SMTP_MAIL: process.env.SMTP_MAIL ? "exists" : "missing",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const port = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  const server = app.listen(port, () => {
    console.log(`🚀 Server is running on PORT ${port}`);
  });

  process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Server is shutting down due to unhandled promise rejection`);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();

process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Server is shutting down due to uncaught exception error`);
  process.exit(1);
});