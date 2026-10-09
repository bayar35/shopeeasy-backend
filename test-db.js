import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "backend/config/config.env" });

const uri = process.env.DB_URI;
console.log("Testing URI:", uri ? uri.replace(/:[^:@]+@/, ":****@") : "❌ DB_URI missing");

try {
  const conn = await mongoose.connect(uri);
  console.log("✅ MongoDB Connected:", conn.connection.host);
  process.exit(0);
} catch (error) {
  console.error("❌ Connection failed:", error.message);
  process.exit(1);
}