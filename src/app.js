import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import errorHandler from "./middleware/errorHandler.js";
import articleRoutes from "./routes/articleRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

const app = express();

// Behind nginx (and optionally Cloudflare): trust the first proxy hop so req.ip / rate limiting see real client IPs.
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(",") || ["http://localhost:8080"],
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.json({ success: true, message: "Sabbir's backend API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

// Frontend apiSlice expects POST /api/admin/login — authRoutes handles both mounts
app.use("/api/admin", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/media", mediaRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

export default app;
