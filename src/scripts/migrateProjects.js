import "dotenv/config";
import mongoose from "mongoose";
import projectsData from "../data/projects.data.js";
import Project from "../models/Project.js";

// Upserts every project from src/data/projects.data.js, keyed by slug.
// Safe to re-run: existing projects are updated in place, never duplicated.
// Usage: node src/scripts/migrateProjects.js
const migrate = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}`);

  for (const data of projectsData) {
    const result = await Project.findOneAndUpdate(
      { slug: data.slug },
      data,
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    console.log(`  upserted: ${result.slug} (${result._id})`);
  }

  const count = await Project.countDocuments();
  console.log(`Done. ${count} projects in the "${mongoose.connection.name}" database.`);

  await mongoose.disconnect();
};

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
