import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import User from "../models/userModel.js";
import { sendToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { verifyGoogleToken } from "../utils/verifyGoogleToken.js";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

// ============================================
// HELPER: Base64 data URL-ийг Cloudinary-д зөв форматлах
// ============================================
const formatImageForCloudinary = (imageData) => {
  console.log("=== formatImageForCloudinary DEBUG ===");
  console.log("Type:", typeof imageData);
  console.log("Length:", imageData ? String(imageData).length : 0);
  console.log(
    "First 120 chars:",
    imageData ? String(imageData).substring(0, 120) : "NULL"
  );

  if (!imageData) {
    console.log("→ NULL, returning null");
    return null;
  }

  const str = String(imageData);

  if (str.startsWith("http")) {
    console.log("→ Detected: http URL, returning null");
    return null;
  }

  if (str.startsWith("data:image")) {
    console.log("→ Detected: data URL, returning AS-IS");
    return str;
  }

  console.log("→ Detected: raw base64, wrapping with png prefix");
  return `data:image/png;base64,${str}`;
};

// ============================================
// REGISTER USER
// ============================================
export const registerUser = handleAsyncError(async (req, res, next) => {
  const { name, email, password, avatar } = req.body;

  if (!avatar) {
    return next(new HandleError("Please provide an avatar", 400));
  }

  const formattedImage = formatImageForCloudinary(avatar);

  if (!formattedImage) {
    return next(new HandleError("Invalid image format", 400));
  }

  const myCloud = await cloudinary.uploader.upload(formattedImage, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });
  sendToken(user, 201, res);
});

// ============================================
// LOGIN USER
// ============================================
export const loginUser = handleAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new HandleError("Email or password cannot be empty", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new HandleError("Invalid Email or password", 401));
  }
  if (!user.password) {
    return next(
      new HandleError(
        "This account was created with Google. Please login with Google.",
        401
      )
    );
  }
  const isPasswordValid = await user.verifyPassword(password);
  if (!isPasswordValid) {
    return next(new HandleError("Invalid Email or password", 401));
  }
  sendToken(user, 200, res);
});

// ============================================
// GOOGLE AUTH
// ============================================
export const googleAuth = handleAsyncError(async (req, res, next) => {
  const { credential } = req.body;

  if (!credential) {
    return next(new HandleError("Google credential is required", 400));
  }

  const googleUser = await verifyGoogleToken(credential);

  if (!googleUser) {
    return next(new HandleError("Invalid Google token", 401));
  }

  let user = await User.findOne({ email: googleUser.email });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleUser.googleId;
      if (!user.avatar?.url || user.avatar.url.includes("placeholder")) {
        user.avatar = {
          public_id: "google_avatar",
          url: googleUser.picture,
        };
      }
      await user.save({ validateBeforeSave: false });
    }
  } else {
    user = await User.create({
      name: googleUser.name,
      email: googleUser.email,
      googleId: googleUser.googleId,
      avatar: {
        public_id: "google_avatar",
        url: googleUser.picture,
      },
    });
  }

  sendToken(user, 200, res);
});

// ============================================
// LOGOUT
// ============================================
export const logout = handleAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none", // Cross-origin (Vercel -> Render) ажиллахын тулд
  });
  res.status(200).json({
    success: true,
    message: "Successfully Logged out",
  });
});

// ============================================
// FORGOT PASSWORD
// ============================================
export const requestPasswordReset = handleAsyncError(
  async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new HandleError("User doesn't exist", 400));
    }
    let resetToken;
    try {
      resetToken = user.generatePasswordResetToken();
      await user.save({ validateBeforeSave: false });
    } catch (error) {
      return next(
        new HandleError(
          "Could not save reset token, please try again later",
          500
        )
      );
    }

    // Environment variable ашиглах (Render дээр тохируулна)
    const clientUrl = process.env.CLIENT_URL || "https://shopeeasy-frontend.vercel.app";
    const resetPasswordURL = `${clientUrl}/reset/${resetToken}`;
    const message = `Use the following link to reset your password: ${resetPasswordURL}. \n\n This link will expire in 30 minutes. \n\n If you didn't request a password reset, please ignore this message.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message,
      });
      res.status(200).json({
        success: true,
        message: `Email is sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new HandleError("Email couldn't be sent, please try again later", 500)
      );
    }
  }
);

// ============================================
// RESET PASSWORD
// ============================================
export const resetPassword = handleAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new HandleError(
        "Reset Password token is invalid or has been expired",
        400
      )
    );
  }
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return next(new HandleError("Password doesn't match", 400));
  }
  if (password.length < 8) {
    return next(
      new HandleError("Password should be greater than 8 characters", 400)
    );
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
});

// ============================================
// GET USER DETAILS
// ============================================
export const getUserDetails = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// ============================================
// UPDATE PASSWORD
// ============================================
export const updatePassword = handleAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  const checkedPasswordMatch = await user.verifyPassword(oldPassword);
  if (!checkedPasswordMatch) {
    return next(new HandleError("Old password is incorrect", 400));
  }
  if (newPassword !== confirmPassword) {
    return next(new HandleError("Password doesn't match", 400));
  }
  if (newPassword.length < 8) {
    return next(
      new HandleError("Password should be greater than 8 characters", 400)
    );
  }
  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
});

// ============================================
// UPDATE PROFILE
// ============================================
export const updateProfile = handleAsyncError(async (req, res, next) => {
  const { name, email, avatar } = req.body;

  console.log("=== UPDATE PROFILE DEBUG ===");
  console.log("req.body keys:", Object.keys(req.body));
  console.log("name:", name);
  console.log("email:", email);
  console.log("avatar type:", typeof avatar);
  console.log("avatar length:", avatar ? String(avatar).length : 0);
  console.log(
    "avatar first 80 chars:",
    avatar ? String(avatar).substring(0, 80) : "NULL"
  );
  console.log("req.files:", req.files ? Object.keys(req.files) : "none");

  const updateUserDetails = { name, email };

  // Хэрэв avatar шинэ зураг бол (http биш, base64)
  if (avatar && avatar !== "" && !String(avatar).startsWith("http")) {
    const user = await User.findById(req.user.id);
    const imageId = user.avatar?.public_id;

    // Хуучин зургийг Cloudinary-с устгах (Google avatar биш бол)
    if (imageId && !imageId.includes("google_avatar")) {
      try {
        await cloudinary.uploader.destroy(imageId);
      } catch (error) {
        console.error("Cloudinary destroy error:", error.message);
      }
    }

    const formattedImage = formatImageForCloudinary(avatar);

    if (!formattedImage) {
      return next(new HandleError("Invalid image format", 400));
    }

    const myCloud = await cloudinary.uploader.upload(formattedImage, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    updateUserDetails.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, updateUserDetails, {
    returnDocument: "after",
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Profile Updated successfully",
    user,
  });
});

// ============================================
// ADMIN — GET ALL USERS
// ============================================
export const getUsersList = handleAsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

// ============================================
// ADMIN — GET SINGLE USER
// ============================================
export const getSingleUser = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new HandleError(`User doesn't exist with this id:${req.params.id}`, 400)
    );
  }
  res.status(200).json({
    success: true,
    user,
  });
});

// ============================================
// ADMIN — UPDATE USER ROLE
// ============================================
export const updateUserRole = handleAsyncError(async (req, res, next) => {
  const { role } = req.body;
  const newUserData = { role };
  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!user) {
    return next(new HandleError("User doesn't exist", 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

// ============================================
// ADMIN — DELETE USER
// ============================================
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