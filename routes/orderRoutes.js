import express from "express";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";
import {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";

const router = express.Router();

// ============================================
// USER ROUTES
// ============================================
router.route("/new/order").post(verifyUserAuth, newOrder);
router.route("/order/:id").get(verifyUserAuth, getSingleOrder);
router.route("/orders/user").get(verifyUserAuth, myOrders);

// ============================================
// ADMIN ROUTES
// ============================================
router
  .route("/admin/orders")
  .get(verifyUserAuth, roleBasedAccess("admin"), getAllOrders);

router
  .route("/admin/order/:id")
  .put(verifyUserAuth, roleBasedAccess("admin"), updateOrder)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteOrder);

export default router;