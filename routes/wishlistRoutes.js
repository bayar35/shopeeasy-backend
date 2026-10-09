import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controllers/wishlistController.js";
import { verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

router
  .route("/wishlist")
  .get(verifyUserAuth, getWishlist)
  .post(verifyUserAuth, addToWishlist);

router
  .route("/wishlist/:productId")
  .delete(verifyUserAuth, removeFromWishlist);

export default router;