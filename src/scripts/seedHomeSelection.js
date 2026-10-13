import "dotenv/config";
import mongoose from "mongoose";
import Project from "../models/Project.js";

// One-time: gives every project a sequential display order (meta.order) and marks the homepage
// selection, matching what the site showed before ordering became editable. The homepage
// projects come first, the rest follow newest-first. After this, manage everything by
// drag-and-drop in Admin -> Projects. Safe to re-run (it resets the order). Usage: npm run seed:home
const HOME_ORDER = ["rchms", "shaadimartbd", "ai-customer-support"];

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);

  const all = await Project.find().sort({ year: -1, createdAt: -1 });
  const home = HOME_ORDER.map((slug) => all.find((p) => p.slug === slug)).filter(Boolean);
  const rest = all.filter((p) => !HOME_ORDER.includes(p.slug));

  for (const slug of HOME_ORDER) if (!all.some((p) => p.slug === slug)) console.log(`  (not found in database: ${slug})`);

  const ordered = [...home, ...rest];
  await Project.bulkWrite(
    ordered.map((p, index) => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { "meta.order": index, "meta.featured": HOME_ORDER.includes(p.slug) } },
      },
    }))
  );
  ordered.forEach((p, i) => console.log(`  ${String(i + 1).padStart(2, "0")}. ${p.slug}${HOME_ORDER.includes(p.slug) ? "  (homepage)" : ""}`));

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
