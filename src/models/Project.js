import mongoose from "mongoose";

// Mirrors src/types/project.ts in the frontend

const PROJECT_TYPES = [
  "fullstack",
  "frontend",
  "backend",
  "mobile",
  "wordpress",
  "no-code",
  "ai-ml",
  "research",
  "open-source",
];

const projectSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens"],
    },
    title: { type: String, required: [true, "Title is required"], trim: true },
    tagline: { type: String, trim: true },
    description: { type: String, required: [true, "Description is required"] },

    type: { type: String, enum: PROJECT_TYPES, required: [true, "Project type is required"] },
    status: { type: String, enum: ["concept", "in-progress", "live", "archived"], default: "live" },

    year: { type: Number },
    duration: { type: String },

    visibility: { type: String, enum: ["public", "private", "nda"], default: "public" },

    media: {
      banner: String,
      thumbnail: String,
      gallery: [String],
      videoDemo: String,
    },
    links: {
      live: String,
      github: String,
      documentation: String,
      researchPaper: String,
      figma: String,
    },
    techStack: {
      primary: [String],
      frontend: [String],
      backend: [String],
      database: [String],
      aiMl: [String],
      realtime: [String],
      devops: [String],
      tools: [String],
    },
    summaryMetrics: {
      users: String,
      scale: String,
      performance: String,
      impact: String,
    },
    caseStudy: {
      role: String,
      teamSize: Number,
      targetUsers: String,
      problem: String,
      solution: String,
      features: [String],
      architecture: String,
      challenges: [new mongoose.Schema({ problem: String, solution: String }, { _id: false })],
      contribution: [String],
      outcome: String,
      learnings: [String],
    },
    meta: {
      featured: { type: Boolean, default: false },
      tags: [String],
      company: String,
      location: String,
      confidentialityNote: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

projectSchema.index({ type: 1, "meta.featured": -1 });

export default mongoose.model("Project", projectSchema);
