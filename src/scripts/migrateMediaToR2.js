import { PutObjectCommand } from "@aws-sdk/client-s3";
import "dotenv/config";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { publicUrlFor, r2, R2_BUCKET } from "../config/r2.js";
import Project from "../models/Project.js";

// Uploads every local image referenced by project documents (paths like
// "/rchms_banner.png", served from the frontend's public/ folder) to R2
// under the "projects/" prefix, then rewrites the DB fields to the public
// R2 URLs. Idempotent: absolute URLs (already migrated) are left untouched.
// Usage: npm run migrate:media

const PUBLIC_DIR = process.env.FRONTEND_PUBLIC_DIR || "/Users/sabbirahmad/Projects/PortfolioSite-main/public";

const CONTENT_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
};

const uploaded = new Map(); // local path -> public URL

const migrateOne = async (localPath) => {
  if (!localPath || /^https?:\/\//.test(localPath)) return localPath; // already remote
  if (uploaded.has(localPath)) return uploaded.get(localPath);

  const filename = path.basename(localPath);
  const filePath = path.join(PUBLIC_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`  SKIP (file not found locally): ${localPath}`);
    return localPath;
  }

  const key = `projects/${filename}`;
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: fs.readFileSync(filePath),
      ContentType: CONTENT_TYPES[path.extname(filename).toLowerCase()] || "application/octet-stream",
    })
  );

  const url = publicUrlFor(key);
  uploaded.set(localPath, url);
  console.log(`  uploaded: ${localPath} -> ${url}`);
  return url;
};

const migrate = async () => {
  for (const name of ["MONGODB_URI", "R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_URL"]) {
    if (!process.env[name]) {
      console.error(`${name} is not set in .env`);
      process.exit(1);
    }
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}`);

  const projects = await Project.find();
  for (const project of projects) {
    console.log(`${project.slug}:`);
    let changed = false;

    if (project.media?.banner) {
      const url = await migrateOne(project.media.banner);
      if (url !== project.media.banner) {
        project.media.banner = url;
        changed = true;
      }
    }
    if (project.media?.thumbnail) {
      const url = await migrateOne(project.media.thumbnail);
      if (url !== project.media.thumbnail) {
        project.media.thumbnail = url;
        changed = true;
      }
    }
    if (project.media?.gallery?.length) {
      const gallery = [];
      for (const img of project.media.gallery) {
        gallery.push(await migrateOne(img));
      }
      if (JSON.stringify(gallery) !== JSON.stringify(project.media.gallery)) {
        project.media.gallery = gallery;
        changed = true;
      }
    }

    if (changed) {
      await project.save();
      console.log(`  DB updated`);
    } else {
      console.log(`  no local media, nothing to do`);
    }
  }

  console.log(`Done. ${uploaded.size} files uploaded to bucket "${R2_BUCKET}".`);
  await mongoose.disconnect();
};

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
