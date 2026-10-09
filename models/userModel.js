import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter your name"],
      maxLength: [
        25,
        "Invalid name. Please enter a name with fewer than 25 characters.",
      ],
      minLength: [3, "Name should contain more than 3 characters."],
    },
    email: {
      type: String,
      required: [true, "Please Enter your email"],
      unique: true,
      validate: [validator.isEmail, "Please enter valid email"],
    },
    password: {
      type: String,
      minLength: [8, "Password should be greater than 8 characters"],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
        default: "https://via.placeholder.com/150",
      },
    },
    role: {
      type: String,
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// ✅ Password hashing (Mongoose 7+)
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  this.password = await bcryptjs.hash(this.password, 10);
});

// ✅ JWT Token generation
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ✅ Password verification
userSchema.methods.verifyPassword = async function (userEnteredPassword) {
  return await bcryptjs.compare(userEnteredPassword, this.password);
};

// ✅ Password reset token generation
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

export default mongoose.model("User", userSchema);