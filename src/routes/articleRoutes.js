import express from "express";
import {
  createArticle,
  deleteArticle,
  getArticleBySlug,
  getArticles,
  updateArticle,
} from "../controllers/articleController.js";
import { optionalAuth, protect } from "../middleware/auth.js";

const router = express.Router();

// optionalAuth lets the logged-in admin panel see drafts; anonymous visitors only get published posts.
router.get("/", optionalAuth, getArticles);
router.get("/:slug", optionalAuth, getArticleBySlug);
router.post("/", protect, createArticle);
router.put("/:id", protect, updateArticle);
router.delete("/:id", protect, deleteArticle);

export default router;
