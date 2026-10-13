import Article from "../models/Article.js";
import Project from "../models/Project.js";

// GET /api/portfolio — aggregate payload for the landing page
export const getPortfolio = async (req, res, next) => {
  try {
    const [featuredProjects, latestArticles, projectCount, articleCount] = await Promise.all([
      Project.find({ "meta.featured": true, visibility: { $ne: "private" } }).sort({ "meta.order": 1, createdAt: -1 }).limit(6),
      Article.find({ published: true }).sort({ createdAt: -1 }).limit(3),
      Project.countDocuments({ visibility: { $ne: "private" } }),
      Article.countDocuments({ published: true }),
    ]);

    res.json({
      success: true,
      message: "Portfolio data fetched",
      data: {
        featuredProjects,
        latestArticles,
        stats: { projects: projectCount, articles: articleCount },
      },
    });
  } catch (err) {
    next(err);
  }
};
