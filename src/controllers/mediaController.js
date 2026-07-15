import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";
import { publicUrlFor, r2, R2_BUCKET } from "../config/r2.js";
import AppError from "../utils/AppError.js";

// POST /api/media (protected) — multipart/form-data with one or more "files" fields.
// Uploads to R2 and returns the public URLs to store in project/article documents.
export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError("No files provided — attach them as 'files' form fields", 400);
    }

    const folder = (req.body.folder || "uploads").replace(/[^a-zA-Z0-9/_-]/g, "");

    const uploads = await Promise.all(
      req.files.map(async (file) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const base = path
          .basename(file.originalname, ext)
          .replace(/[^a-zA-Z0-9_-]/g, "-")
          .slice(0, 60);
        const key = `${folder}/${base}-${crypto.randomBytes(4).toString("hex")}${ext}`;

        await r2.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          })
        );

        return { key, url: publicUrlFor(key), size: file.size, type: file.mimetype };
      })
    );

    res.status(201).json({ success: true, message: "Files uploaded", data: uploads });
  } catch (err) {
    next(err);
  }
};
