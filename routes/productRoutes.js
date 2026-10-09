import express from "express";
import multer from "multer";  // ⭐ НЭМЭХ
import {
  createProducts,
  ReviewForProduct,
  deleteProduct,
  deleteReview,
  getAdminProducts,
  getAllProducts,
  getProductReviews,
  getSingleProduct,
  updateProduct,
} from "../controllers/productController.js";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

// ⭐ MULTER ТОХИРГОО — memoryStorage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ============================================
// PUBLIC ROUTES
// ============================================
router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getSingleProduct);

// ============================================
// USER ROUTES
// ============================================
router.route("/review").put(verifyUserAuth, ReviewForProduct);

// ============================================
// ADMIN ROUTES
// ============================================
router
  .route("/admin/products")
  .get(verifyUserAuth, roleBasedAccess("admin"), getAdminProducts);

// ⭐ MULTER НЭМЭХ — "images" (plural)
router
  .route("/admin/product/create")
  .post(
    verifyUserAuth,
    roleBasedAccess("admin"),
    upload.array("images"),  // ⭐ ЭНЭ МӨР ЗААВАЛ БАЙХ ЁСТОЙ!
    createProducts
  );

router
  .route("/admin/product/:id")
  .put(
    verifyUserAuth,
    roleBasedAccess("admin"),
    upload.array("images"),  // ⭐ MULTER НЭМЭХ
    updateProduct
  )
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteProduct);

router
  .route("/admin/reviews")
  .get(verifyUserAuth, roleBasedAccess("admin"), getProductReviews)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteReview);

export default router;