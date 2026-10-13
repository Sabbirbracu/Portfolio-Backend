import mongoose from "mongoose";
import Project from "../models/Project.js";
import { ensureUniqueSlug, generateProjectDraft } from "../services/projectGenerator.js";
import AppError from "../utils/AppError.js";

// Server-managed fields a client must never overwrite (the admin form sends back the whole document).
const stripManagedFields = (body = {}) => {
  const { id, _id, __v, createdAt, updatedAt, ...rest } = body;
  return rest;
};

// Anonymous visitors never see "private" projects; the logged-in admin panel asks for everything.
const visibilityFilter = (req) =>
  req.admin && req.query.includeHidden === "true" ? {} : { visibility: { $ne: "private" } };

// GET /api/projects  (?type=, ?featured=true, ?includeHidden=true with an admin token)
export const getProjects = async (req, res, next) => {
  try {
    const filter = visibilityFilter(req);
    if (req.query.type) filter.type = req.query.type;
    if (req.query.featured === "true") filter["meta.featured"] = true;

    // The admin's drag-and-drop order (meta.order) is the one source of truth, on the homepage
    // and on the All Projects page. Ties (e.g. legacy rows all at 0) fall back to newest first.
    const projects = await Project.find(filter).sort({ "meta.order": 1, createdAt: -1 });
    res.json({ success: true, message: "Projects fetched", data: projects });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:slug
export const getProjectBySlug = async (req, res, next) => {
  try {
    // A logged-in admin can open a private project directly, to preview a draft on the real site.
    // The public list never includes private projects either way.
    const filter = req.admin ? { slug: req.params.slug } : { slug: req.params.slug, visibility: { $ne: "private" } };
    const project = await Project.findOne(filter);
    if (!project) throw new AppError("Project not found", 404);
    res.json({ success: true, message: "Project fetched", data: project });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects (protected)
export const createProject = async (req, res, next) => {
  try {
    const body = stripManagedFields(req.body);
    // Append to the end of the admin's order; reordering is done by drag-and-drop.
    const last = await Project.findOne().sort({ "meta.order": -1 }).select("meta.order");
    body.meta = { ...body.meta, order: (last?.meta?.order ?? -1) + 1 };

    const project = await Project.create(body);
    res.status(201).json({ success: true, message: "Project created", data: project });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id (protected)
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, stripManagedFields(req.body), {
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

// PUT /api/projects/order (protected)
// Body: { ids: string[] } — project ids in the desired display order (the admin sends the full list).
// Position i becomes meta.order = i, which drives both the homepage and the All Projects page.
export const reorderProjects = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 500) {
      throw new AppError("ids must be a non-empty array of project ids", 400);
    }
    if (!ids.every((id) => mongoose.isValidObjectId(id)) || new Set(ids).size !== ids.length) {
      throw new AppError("ids must be unique, valid project ids", 400);
    }

    await Project.bulkWrite(
      ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { "meta.order": index } } } }))
    );

    const projects = await Project.find().sort({ "meta.order": 1, createdAt: -1 });
    res.json({ success: true, message: "Order saved", data: projects });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/generate (protected)
// Body: { notes: string } — returns an unsaved draft for the admin to review, add images to, and save.
export const generateProject = async (req, res, next) => {
  try {
    const draft = await generateProjectDraft(req.body?.notes);
    draft.slug = await ensureUniqueSlug(draft.slug);
    res.json({ success: true, message: "Project draft generated", data: draft });
  } catch (err) {
    next(err);
  }
};
