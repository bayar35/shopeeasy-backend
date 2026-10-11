import request from "supertest";
import app from "../app.js";
import Order from "../models/orderModel.js";

describe("Order API Tests", () => {
  beforeEach(async () => {
    await Order.deleteMany({});
  });

  // ============================================
  // UNAUTHORIZED ACCESS
  // ============================================
  describe("GET /api/v1/orders/user", () => {
    it("should fail without authentication", async () => {
      const res = await request(app).get("/api/v1/orders/user");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    }, 30000);
  });

  describe("GET /api/v1/admin/orders", () => {
    it("should fail without admin role", async () => {
      const res = await request(app).get("/api/v1/admin/orders");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    }, 30000);
  });
});