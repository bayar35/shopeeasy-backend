import express from "express";
import { getDashboardStats } from "../controllers/analyticsController.js";
import { verifyUserAuth, roleBasedAccess } from "../middleware/userAuth.js";

const router = express.Router();

// ⭐ Admin — Analytics Dashboard
router
  .route("/admin/analytics")
  .get(verifyUserAuth, roleBasedAccess("admin"), getDashboardStats);

export default router;