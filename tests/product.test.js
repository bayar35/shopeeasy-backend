import request from "supertest";
import app from "../app.js";
import Product from "../models/productModel.js";

describe("Product API Tests", () => {
  beforeEach(async () => {
    await Product.deleteMany({});
  });

  // ============================================
  // GET ALL PRODUCTS
  // ============================================
  describe("GET /api/v1/products", () => {
    it("should return all products", async () => {
      const res = await request(app).get("/api/v1/products");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.products).toBeDefined();
      expect(Array.isArray(res.body.products)).toBe(true);
    }, 30000);

    it("should return products with keyword", async () => {
      const res = await request(app).get("/api/v1/products?keyword=test");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    }, 30000);
  });

  // ============================================
  // GET PRODUCT DETAILS
  // ============================================
  describe("GET /api/v1/product/:id", () => {
    it("should fail with invalid ID", async () => {
      const res = await request(app).get("/api/v1/product/invalid-id-123");

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    }, 30000);

    it("should fail with non-existent ID", async () => {
      const res = await request(app).get(
        "/api/v1/product/507f1f77bcf86cd799439011"
      );

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    }, 30000);
  });
});