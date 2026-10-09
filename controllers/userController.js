import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import User from "../models/userModel.js";
import { sendToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { verifyGoogleToken } from "../utils/verifyGoogleToken.js";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

// Helper
const formatImageForCloudinary = (imageData) => { /* ... */ };

// 1. REGISTER
export const registerUser = handleAsyncError(async (req, res, next) => { /* ... */ });

// 2. LOGIN
export const loginUser = handleAsyncError(async (req, res, next) => { /* ... */ });

// 3. GOOGLE AUTH
export const googleAuth = handleAsyncError(async (req, res, next) => { /* ... */ });

// 4. LOGOUT
export const logout = handleAsyncError(async (req, res, next) => { /* ... */ });

// 5. FORGOT PASSWORD
export const requestPasswordReset = handleAsyncError(async (req, res, next) => {
  console.log("➡️ Forgot password request:", req.body.email);   // ← функцийн хамгийн эхэнд

  // ... таны user хайх код
  // user олдохгүй бол буцаах хэсгийн өмнө:
  // console.log("➡️ User not found");

  // ... таны token үүсгэх, save хийх код

  // sendEmail дуудахын өмнө:
  console.log("➡️ Sending email to:", user.email);

  // await sendEmail({...});  ← таны код хэвээр

  // sendEmail дууссаны дараа:
  console.log("➡️ Email step done");

  // ... res.status(200).json(...)
});

// 6. RESET PASSWORD
export const resetPassword = handleAsyncError(async (req, res, next) => { /* ... */ });

// 7. GET USER DETAILS
export const getUserDetails = handleAsyncError(async (req, res, next) => { /* ... */ });

// 8. UPDATE PASSWORD
export const updatePassword = handleAsyncError(async (req, res, next) => { /* ... */ });

// 9. UPDATE PROFILE
export const updateProfile = handleAsyncError(async (req, res, next) => { /* ... */ });

// 10. ADMIN — GET ALL USERS
export const getUsersList = handleAsyncError(async (req, res, next) => { /* ... */ });

// 11. ADMIN — GET SINGLE USER
export const getSingleUser = handleAsyncError(async (req, res, next) => { /* ... */ });

// 12. ADMIN — UPDATE USER ROLE
export const updateUserRole = handleAsyncError(async (req, res, next) => { /* ... */ });

// 13. ADMIN — DELETE USER  ⚠️ (энэ байхгүй байна!)
export const deleteUser = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new HandleError("User doesn't exist", 400));
  }
  const imageId = user.avatar?.public_id;
  if (imageId && !imageId.includes("google_avatar")) {
    try {
      await cloudinary.uploader.destroy(imageId);
    } catch (error) {
      console.error("Cloudinary destroy error:", error.message);
    }
  }
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});