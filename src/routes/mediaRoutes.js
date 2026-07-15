import express from "express";
import multer from "multer";
import { uploadMedia } from "../controllers/mediaController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const ALLOWED_TYPES = /^(image\/(png|jpe?g|webp|gif|svg\+xml|avif)|video\/(mp4|webm)|application\/pdf)$/;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 10 }, // 25MB per file
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.test(file.mimetype)) return cb(null, true);
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

router.post("/", protect, upload.array("files", 10), uploadMedia);

export default router;
