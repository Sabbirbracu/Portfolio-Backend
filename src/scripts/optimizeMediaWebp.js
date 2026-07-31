import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import "dotenv/config";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { publicUrlFor, r2, R2_BUCKET } from "../config/r2.js";
import Project from "../models/Project.js";

/**
 * Replaces the PNG project media on R2 with pre-generated WebP versions.
 *
 * Safe order of operations:
 *   1. Upload every .webp to R2
 *   2. Verify each uploaded .webp is publicly reachable (HTTP 200)
 *   3. Rewrite the DB media URLs from .png -> .webp
 *   4. Only then delete the now-orphaned .png objects from R2
 *
 * Idempotent: re-running re-uploads the webp and re-points the DB; the png
 * delete step simply no-ops if they're already gone.
 *
 * Usage: npm run migrate:webp
 */

const PUBLIC_DIR =
  process.env.FRONTEND_PUBLIC_DIR ||
  "/Users/sabbirahmad/Projects/PortfolioSite-main/public";

// Local webp file -> R2 key. Project images keep the projects/ prefix; the
// About profile image goes under about/.
const PROJECT_BASENAMES = [
  "rchms_banner",
  "rchms1",
  "rchms2",
  "rchms3",
  "Shaadimart_banner",
  "Shaadimart1",
  "Shaadimart2",
  "Shaadimart3",
];

const uploadPlan = [
  ...PROJECT_BASENAMES.map((b) => ({
    local: `${b}.webp`,
    key: `projects/${b}.webp`,
    oldPngKey: `projects/${b}.png`,
  })),
  { local: "img.webp", key: "about/img.webp", oldPngKey: null },
];

const putWebp = async (localFile, key) => {
  const filePath = path.join(PUBLIC_DIR, localFile);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Local file not found: ${filePath}`);
  }
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: fs.readFileSync(filePath),
      ContentType: "image/webp",
    })
  );
  return publicUrlFor(key);
};

const verifyPublic = async (url) => {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Public URL not reachable (${res.status}): ${url}`);
  const type = res.headers.get("content-type");
  return type;
};

const run = async () => {
  for (const name of ["MONGODB_URI", "R2_ENDPOINT", "R2_BUCKET", "R2_PUBLIC_URL"]) {
    if (!process.env[name]) {
      console.error(`${name} is not set in .env`);
      process.exit(1);
    }
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}\n`);

  // 1. Upload webp
  console.log("1) Uploading WebP files to R2:");
  const uploaded = [];
  for (const item of uploadPlan) {
    const url = await putWebp(item.local, item.key);
    uploaded.push({ ...item, url });
    console.log(`   ✓ ${item.local} -> ${item.key}`);
  }

  // 2. Verify public reachability before any deletion
  console.log("\n2) Verifying uploaded WebP is publicly reachable:");
  for (const u of uploaded) {
    const type = await verifyPublic(u.url);
    console.log(`   ✓ ${u.key} (${type})`);
  }

  // 3. Rewrite DB media URLs .png -> .webp (only R2-hosted URLs)
  console.log("\n3) Rewriting project media URLs in MongoDB:");
  const toWebp = (url) =>
    typeof url === "string" && url.startsWith(process.env.R2_PUBLIC_URL) && url.endsWith(".png")
      ? url.slice(0, -4) + ".webp"
      : url;

  const projects = await Project.find();
  for (const project of projects) {
    let changed = false;
    if (project.media?.banner) {
      const next = toWebp(project.media.banner);
      if (next !== project.media.banner) {
        project.media.banner = next;
        changed = true;
      }
    }
    if (project.media?.gallery?.length) {
      const next = project.media.gallery.map(toWebp);
      if (JSON.stringify(next) !== JSON.stringify(project.media.gallery)) {
        project.media.gallery = next;
        changed = true;
      }
    }
    if (changed) {
      await project.save();
      console.log(`   ✓ ${project.slug} media -> .webp`);
    }
  }

  // 4. Delete orphaned .png objects from R2
  console.log("\n4) Deleting old PNG objects from R2:");
  for (const item of uploadPlan) {
    if (!item.oldPngKey) continue;
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: item.oldPngKey }));
    console.log(`   ✓ deleted ${item.oldPngKey}`);
  }

  console.log("\nDone. R2 now serves WebP; DB points to .webp URLs.");
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("\nFAILED:", err.message);
  process.exit(1);
});
