import Article from "../models/Article.js";
import AppError from "../utils/AppError.js";

// GET /api/articles
export const getArticles = async (req, res, next) => {
  try {
    const filter = req.admin ? {} : { published: true };
    const articles = await Article.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, message: "Articles fetched", data: articles });
  } catch (err) {
    next(err);
  }
};

// GET /api/articles/:slug
export const getArticleBySlug = async (req, res, next) => {
  try {
    // Drafts are visible to the admin only; for everyone else an unpublished post simply doesn't exist.
    const filter = req.admin ? { slug: req.params.slug } : { slug: req.params.slug, published: true };
    const article = await Article.findOne(filter);
    if (!article) throw new AppError("Article not found", 404);
    res.json({ success: true, message: "Article fetched", data: article });
  } catch (err) {
    next(err);
  }
};

// POST /api/articles (protected)
export const createArticle = async (req, res, next) => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json({ success: true, message: "Article created", data: article });
  } catch (err) {
    next(err);
  }
};

// PUT /api/articles/:id (protected)
export const updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!article) throw new AppError("Article not found", 404);
    res.json({ success: true, message: "Article updated", data: article });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/articles/:id (protected)
export const deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) throw new AppError("Article not found", 404);
    res.json({ success: true, message: "Article deleted", data: null });
  } catch (err) {
    next(err);
  }
};
