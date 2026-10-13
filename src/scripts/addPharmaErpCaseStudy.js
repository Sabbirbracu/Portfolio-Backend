import "dotenv/config";
import mongoose from "mongoose";
import pharmaErp from "../data/pharmaErpCaseStudy.js";
import Project from "../models/Project.js";
import { mergeScreenImages, moveToTop } from "../services/caseStudyPublisher.js";

// Adds the TechNest Pharma ERP case study (src/data/pharmaErpCaseStudy.js).
//
//   npm run add:pharma-erp                   create it as a PRIVATE draft, first in "Selected Work". Does nothing if it exists.
//   npm run add:pharma-erp -- --top          move it to the very top of Selected Work (homepage) and /projects
//   npm run add:pharma-erp -- --public       make it visible on the site (do this after adding the images)
//   npm run add:pharma-erp -- --update-text  refresh the written case study from the file
//
// Flags combine, e.g. `-- --update-text --top --public`.
// Unlike `npm run migrate`, this NEVER overwrites things you set in the admin panel: banner/gallery images, tour
// screenshots, visibility, links and order are only written on first creation or when you pass the matching flag.
// The text is only rewritten with --update-text, so edits you make in the admin are safe by default.

const flags = new Set(process.argv.slice(2));
const refreshText = flags.has("--update-text");
const putOnTop = flags.has("--top");
const makePublic = flags.has("--public");

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}`);

  const { slug, media, links, visibility, meta, ...text } = pharmaErp;
  const existing = await Project.findOne({ slug }).select("_id visibility caseStudy.screens");

  if (!existing) {
    const last = await Project.findOne().sort({ "meta.order": -1 }).select("meta.order");
    await Project.create({
      slug,
      ...text,
      media,
      links,
      visibility: makePublic ? "public" : visibility,
      meta: { ...meta, order: (last?.meta?.order ?? -1) + 1 },
    });
    await moveToTop(slug);
    console.log(`Created "${slug}" as a ${(makePublic ? "public" : visibility).toUpperCase()} project, first in Selected Work.`);
    console.log("Next: Admin -> Projects -> Edit: add the banner (Media tab) and tour screenshots (In-depth tab), then set Visibility to Public.");
  } else {
    const changes = [];

    if (refreshText) {
      const screens = mergeScreenImages(text.caseStudy.screens, existing.caseStudy?.screens);
      await Project.updateOne({ slug }, { $set: { ...text, caseStudy: { ...text.caseStudy, screens } } }, { runValidators: true });
      changes.push("refreshed the written text (images, tour screenshots, visibility, links and order kept)");
    }
    if (makePublic && existing.visibility !== "public") {
      await Project.updateOne({ slug }, { $set: { visibility: "public" } });
      changes.push("set visibility to public");
    }
    if (putOnTop) {
      await moveToTop(slug);
      changes.push("moved to the top of Selected Work and /projects");
    }

    if (changes.length) changes.forEach((c) => console.log(`"${slug}": ${c}.`));
    else {
      console.log(`"${slug}" already exists (visibility: ${existing.visibility}). Nothing changed.`);
      console.log("Flags: --top (first in Selected Work), --public (show on the site), --update-text (reload the text from the file).");
    }
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
