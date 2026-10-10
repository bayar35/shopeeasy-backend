import express from "express";
import multer from "multer";
import {
  deleteUser,
  getSingleUser,
  getUserDetails,
  getUsersList,
  googleAuth,
  loginUser,
  logout,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updatePassword,
  updateProfile,
  updateUserRole,
} from "../controllers/userController.js";
import { verifyUserAuth, roleBasedAccess } from "../middleware/userAuth.js";

const router = express.Router();

// ⭐ MULTER — multipart/form-data задлах
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ============================================
// PUBLIC ROUTES
// ============================================
router.route("/register").post(upload.none(), registerUser);
router.route("/login").post(loginUser);
router.route("/auth/google").post(googleAuth);
router.route("/logout").post(logout);
router.route("/password/forgot").post(requestPasswordReset);
router.route("/reset/:token").post(resetPassword);

// ============================================
// USER PROTECTED ROUTES
// ============================================
router.route("/profile").get(verifyUserAuth, getUserDetails);
router.route("/password/update").put(verifyUserAuth, updatePassword);
router
  .route("/profile/update")
  .put(verifyUserAuth, upload.none(), updateProfile);

// ============================================
// ADMIN ROUTES
// ============================================
router
  .route("/admin/users")
  .get(verifyUserAuth, roleBasedAccess("admin"), getUsersList);

router
  .route("/admin/user/:id")
  .get(verifyUserAuth, roleBasedAccess("admin"), getSingleUser)
  .put(verifyUserAuth, roleBasedAccess("admin"), updateUserRole)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteUser);

export default router;