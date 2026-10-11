import { jest } from "@jest/globals";

// ⭐ Cloudinary mock
jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        public_id: "test_public_id",
        secure_url: "https://example.com/test.png",
      }),
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));

// ⭐ OpenRouter mock
jest.mock("../utils/openrouterClient.js", () => ({
  __esModule: true,
  default: {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: "Test AI response" } }],
        }),
      },
    },
  },
  OPENROUTER_MODELS: ["test-model"],
}));

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mongoServer;

beforeAll(async () => {
  console.log("🧪 Starting MongoMemoryServer...");
  
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: "7.0.14",
      arch: "x64",
      downloadDir: path.join(__dirname, "..", ".mongo-binaries"),
    },
    instance: {
      launchTimeout: 120000,
    },
  });
  
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log("🧪 Test MongoDB connected:", uri);
}, 180000);

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
  console.log("🧪 Test MongoDB disconnected");
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});