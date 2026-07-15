import express from "express";
import rateLimit from "express-rate-limit";
import { forgotPassword, login, resetPassword, verifyToken } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again in 15 minutes" },
});

router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.get("/verify", protect, verifyToken);

export default router;
