import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import Article from "../models/Article.js";
import { postToArticle } from "../utils/frontMatter.js";

// Publishes every markdown post in src/content/blog to the database (upsert by slug).
// Safe to re-run: existing posts are updated in place and keep their original publish position.
// Edit a .md file, run this again, and the site reflects it. Usage: npm run seed:blog
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../content/blog");

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  const posts = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => postToArticle(fs.readFileSync(path.join(dir, f), "utf8"), f.replace(/\.md$/, "")))
    .sort((a, b) => a.order - b.order);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}`);

  const now = Date.now();
  for (const { article, order } of posts) {
    // Lists are newest-first by createdAt, so `order` 1 gets the newest timestamp. $setOnInsert means a
    // re-run never reshuffles posts that are already published. Timestamps are managed by hand here.
    const result = await Article.findOneAndUpdate(
      { slug: article.slug },
      {
        $set: { ...article, updatedAt: new Date(now) },
        $setOnInsert: { createdAt: new Date(now - order * 60_000) },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true, timestamps: false }
    );
    console.log(`  published: ${result.slug}  (${article.readTime}, ${article.published ? "live" : "draft"})`);
  }

  console.log(`Done. ${await Article.countDocuments()} articles in the "${mongoose.connection.name}" database.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
