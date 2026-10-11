process.env.NODE_ENV = "test";
process.env.PORT = "5001";

// ⭐ JWT — бүх утгууд string байх ёстой
process.env.JWT_SECRET = "test_jwt_secret_key_12345";
process.env.JWT_SECRET_KEY = "test_jwt_secret_key_12345";
process.env.JWT_EXPIRE = "7d";        // ⭐ string формат
process.env.COOKIE_EXPIRE = "7";       // ⭐ string формат

// ⭐ API key-үүд (mock хийгдэнэ)
process.env.RESEND_API_KEY = "";
process.env.BREVO_API_KEY = "";
process.env.OPENROUTER_API_KEY = "";
process.env.GROQ_API_KEY = "";

// ⭐ Cloudinary (mock хийгдэнэ)
process.env.CLOUDINARY_NAME = "test_cloud";
process.env.CLOUDINARY_API_KEY = "test_key";
process.env.CLOUDINARY_API_SECRET = "test_secret";

// ⭐ Google OAuth
process.env.GOOGLE_CLIENT_ID = "";
process.env.GOOGLE_CLIENT_SECRET = "";