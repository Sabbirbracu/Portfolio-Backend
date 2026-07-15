import express from "express";
import {
  createArticle,
  deleteArticle,
  getArticleBySlug,
  getArticles,
  updateArticle,
} from "../controllers/articleController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getArticles);
router.get("/:slug", getArticleBySlug);
router.post("/", protect, createArticle);
router.put("/:id", protect, updateArticle);
router.delete("/:id", protect, deleteArticle);

export default router;
