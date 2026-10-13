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

// Reusable sub-documents for the in-depth case-study blocks
const sub = (fields) => new mongoose.Schema(fields, { _id: false });

const PairSchema = sub({ problem: String, solution: String });
const MetricSchema = sub({ value: String, label: String });
const StepSchema = sub({ title: String, body: String });
const ComponentSchema = sub({ name: String, detail: String });
const NoteSchema = sub({ title: String, body: [String] });
const DeepDiveSchema = sub({ title: String, paragraphs: [String] });
const TradeoffSchema = sub({ decision: String, alternative: String, rationale: String });
const BlockSchema = sub({ intro: String, points: [String] });
// One stage of the end-to-end lifecycle diagram. `ai` / `human` mark where automation helps and where a person decides.
const WorkflowStageSchema = sub({
  title: String,
  detail: String,
  track: { type: String, enum: ["sourcing", "finance"], default: "sourcing" },
  ai: Boolean,
  human: Boolean,
});
// One captioned screenshot of the product tour. Empty images are skipped on the site.
const ScreenSchema = sub({ title: String, caption: String, image: String });

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
      clientSite: String, // client's own production site, when it differs from the delivered build
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
      challenges: [PairSchema],
      contribution: [String],
      outcome: String,
      learnings: [String],

      // ---- In-depth case-study blocks (all optional; render only if present) ----
      showcaseNote: String, // e.g. explaining a delivered-build URL vs client production URL

      executiveSummary: BlockSchema, // { intro, points[] }
      keyMetrics: [MetricSchema], // headline stat strip

      context: [String], // narrative paragraphs

      workflow: sub({ intro: String, stages: [WorkflowStageSchema], outro: String }), // lifecycle diagram

      screensIntro: String,
      screens: [ScreenSchema], // captioned product-tour screenshots

      challengeIntro: String,
      challengePoints: [String],

      constraints: [String],

      approachIntro: String,
      approachSteps: [StepSchema],
      approachOutro: String,

      architectureIntro: String,
      architectureComponents: [ComponentSchema],
      architectureOutro: String,
      architectureNotes: [NoteSchema], // e.g. "Access model: 2 roles, 4 tiers"

      deepDives: [DeepDiveSchema], // "Problems solved" — rich multi-paragraph sections

      tradeoffs: [TradeoffSchema], // decision / alternative / rationale

      security: BlockSchema,
      deployment: BlockSchema,

      results: sub({
        metrics: [sub({ label: String, value: String })],
        modulesNote: String,
        businessImpact: [String],
      }),

      improvements: [String], // "What I'd do differently"
      reflection: [String], // closing paragraphs
    },
    meta: {
      featured: { type: Boolean, default: false }, // true = shown in the homepage "Selected Work" section
      order: { type: Number, default: 0 }, // position within the homepage selection (ascending)
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
