import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

// ⭐ Test database холболт
beforeAll(async () => {
  const testDbUri =
    process.env.TEST_DB_URI ||
    "mongodb+srv://<username>:<password>@cluster.mongodb.net/test-db";

  try {
    await mongoose.connect(testDbUri);
    console.log("✅ Test DB connected");
  } catch (error) {
    console.error("❌ Test DB connection error:", error.message);
  }
});

// ⭐ Test дууссаны дараа DB-г цэвэрлэх
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  console.log("✅ Test DB cleaned");
});