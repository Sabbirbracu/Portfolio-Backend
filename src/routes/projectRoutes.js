import express from "express";
import rateLimit from "express-rate-limit";
import {
  createProject,
  deleteProject,
  generateProject,
  getProjectBySlug,
  getProjects,
  reorderProjects,
  updateProject,
} from "../controllers/projectController.js";
import { optionalAuth, protect } from "../middleware/auth.js";

const router = express.Router();

// Each generation is a paid LLM call — cap it even though the route is admin-only.
const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI generations this hour, please try again later" },
});

router.get("/", optionalAuth, getProjects);

// Static paths must be registered before the "/:id" and "/:slug" params below.
router.post("/generate", protect, generateLimiter, generateProject);
router.put("/order", protect, reorderProjects);

router.get("/:slug", optionalAuth, getProjectBySlug);
router.post("/", protect, createProject);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

export default router;
