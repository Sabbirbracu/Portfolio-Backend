import Project from "../models/Project.js";
import AppError from "../utils/AppError.js";

// GET /api/projects
export const getProjects = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.featured === "true") filter["meta.featured"] = true;

    const projects = await Project.find(filter).sort({ "meta.featured": -1, year: -1, createdAt: -1 });
    res.json({ success: true, message: "Projects fetched", data: projects });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:slug
export const getProjectBySlug = async (req, res, next) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) throw new AppError("Project not found", 404);
    res.json({ success: true, message: "Project fetched", data: project });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects (protected)
export const createProject = async (req, res, next) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, message: "Project created", data: project });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id (protected)
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) throw new AppError("Project not found", 404);
    res.json({ success: true, message: "Project updated", data: project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id (protected)
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) throw new AppError("Project not found", 404);
    res.json({ success: true, message: "Project deleted", data: null });
  } catch (err) {
    next(err);
  }
};
