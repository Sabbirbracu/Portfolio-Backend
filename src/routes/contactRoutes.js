import express from "express";
import rateLimit from "express-rate-limit";
import {
  deleteContact,
  getContacts,
  submitContact,
  updateContactStatus,
} from "../controllers/contactController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many messages sent, please try again later" },
});

router.post("/", contactLimiter, submitContact);
router.get("/", protect, getContacts);
router.patch("/:id/status", protect, updateContactStatus);
router.delete("/:id", protect, deleteContact);

export default router;
