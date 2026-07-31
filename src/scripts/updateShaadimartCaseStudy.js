import "dotenv/config";
import mongoose from "mongoose";
import Project from "../models/Project.js";

/**
 * Loads the in-depth ShaadiMart BD case study — the exact content of the
 * published PDF — into MongoDB, and corrects four facts that were wrong in
 * the original record:
 *
 *   teamSize  3 -> 1            (solo build, confirmed by Sabbir)
 *   role      "Backend-heavy"   -> "Full-Stack Product Engineer (solo)"
 *   duration  "4 months"        -> "1.5 months"
 *   techStack  (no Cloudflare)  -> adds Cloudflare R2
 *
 * Idempotent — safe to re-run.
 * Usage: npm run update:shaadimart
 */

const caseStudy = {
  role: "Full-Stack Product Engineer (solo)",
  teamSize: 1,
  targetUsers: "Bangladesh-based users seeking verified matrimony matches",

  showcaseNote:
    "A note on the two URLs. shaadimartbd.com is the client's live production site, which continues to evolve under their own team. dev.shaadimartbd.com preserves the platform exactly as I architected and delivered it. I showcase the latter so what you evaluate is my work — not changes made after handover.",

  executiveSummary: {
    intro:
      "A founder came to me with an idea and a startup budget — no technical team. I took the product from concept to a live, revenue-ready matrimony platform as the sole engineer, in six weeks.",
    points: [
      "Shipped 8 major modules solo in 1.5 months — architecture, backend, frontend, and production infrastructure.",
      "Protected the revenue model by enforcing 4 subscription tiers in backend authorization, so premium limits couldn't be bypassed from the client.",
      "Cut infrastructure costs structurally by choosing Cloudflare R2 over AWS S3 — eliminating egress fees for an image-heavy product.",
      "Shipped real-time chat and debugged a launch-blocking, production-only WebSocket/SSL failure.",
      "Owned deployment and reliability — Nginx, VPS, CI/CD, and post-launch production fixes.",
    ],
  },

  keyMetrics: [
    { value: "1.5", label: "Months to production" },
    { value: "8", label: "Major modules" },
    { value: "4", label: "Subscription tiers" },
    { value: "2", label: "User roles" },
    { value: "1", label: "Engineer" },
  ],

  context: [
    "Matrimony platforms live or die on three things: trust, communication, and the integrity of the paywall. Members share sensitive personal information and photos, expect meaningful conversations to happen safely, and the entire business model depends on gating contact information behind paid tiers.",
    "The founder had validated demand but had no engineering team, no architecture, and a limited runway. He needed a technical partner — not just a pair of hands.",
  ],

  challengeIntro:
    "The concerns he brought me were product and business problems disguised as technical ones:",
  challengePoints: [
    "How can members communicate safely and instantly? Chat is the core interaction of a matrimony product, not a feature.",
    "How can premium restrictions be enforced without breaking the business model? If a user can bypass a paywall through the client, recurring revenue collapses.",
    "How can thousands of profile images be stored and served affordably? Image-heavy products get expensive fast — usually through bandwidth, not storage.",
    "How can all of this ship on a startup budget, quickly? Preserving runway and time-to-market were first-class requirements.",
  ],

  constraints: [
    "Solo engineer — no team to parallelize across; architecture had to stay simple enough for one person to own end to end.",
    "Six-week window — the founder needed to be in market fast, which ruled out over-engineering.",
    "Startup budget — infrastructure choices had to minimize recurring cost, especially bandwidth.",
    "Sensitive user data — real names, photos, and contact details demanded privacy-first defaults.",
    "Business-critical paywall — the access model couldn't be bolted on later.",
  ],

  approachIntro: "I deliberately did not start with code.",
  approachSteps: [
    {
      title: "Mapped the product first",
      body: "We walked the complete user journey — registration, profile completion, discovery, connection, conversation, and conversion to paid — and mapped it against his business model.",
    },
    {
      title: "Backend before frontend",
      body: "I built and stabilized the Laravel API, data model, and authorization rules first. On a solo build under time pressure, getting business rules correct at the API layer meant the frontend could never become the place where security decisions lived.",
    },
    {
      title: "Frontend against a proven API",
      body: "With the backend solid, I built the Next.js client on top of it — no rework from shifting contracts.",
    },
    {
      title: "Production last, and owned",
      body: "I deployed, configured, and continued to support the platform after launch.",
    },
  ],
  approachOutro: "That sequencing is the main reason six weeks was achievable.",

  architectureIntro:
    "A decoupled architecture with one rule: the backend is the single source of truth for every access decision.",
  architectureComponents: [
    { name: "Next.js + TypeScript client", detail: "Server-rendered, SEO-friendly, mobile-first." },
    {
      name: "Laravel REST API",
      detail: "Authentication, profiles, subscriptions, and all authorization logic.",
    },
    { name: "Laravel Sanctum", detail: "Token-based auth carrying subscription context." },
    {
      name: "MySQL",
      detail: "Relational integrity for users, profiles, subscriptions, and messages.",
    },
    {
      name: "Real-time layer",
      detail: "Socket.io / WebSocket service for live messaging, proxied through Nginx over WSS.",
    },
    { name: "Cloudflare R2", detail: "Profile image storage and delivery." },
    {
      name: "Nginx on Hostinger VPS",
      detail: "Reverse proxy, SSL termination, static delivery.",
    },
    { name: "GitHub Actions", detail: "Automated deployment pipeline." },
  ],
  architectureOutro:
    "Auth, profile, search, and messaging were kept as separate concerns so a future mobile client could consume the same API without rework.",
  architectureNotes: [
    {
      title: "Access model: 2 roles, 4 tiers",
      body: [
        "A deliberate distinction: the platform has 2 user roles — member and admin — with 4 subscription tiers layered on top of the member role.",
        "Roles define what kind of user you are; tiers define what you've paid for. Keeping them separate meant the client could add, reprice, or restructure packages without touching the permission system.",
      ],
    },
  ],

  deepDives: [
    {
      title: "Real-time communication — and the production-only failure",
      paragraphs: [
        "Live chat is the heart of the product, so I built a WebSocket-based messaging layer that respects membership permissions in real time.",
        "The hard part came at deployment. Chat worked perfectly in development, then failed in production. The cause was SSL and port configuration: secure pages cannot open insecure WebSocket connections, and connections weren't surviving SSL termination.",
        "I configured Nginx as a reverse proxy to carry secure WSS traffic over port 443, resolving both the SSL termination and connection-stability problems. A launch-blocking issue, solved in production — the kind that never appears on localhost.",
      ],
    },
    {
      title: "Protecting premium revenue",
      paragraphs: [
        "The biggest commercial risk was users bypassing package limits — particularly around contact information visibility, which is simultaneously the platform's core privacy feature and its primary monetization mechanism.",
        "I implemented subscription-tier authorization in the backend, so every request for gated data is validated server-side against the user's active tier. The client never decides what a user is entitled to; it only renders what the API permits.",
        "Contact details, messaging capability, and premium visibility behaved exactly as the business model intended across all four tiers — and could not be unlocked by manipulating the frontend.",
      ],
    },
    {
      title: "Reducing infrastructure cost",
      paragraphs: [
        "An image-heavy platform with thousands of profile photos would ordinarily default to AWS S3. The real risk wasn't storage pricing — it was egress, the per-gigabyte cost of serving images to users, which scales directly with growth.",
        "I proposed Cloudflare R2, which offers S3-compatible storage with zero egress fees. The application gained scalable storage and fast delivery, while the founder's costs stopped scaling with traffic.",
        "For a pre-revenue startup, preserving cash flow was as valuable as any feature I shipped.",
      ],
    },
    {
      title: "Reducing onboarding drop-off",
      paragraphs: [
        "Matrimony platforms need complete profiles to produce good matches, but long forms cause abandonment.",
        "I implemented enforced multi-step profile completion with progress indicators and inline validation — so users always knew how far they'd come, and errors surfaced immediately instead of on final submit.",
      ],
    },
  ],

  features: [
    "Authentication & authorization",
    "Profile management with multi-step onboarding",
    "Discovery & search",
    "Real-time messaging",
    "Subscription & membership packages",
    "Media storage and delivery",
    "Admin dashboard & moderation",
    "Payment-ready architecture",
  ],

  tradeoffs: [
    {
      decision: "Cloudflare R2 for images",
      alternative: "AWS S3",
      rationale:
        "Zero egress fees; costs don't scale with traffic — decisive for a bootstrapped client",
    },
    {
      decision: "Backend-enforced authorization",
      alternative: "Client-side gating",
      rationale: "Revenue integrity; a paywall enforced in the browser isn't a paywall",
    },
    {
      decision: "Laravel + Next.js (decoupled)",
      alternative: "Monolithic framework",
      rationale: "Same API can serve a future mobile app without a rewrite",
    },
    {
      decision: "MySQL",
      alternative: "NoSQL",
      rationale:
        "Subscriptions and user relationships are inherently relational; transactional integrity matters for billing",
    },
    {
      decision: "Roles separated from tiers",
      alternative: "Tier-as-role",
      rationale: "Client can reprice or restructure packages without touching permissions",
    },
    {
      decision: "Self-managed VPS + Nginx",
      alternative: "Managed PaaS",
      rationale:
        "Significantly lower monthly cost, with full control over SSL and WebSocket proxying",
    },
  ],

  security: {
    intro: "Matrimony data is among the most sensitive a consumer product can hold.",
    points: [
      "Token-based authentication via Laravel Sanctum, with subscription state bound to authorization.",
      "Contact information private by default, revealed only through validated, paid access.",
      "Server-side validation on every request — no trust placed in client-supplied permissions.",
      "SSL/TLS across the platform, including secure WebSocket traffic.",
      "Admin moderation tools so the client could review members and act on reports.",
    ],
  },

  deployment: {
    intro: "I didn't hand off a repository — I shipped and ran the platform.",
    points: [
      "Configured Nginx for reverse proxying, SSL termination, and WSS support.",
      "Deployed to a Hostinger VPS sized to the client's budget.",
      "Set up GitHub Actions for automated, repeatable deployments.",
      "Diagnosed and fixed live production issues after launch, including the WebSocket SSL failure.",
    ],
  },

  results: {
    metrics: [
      { label: "Time from idea to production", value: "1.5 months" },
      { label: "Major modules shipped", value: "8" },
      { label: "Subscription tiers enforced", value: "4" },
      { label: "User roles", value: "2 (member, admin)" },
      { label: "Engineers on the project", value: "1" },
    ],
    modulesNote:
      "The 8 modules: authentication & authorization · profile management with multi-step onboarding · discovery & search · real-time messaging · subscription & membership packages · media storage and delivery · admin dashboard & moderation · payment-ready architecture.",
    businessImpact: [
      "An idea became a live production platform in six weeks, built and deployed by one engineer.",
      "Recurring revenue protected through server-side enforcement across four tiers.",
      "Infrastructure costs structurally reduced by eliminating egress fees on image delivery.",
      "Higher engagement through real-time communication between members.",
      "Improved onboarding completion via staged profile creation with progress tracking.",
      "Operationally stable in production, with a deployment pipeline the client can build on.",
    ],
  },

  improvements: [
    "Introduce automated testing earlier. Solo velocity under a six-week deadline is tempting, but a test suite around subscription authorization would have made later changes safer.",
    "Instrument analytics from day one. I improved onboarding through sound UX reasoning; funnel instrumentation would have let me prove the improvement numerically.",
    "Validate the production SSL/WebSocket path sooner. Testing the real proxy configuration earlier would have caught the WSS issue before launch week rather than during it.",
  ],

  reflection: [
    "Building a SaaS product isn't only about writing clean code. It's about understanding the business model well enough to know which technical risks actually matter — then making engineering decisions that balance scalability, user experience, and the client's runway.",
    "The most valuable things I delivered here weren't features. They were a paywall that couldn't be bypassed, an infrastructure bill that doesn't grow with traffic, and a platform that stayed up after launch — shipped in six weeks by one person.",
  ],

  // Superseded by the richer blocks above — cleared so the page doesn't
  // render the same material twice.
  problem: undefined,
  solution: undefined,
  challenges: [],
  architecture: undefined,
  contribution: [],
  outcome: undefined,
};

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}\n`);

  const project = await Project.findOne({ slug: "shaadimartbd" });
  if (!project) {
    console.error('No project found with slug "shaadimartbd"');
    process.exit(1);
  }

  // Corrected top-level facts
  project.tagline = "Modern Matrimony Platform";
  project.duration = "1.5 months";
  project.links.live = "https://dev.shaadimartbd.com/";
  project.links.clientSite = "https://shaadimartbd.com/";

  // Cloudflare R2 was used but never recorded on the stack
  project.techStack.realtime = ["Socket.io", "WebSockets (WSS)"];
  project.techStack.devops = ["Nginx", "Hostinger VPS", "GitHub Actions"];
  project.techStack.tools = ["Cloudflare R2"];

  project.caseStudy = caseStudy;

  await project.save();

  console.log("Updated shaadimartbd:");
  console.log(`  role       : ${project.caseStudy.role}`);
  console.log(`  teamSize   : ${project.caseStudy.teamSize}`);
  console.log(`  duration   : ${project.duration}`);
  console.log(`  clientSite : ${project.links.clientSite}`);
  console.log(`  deepDives  : ${project.caseStudy.deepDives.length}`);
  console.log(`  tradeoffs  : ${project.caseStudy.tradeoffs.length}`);
  console.log(`  keyMetrics : ${project.caseStudy.keyMetrics.length}`);
  console.log(`  modules    : ${project.caseStudy.features.length}`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
