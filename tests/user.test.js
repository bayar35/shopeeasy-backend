import request from "supertest";
import app from "../app.js";
import User from "../models/userModel.js";

describe("User API Tests", () => {
  // ⭐ Test хийхийн өмнө DB цэвэрлэх
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // ============================================
  // REGISTER TEST
  // ============================================
  describe("POST /api/v1/register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/v1/register")
        .field("name", "Test User")
        .field("email", "test@example.com")
        .field("password", "password123")
        .field(
          "avatar",
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        );

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe("test@example.com");
    }, 30000);

    it("should fail without avatar", async () => {
      const res = await request(app).post("/api/v1/register").send({
        name: "Test",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    }, 30000);
  });

  // ============================================
  // LOGIN TEST
  // ============================================
  describe("POST /api/v1/login", () => {
    beforeEach(async () => {
      await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        avatar: {
          public_id: "test_avatar",
          url: "https://example.com/avatar.png",
        },
      });
    });

    it("should login with valid credentials", async () => {
      const res = await request(app).post("/api/v1/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
    }, 30000);

    it("should fail with invalid password", async () => {
      const res = await request(app).post("/api/v1/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    }, 30000);

    it("should fail with non-existent email", async () => {
      const res = await request(app).post("/api/v1/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    }, 30000);
  });
});