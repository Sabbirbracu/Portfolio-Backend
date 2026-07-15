import "dotenv/config";
import mongoose from "mongoose";
import articlesData from "../data/articles.data.js";
import Article from "../models/Article.js";

// Upserts every article from src/data/articles.data.js, keyed by slug.
// Safe to re-run: existing articles are updated in place, never duplicated.
// Usage: npm run migrate:articles
const migrate = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}`);

  for (const data of articlesData) {
    const result = await Article.findOneAndUpdate(
      { slug: data.slug },
      data,
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    console.log(`  upserted: ${result.slug} (${result._id})`);
  }

  const count = await Article.countDocuments();
  console.log(`Done. ${count} articles in the "${mongoose.connection.name}" database.`);

  await mongoose.disconnect();
};

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
