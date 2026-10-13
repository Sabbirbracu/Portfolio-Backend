import Project from "../models/Project.js";

// Helpers for scripts that publish a written case study (src/scripts/addPharmaErpCaseStudy.js).

const blank = (v) => !v || !String(v).trim();

/**
 * Keeps the screenshots attached in the admin panel when the written product tour is refreshed from the file.
 * A screen from the file takes over the image of the existing screen with the same title (or, failing that,
 * the same position). Screens that exist only in the database, added in the admin, are kept at the end.
 */
export const mergeScreenImages = (fileScreens = [], existingScreens = []) => {
  const existing = existingScreens.map((s) => (typeof s?.toObject === "function" ? s.toObject() : s));
  const used = new Set();

  const merged = fileScreens.map((screen, index) => {
    if (!blank(screen.image)) return screen;
    let match = existing.findIndex((e, i) => !used.has(i) && e.title === screen.title);
    if (match === -1 && existing[index] && !used.has(index) && !blank(existing[index].image)) match = index;
    if (match === -1) return screen;
    used.add(match);
    return { ...screen, image: existing[match].image ?? "" };
  });

  existing.forEach((e, i) => {
    if (!used.has(i) && !fileScreens.some((s) => s.title === e.title)) merged.push(e);
  });
  return merged;
};

/**
 * Makes `slug` the first project everywhere (homepage "Selected Work" and /projects) and puts it on the homepage.
 * The admin's drag-and-drop order is `meta.order`, so every project is renumbered 0..n with this one at 0, keeping
 * the others in their current relative order. Returns the new order, for logging.
 */
export const moveToTop = async (slug) => {
  const target = await Project.findOne({ slug }).select("_id");
  if (!target) throw new Error(`Project "${slug}" not found`);

  const others = await Project.find({ _id: { $ne: target._id } })
    .sort({ "meta.order": 1, createdAt: -1 })
    .select("_id slug");
  const ordered = [target, ...others];

  await Project.bulkWrite(
    ordered.map((p, index) => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: p._id.equals(target._id) ? { "meta.order": index, "meta.featured": true } : { "meta.order": index } },
      },
    }))
  );
  return ordered.map((p) => p.slug ?? slug);
};
