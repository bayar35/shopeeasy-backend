import express from "express";
import { chatWithAI } from "../controllers/aiController.js";
import { verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

// AI Chat route
router.route("/ai/chat").post(verifyUserAuth, chatWithAI);

export default router;