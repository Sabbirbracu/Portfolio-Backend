import "dotenv/config";
import mongoose from "mongoose";
import Project from "../models/Project.js";

/**
 * Tiered rollout of the in-depth case-study format.
 *
 *   Tier 1 (full depth)  : rchms, bhashal
 *   Tier 2 (core set)    : ai-customer-support, the-daily-drift
 *
 * Also fixes a live contradiction on RCHMS: the stack listed MongoDB while the
 * case-study text referenced MySQL four times. Confirmed by Sabbir as MySQL.
 *
 * Every claim below is derived from the project's already-recorded facts —
 * nothing invented. Numbers used in keyMetrics are only those that can be
 * counted from the existing record (modules, roles, team size, duration).
 *
 * Idempotent. Usage: npm run enrich:casestudies
 */

/* ------------------------------------------------------------------ RCHMS */
const rchms = {
  stackFix: {
    database: ["MySQL"],
    frontend: ["React", "Redux Toolkit", "Vite", "Tailwind CSS"],
    backend: ["Node.js", "Express"],
    devops: ["Production Deployment", "Git Version Control"],
  },
  caseStudy: {
    role: "Full Stack Engineer",
    teamSize: 2,
    targetUsers:
      "Residential housing authorities, property managers, and community administrators",

    executiveSummary: {
      intro:
        "A housing authority was running property operations and payroll manually. I built an end-to-end housing management platform that automated the workflow while treating payroll data with financial-grade integrity.",
      points: [
        "Designed the full system architecture and shipped it to production in 2 months.",
        "Chose MySQL specifically for transactional safety — payroll cannot tolerate partial writes or eventual consistency.",
        "Implemented role-based access control separating administrators from residents.",
        "Automated payroll calculation and record-keeping, removing the manual step most prone to human error.",
        "Built audit-friendly data validation so financial records stay defensible.",
      ],
    },

    keyMetrics: [
      { value: "2", label: "Months to production" },
      { value: "6", label: "Major modules" },
      { value: "2", label: "User roles" },
      { value: "2", label: "Engineers" },
    ],

    context: [
      "Residential housing authorities run on a mix of spreadsheets, paper records, and institutional memory. Property operations, resident management, and payroll all depend on the same underlying data — but that data lives in disconnected places, and every handoff is a chance for it to drift.",
      "The organisation needed a single system that could onboard users securely, enforce who sees what, and — critically — calculate payroll correctly every time. Existing options were either fragmented point solutions or lacked the data reliability that financial records demand.",
    ],

    challengeIntro:
      "The requirements looked like standard CRUD work, but three of them carried real engineering risk:",
    challengePoints: [
      "How do you guarantee payroll accuracy? Financial calculations cannot be approximately right. A partial write or an inconsistent read produces a wrong payment and an unauditable record.",
      "How do you control access across very different user types? Administrators and residents need the same platform but fundamentally different visibility into it.",
      "How do you keep sensitive personal and financial data secure? Housing records contain personal details and payroll contains compensation data — both demand strict validation.",
      "How do you keep the interface fast enough that staff actually use it? A system slower than the spreadsheet it replaces gets abandoned.",
    ],

    constraints: [
      "Financial-grade data integrity — payroll correctness was non-negotiable, which drove the database decision before anything else.",
      "Two-person team — the architecture had to be clear enough to split cleanly and stay maintainable.",
      "Two-month delivery window — scope had to stay disciplined around the operations that mattered most.",
      "Non-technical end users — housing staff and residents, so the interface had to be immediately obvious.",
    ],

    approachIntro:
      "I started from the data-integrity requirement and let it drive the rest of the architecture.",
    approachSteps: [
      {
        title: "Chose the database first",
        body: "Payroll drove the decision. I selected MySQL for relational constraints and transactional guarantees — the properties that make financial calculations safe — rather than defaulting to whatever was fastest to prototype with.",
      },
      {
        title: "Modelled roles before features",
        body: "Administrators and residents see fundamentally different systems. Establishing role-based access control early meant permissions were structural, not retrofitted onto finished screens.",
      },
      {
        title: "Separated backend concerns",
        body: "I structured the Express backend around distinct auth, payroll, and housing modules so payroll logic stayed isolated and independently verifiable.",
      },
      {
        title: "Built a fast client on Vite",
        body: "A React frontend with Redux Toolkit for predictable state, built with Vite for quick loads — because adoption depends on the tool feeling faster than the manual process it replaces.",
      },
    ],
    approachOutro:
      "Deciding the data layer first is why the payroll module never needed rearchitecting later.",

    architectureIntro:
      "A client-server architecture where correctness lives in the database and the API, never in the browser.",
    architectureComponents: [
      {
        name: "React + Redux Toolkit client",
        detail: "Built with Vite for fast loads; predictable state management for complex admin views.",
      },
      {
        name: "Express REST API",
        detail: "Structured with separation of concerns across auth, payroll, and housing modules.",
      },
      {
        name: "MySQL",
        detail:
          "Relational constraints and transactional writes guaranteeing payroll and record integrity.",
      },
      {
        name: "Role-based access control",
        detail: "Administrator and resident permissions enforced server-side on every request.",
      },
    ],
    architectureOutro:
      "Isolating payroll as its own backend concern meant its logic could be reasoned about and validated independently of the rest of the platform.",

    deepDives: [
      {
        title: "Payroll accuracy and transactional consistency",
        paragraphs: [
          "Payroll was the highest-risk part of the system. Unlike most application data, a financial record that is partially written or read mid-update doesn't just look wrong — it produces an incorrect payment and an audit trail nobody can defend.",
          "This is why the platform runs on MySQL. Relational constraints enforce that records can't reference data that doesn't exist, and transactional writes mean a payroll calculation either completes fully or not at all. There is no in-between state where half a calculation has landed.",
          "I paired that with controlled write operations so payroll records are only mutated through validated paths, never ad hoc. The database guarantees integrity structurally rather than depending on application code to always behave.",
        ],
      },
      {
        title: "Securing personal and financial data",
        paragraphs: [
          "Housing records hold personal details; payroll holds compensation data. Both are sensitive, and both are accessed by users with very different levels of authority.",
          "I implemented secure registration flows, role-based access control, and strict API-level validation. Permission checks run server-side on every request — the frontend renders what the API allows rather than deciding entitlements itself.",
          "The result is a system where a resident and an administrator can use the same platform without the resident ever being able to reach administrative or payroll data.",
        ],
      },
      {
        title: "Building for adoption, not just correctness",
        paragraphs: [
          "A correct system that staff avoid using is a failed system. Manual processes persist because they feel faster, even when they're error-prone.",
          "I built the client with Vite for fast initial loads and used Redux Toolkit to keep complex administrative views responsive and predictable. API integration was optimised so common operations felt immediate.",
          "Combined with role-specific dashboards — each user type seeing only what's relevant to them — the platform stayed simple enough for non-technical housing staff to adopt.",
        ],
      },
    ],

    features: [
      "Role-based dashboard for administrators and residents",
      "Secure authentication and data management",
      "Scalable frontend architecture with React & Redux Toolkit",
      "Optimized API integration for fast user experience",
      "Automated payroll calculation & records",
      "Data validation and audit-friendly workflows",
    ],

    tradeoffs: [
      {
        decision: "MySQL",
        alternative: "MongoDB / NoSQL",
        rationale:
          "Payroll demands transactional guarantees and relational constraints; eventual consistency is unacceptable for financial records",
      },
      {
        decision: "Server-side role enforcement",
        alternative: "Client-side route guards",
        rationale:
          "Residents must not be able to reach payroll or admin data by manipulating the frontend",
      },
      {
        decision: "Modular Express backend",
        alternative: "Single controller layer",
        rationale:
          "Isolating payroll logic makes it independently verifiable — critical for financial correctness",
      },
      {
        decision: "React + Vite",
        alternative: "Server-rendered templates",
        rationale:
          "Fast, responsive admin views drive adoption among staff replacing a manual process",
      },
    ],

    security: {
      intro:
        "The platform holds both personal housing records and payroll data, so access control was structural rather than additive.",
      points: [
        "Role-based access control separating administrator and resident capabilities.",
        "Secure registration and authentication flows.",
        "Strict API-level validation on every request — no trust in client-supplied permissions.",
        "Controlled write paths for payroll records, keeping financial data auditable.",
        "Relational constraints preventing orphaned or inconsistent records at the database level.",
      ],
    },

    results: {
      metrics: [
        { label: "Time to production", value: "2 months" },
        { label: "Major modules delivered", value: "6" },
        { label: "User roles", value: "2 (administrator, resident)" },
        { label: "Team size", value: "2 engineers" },
      ],
      modulesNote:
        "The 6 modules: role-based dashboards · secure authentication & data management · scalable React/Redux frontend · optimized API integration · automated payroll calculation & records · data validation and audit-friendly workflows.",
      businessImpact: [
        "Replaced a manual housing and payroll process with a stable production system.",
        "Reduced manual workload for housing operations staff.",
        "Improved data reliability across housing and payroll records.",
        "Established audit-friendly workflows that make financial records defensible.",
        "Delivered role-appropriate access so residents and administrators share one platform safely.",
      ],
    },

    improvements: [
      "Add automated tests around payroll calculation. The database guarantees integrity, but a regression suite would make future changes to the calculation logic safer.",
      "Instrument usage analytics. Knowing which workflows staff actually use would sharpen where to invest next.",
      "Formalise the deployment pipeline. Production deployment was handled directly; CI/CD would make releases repeatable.",
    ],

    reflection: [
      "The most consequential decision on this project was made before any feature was built: choosing MySQL because payroll cannot tolerate inconsistency. Picking a database for the hardest requirement rather than the most convenient one is why the financial side never needed rework.",
      "The broader lesson is that replacing a manual process is as much an adoption problem as an engineering one. Correctness earns trust, but speed and clarity are what make people stop reaching for the spreadsheet.",
    ],

    // Superseded by the richer blocks above
    problem: undefined,
    solution: undefined,
    architecture: undefined,
    challenges: [],
    contribution: [],
    outcome: undefined,
  },
};

/* ---------------------------------------------------------------- BHASHAL */
const bhashal = {
  caseStudy: {
    role: "Full Stack Engineer (sole developer)",
    teamSize: 1,
    targetUsers:
      "Bangla-speaking learners studying English grammar through structured, gamified lessons",

    executiveSummary: {
      intro:
        "Grammar apps treat lessons as flat pages. Bhashal needed a curriculum that behaves like a real syllabus — reusable grammar concepts, per-learner mastery tracking, and a content pipeline non-technical editors can actually operate — all served to a student app and an admin panel from one API.",
      points: [
        "Designed a block-based curriculum engine spanning six levels of hierarchy: Levels → Skills → Chapters → Units → Lessons → Blocks.",
        "Built Grammar Slots as first-class entities so mastery is tracked per concept, not per lesson.",
        "Shipped a draft → review → published content lifecycle so editors publish safely without breaking live curriculum order.",
        "Integrated SSLCommerz payments with server-side IPN verification and automatic enrollment.",
        "Delivered Milestone 1 — complete backend, database, and content pipeline — as the sole engineer.",
      ],
    },

    keyMetrics: [
      { value: "6", label: "Curriculum hierarchy levels" },
      { value: "8", label: "Major modules" },
      { value: "1", label: "Engineer" },
      { value: "M1", label: "Milestone delivered" },
    ],

    context: [
      "Most grammar learning products model a lesson as a page of content followed by a quiz. That works until you need to answer a harder question: does this learner actually understand the present perfect, wherever it appears?",
      "Bhashal is built for Bangla speakers learning English grammar, and it needed a curriculum deep enough to answer that question — where concepts recur across lessons, mastery is measured per concept, and access rules distinguish free from paid content for guests, logged-in users, and enrolled students.",
    ],

    challengeIntro:
      "Building this as one engineer meant the hard problems had to be solved structurally, not with headcount:",
    challengePoints: [
      "How do you model grammar concepts that repeat across many lessons while tracking each learner's mastery of each concept independently?",
      "How do you let non-technical editors publish content without breaking the ordering of a live curriculum?",
      "How do you serve both a student app and an admin panel from a single API without duplicating business rules?",
      "How do you enforce access control across free/paid content, guest/logged-in users, and enrolled/unenrolled states — consistently, in one place?",
    ],

    constraints: [
      "Sole developer — the architecture had to be something one person could build and continue to operate.",
      "Two client applications — a student app and an admin panel consuming one REST layer.",
      "Non-technical content editors — the publishing workflow had to be safe by design, not by training.",
      "Payments in the Bangladesh market — requiring SSLCommerz rather than a global default like Stripe.",
    ],

    approachIntro:
      "The content model came first. Everything else — quizzes, mastery, access rules — depends on getting that structure right.",
    approachSteps: [
      {
        title: "Designed the block architecture",
        body: "Content is composed from CoreBlock, GrammarSlot, and ExampleScreen primitives rather than stored as monolithic pages, so lessons become compositions of reusable concepts.",
      },
      {
        title: "Made grammar concepts first-class",
        body: "Grammar Slots are entities linked to both lesson blocks and quiz questions, which is what makes per-concept mastery measurable rather than inferred.",
      },
      {
        title: "Built a publishing lifecycle",
        body: "A draft → review → published ↔ unpublished status flow with individual and bulk transitions, so editors work in a queue rather than directly against live content.",
      },
      {
        title: "Centralised access control",
        body: "One service resolves free/paid × guest/logged-in × enrolled, so entitlement logic exists in exactly one place instead of being re-implemented per endpoint.",
      },
    ],
    approachOutro:
      "Getting the content model right first is why quiz delivery, mastery scoring, and payments could each be layered on without restructuring.",

    architectureIntro:
      "A single FastAPI backend with a layered structure serving two Next.js applications through one REST layer.",
    architectureComponents: [
      {
        name: "FastAPI backend",
        detail: "Layered as core / models / schemas / services / api, serving both client apps.",
      },
      {
        name: "Async SQLAlchemy 2.0 + Alembic",
        detail: "Asynchronous data access with versioned schema migrations.",
      },
      {
        name: "PostgreSQL",
        detail: "Relational store for the curriculum hierarchy, mastery scores, and progress.",
      },
      { name: "Redis", detail: "Caching layer for frequently-read curriculum content." },
      {
        name: "Next.js 14 apps",
        detail: "Student application and admin panel, using App Router with TanStack Query.",
      },
      {
        name: "JWT auth with refresh tokens",
        detail: "Role-based access separating students from administrators.",
      },
      { name: "Cloudflare R2", detail: "Media storage and delivery." },
      {
        name: "SSLCommerz",
        detail: "Payment gateway with server-side IPN verification and automatic enrollment.",
      },
    ],
    architectureOutro:
      "One API serving two very different frontends meant business rules could never be duplicated — a constraint that kept access control centralised by necessity.",
    architectureNotes: [
      {
        title: "The block model: why lessons aren't pages",
        body: [
          "A lesson is a composition of blocks — CoreBlock, GrammarSlot, ExampleScreen — rather than a single content document.",
          "Because Grammar Slots are shared entities rather than copied text, the same concept can appear in many lessons while remaining one thing the system can measure. When a learner answers a quiz question incorrectly, the mistake tags the slot, and a mastery service recomputes that learner's score for that specific concept.",
        ],
      },
    ],

    deepDives: [
      {
        title: "Modelling grammar concepts that repeat across lessons",
        paragraphs: [
          "The core modelling problem was that grammar concepts don't belong to single lessons. The present perfect appears in an early chapter and again in a later one, and a learner's understanding of it is a single fact — not one fact per lesson.",
          "I introduced Grammar Slots as first-class entities linked to both lesson blocks and quiz questions. A concept exists once in the system and is referenced wherever it appears.",
          "When a learner answers incorrectly, the wrong answer tags the relevant slot, and a mastery service recomputes per-concept scores from accumulated mistakes. This makes it possible to say what a learner actually understands, rather than only which lessons they finished.",
        ],
      },
      {
        title: "Letting non-technical editors publish safely",
        paragraphs: [
          "Content editors need to publish continuously, but a live curriculum has ordering that breaks if edited carelessly — and the people editing are not engineers.",
          "I built a status lifecycle — draft → review → published ↔ unpublished — with both individual and bulk transitions, numeric order editing, and free/paid toggles, all behind admin-only routes.",
          "Editors work against a review queue rather than directly against live content. The workflow is safe structurally, so safety doesn't depend on editors remembering the right procedure.",
        ],
      },
      {
        title: "Centralising access control",
        paragraphs: [
          "Access rules multiply quickly: content is free or paid, a visitor is a guest or logged in, and a student is enrolled or not. Implemented per-endpoint, those combinations become inconsistent almost immediately.",
          "I centralised the resolution of free/paid × guest/logged-in × enrolled into a single access-control service that every lesson request passes through.",
          "One place to change the rules means the student app and the admin panel can never disagree about what a user is entitled to see.",
        ],
      },
      {
        title: "Payments with server-side verification",
        paragraphs: [
          "Enrollment is the moment money and access meet, which makes it the point where trusting the client is most dangerous.",
          "I integrated SSLCommerz with server-side IPN validation, so enrollment is granted based on a verified payment notification received and checked by the backend — never on a client-side success redirect.",
          "A successful payment automatically enrolls the student, and the XP system and progress tracking pick up from there with a resume point.",
        ],
      },
    ],

    features: [
      "Block-based curriculum engine (Levels → Skills → Chapters → Units → Lessons → Blocks)",
      "Grammar-Slot mastery tracking — per-concept scores computed from quiz mistakes",
      "Content review queue with draft → review → published lifecycle",
      "JSON bulk import pipeline with validation and per-item error reporting",
      "Centralized access control: free/paid × guest/logged-in × enrolled states",
      "SSLCommerz payments with IPN verification and automatic enrollment",
      "XP system with transaction log, progress tracking with resume point",
      "Admin panel: curriculum management, review queue, students, payments",
    ],

    tradeoffs: [
      {
        decision: "Block-based content model",
        alternative: "Lessons as flat documents",
        rationale:
          "Concepts recur across lessons; only a composed model makes per-concept mastery measurable",
      },
      {
        decision: "Grammar Slots as entities",
        alternative: "Tagging lessons with topic labels",
        rationale:
          "Labels describe content; entities can be linked to quiz questions and scored per learner",
      },
      {
        decision: "One API for two frontends",
        alternative: "Separate student and admin services",
        rationale:
          "Prevents business rules — especially access control — from being duplicated and drifting apart",
      },
      {
        decision: "Async SQLAlchemy 2.0",
        alternative: "Synchronous ORM",
        rationale: "Curriculum reads are frequent and concurrent; async keeps the API responsive",
      },
      {
        decision: "Server-side IPN verification",
        alternative: "Client-side payment confirmation",
        rationale: "Enrollment grants paid access — it must never depend on a client redirect",
      },
    ],

    security: {
      intro:
        "The platform handles student accounts, payment events, and paid content entitlements.",
      points: [
        "JWT authentication with refresh tokens and role-based access separating students from admins.",
        "Centralised access control resolving free/paid, guest/logged-in, and enrolled states server-side.",
        "SSLCommerz payments verified through server-side IPN, never client-side confirmation.",
        "Admin-only routes guarding all curriculum and publishing operations.",
        "Validated bulk import with per-item error reporting, so bad content is rejected rather than partially applied.",
      ],
    },

    results: {
      metrics: [
        { label: "Curriculum hierarchy depth", value: "6 levels" },
        { label: "Major modules delivered", value: "8" },
        { label: "Engineers on the project", value: "1" },
        { label: "Status", value: "Milestone 1 complete, M2 in progress" },
      ],
      modulesNote:
        "The 8 modules: block-based curriculum engine · Grammar-Slot mastery tracking · content review queue · JSON bulk import pipeline · centralized access control · SSLCommerz payments · XP and progress tracking · admin panel.",
      businessImpact: [
        "Milestone 1 delivered: complete backend, database, and content pipeline.",
        "Per-concept mastery tracking that flat lesson models cannot support.",
        "A publishing workflow non-technical editors can operate without risking live curriculum.",
        "Payment-to-enrollment flow verified server-side, protecting paid content.",
        "Live at bhashal.com, with the admin panel (Milestone 2) in active development.",
      ],
    },

    improvements: [
      "Add automated tests around the access-control service earlier. It is the single most rule-dense part of the system and the place a regression would be most costly.",
      "Instrument learning analytics from the start. Mastery data is being captured; surfacing it as product insight is the natural next step.",
      "Formalise content-import validation reporting sooner, so editors self-serve on errors without engineering support.",
    ],

    reflection: [
      "The defining decision here was refusing to model a lesson as a page. Treating grammar concepts as first-class entities cost significantly more design work upfront, but it is the only reason the platform can answer what a learner actually understands.",
      "Building solo also forced a useful discipline: every rule had to live in exactly one place, because there was no team to keep duplicated logic in sync. Centralised access control wasn't just good practice — it was the only sustainable option.",
    ],

    problem: undefined,
    solution: undefined,
    architecture: undefined,
    challenges: [],
    contribution: [],
    outcome: undefined,
  },
};

/* -------------------------------------------------- AI CUSTOMER SUPPORT */
const aiSupport = {
  caseStudy: {
    role: "Product Engineer (sole developer)",
    teamSize: 1,
    targetUsers:
      "Businesses that want to automate customer support and lead capture without a large support team",

    executiveSummary: {
      intro:
        "Small and mid-sized businesses lose customers to slow support, but 24/7 staffing is expensive and generic chatbots frustrate users because they don't know the business. I'm building an AI assistant trained on each business's own knowledge base.",
      points: [
        "Retrieval-augmented generation over the business's own documents, so answers are grounded rather than generic.",
        "Knowledge-base ingestion pipeline embedding business content into a vector store.",
        "Lead capture built into the conversation flow rather than bolted on as a form.",
        "Escalation to a human when the assistant cannot answer confidently.",
      ],
    },

    keyMetrics: [
      { value: "RAG", label: "Retrieval architecture" },
      { value: "1", label: "Engineer" },
      { value: "4", label: "Core modules" },
    ],

    context: [
      "Support speed directly affects revenue for small and mid-sized businesses — a question left unanswered overnight is often a customer lost by morning. But hiring a round-the-clock support team is out of reach for most of them.",
      "Off-the-shelf chatbots fill that gap badly. They don't know the business, so they produce confident, generic answers that frustrate customers more than silence would.",
    ],

    challengeIntro: "The problem is less about conversation and more about grounding:",
    challengePoints: [
      "How do you make an assistant that actually knows a specific business, rather than answering from general knowledge?",
      "How do you keep answers accurate enough to put in front of real customers unsupervised?",
      "How do you recognise when the assistant should stop and hand off to a human?",
      "How do you capture qualified leads naturally inside a support conversation?",
    ],

    deepDives: [
      {
        title: "Grounding answers in the business's own knowledge",
        paragraphs: [
          "A general-purpose model answering customer questions will confidently invent details it doesn't have. For customer-facing support, that's worse than no automation at all.",
          "The assistant is built on retrieval-augmented generation: business documents are embedded into a vector store, and each incoming question retrieves the relevant material before an answer is generated.",
          "The model composes answers from the business's actual content rather than from memory, which is what makes the assistant safe to run unsupervised.",
        ],
      },
      {
        title: "Turning support conversations into qualified leads",
        paragraphs: [
          "Most support tooling treats conversations and lead capture as separate systems, so intent expressed mid-conversation is lost.",
          "Conversation state and lead data are persisted together in PostgreSQL, so a question that signals buying intent can be captured as a lead in the moment rather than through a separate form.",
        ],
      },
    ],

    results: {
      metrics: [
        { label: "Status", value: "In active development" },
        { label: "Engineers on the project", value: "1" },
      ],
      businessImpact: [
        "Core conversation engine and knowledge-base ingestion working.",
        "Answers grounded in each business's own documents rather than generic knowledge.",
        "Lead capture and multi-channel delivery in progress.",
      ],
    },

    reflection: [
      "The interesting engineering problem in applied AI is rarely the model — it's grounding. An assistant that knows the business is useful; one that improvises is a liability. Nearly all of the design effort goes into retrieval quality and knowing when not to answer.",
    ],

    // Superseded by context / executiveSummary / deepDives above
    problem: undefined,
    solution: undefined,
    architecture: undefined,
    challenges: [],
    contribution: [],
    outcome: undefined,
  },
};

/* ------------------------------------------------------ THE DAILY DRIFT */
const dailyDrift = {
  caseStudy: {
    role: "Full Stack Developer",
    teamSize: 1,
    targetUsers: "Content consumers seeking curated daily articles and news",

    executiveSummary: {
      intro:
        "Content platforms tend to bury the reading experience under clutter and slow page loads. I built a minimalist platform where performance and readability were the product decisions, not afterthoughts.",
      points: [
        "Decoupled architecture with the React frontend on Vercel for edge performance.",
        "Sub-2-second load times achieved through code splitting, lazy loading, and image optimisation.",
        "SEO-optimised structure using semantic HTML and structured data for dynamic content.",
        "Clean typography and a distraction-free reading interface across all devices.",
      ],
    },

    keyMetrics: [
      { value: "<2s", label: "Target page load" },
      { value: "6", label: "Major modules" },
      { value: "3", label: "Months to launch" },
      { value: "1", label: "Engineer" },
    ],

    context: [
      "Reading online is often worse than it needs to be. Content platforms accumulate interface clutter, load slowly, and treat mobile as an afterthought — all of which compete with the thing readers actually came for.",
      "The goal here was narrow and deliberate: a curated daily content platform where the reading experience is the priority and everything else gets out of the way.",
    ],

    challengeIntro: "Two constraints shaped most of the engineering:",
    challengePoints: [
      "How do you achieve fast initial page loads on a content-rich, image-heavy site?",
      "How do you make dynamically-rendered content properly discoverable by search engines?",
      "How do you keep the interface genuinely distraction-free while still supporting categories and sharing?",
    ],

    deepDives: [
      {
        title: "Achieving fast loads on a content-heavy site",
        paragraphs: [
          "Rich content and fast loading pull against each other — images and article payloads are exactly what slows a page down.",
          "I addressed it on three fronts: code splitting so readers only download what the current view needs, lazy loading so below-the-fold images don't block the initial render, and an image optimisation pipeline to cut transfer size.",
          "Deploying the frontend to Vercel put content on edge infrastructure, targeting sub-2-second loads.",
        ],
      },
      {
        title: "Making dynamic content discoverable",
        paragraphs: [
          "A client-rendered content site can be effectively invisible to search engines if structure is an afterthought — a serious problem when discovery drives readership.",
          "I used semantic HTML so document structure carries meaning, proper meta tags per article, and structured data markup so search engines can interpret content type and metadata correctly.",
        ],
      },
    ],

    results: {
      metrics: [
        { label: "Time to launch", value: "3 months" },
        { label: "Major modules delivered", value: "6" },
        { label: "Engineers on the project", value: "1" },
        { label: "Deployment", value: "Vercel + MongoDB Atlas" },
      ],
      businessImpact: [
        "Launched a live content platform with strong performance characteristics.",
        "Sub-2-second load times through code splitting, lazy loading, and image optimisation.",
        "Improved search visibility via semantic markup and structured data.",
        "Positive user feedback on readability and the distraction-free interface.",
      ],
    },

    reflection: [
      "This project was a reminder that performance is a product feature, not a technical one. Readers don't articulate 'the bundle is too large' — they just leave. Treating load time as part of the reading experience is what made the platform feel good to use.",
    ],

    // Superseded by context / challengePoints / deepDives above
    problem: undefined,
    solution: undefined,
    architecture: undefined,
    challenges: [],
    contribution: [],
    outcome: undefined,
  },
};

/* -------------------------------------------------------------------- run */
const PLAN = [
  { slug: "rchms", data: rchms, tier: "full" },
  { slug: "bhashal", data: bhashal, tier: "full" },
  { slug: "ai-customer-support", data: aiSupport, tier: "core" },
  { slug: "the-daily-drift", data: dailyDrift, tier: "core" },
];

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}\n`);

  for (const { slug, data, tier } of PLAN) {
    const project = await Project.findOne({ slug });
    if (!project) {
      console.warn(`  SKIP ${slug} — not found`);
      continue;
    }

    if (data.stackFix) {
      Object.assign(project.techStack, data.stackFix);
    }

    project.caseStudy = { ...(project.caseStudy?.toObject?.() ?? {}), ...data.caseStudy };

    await project.save();

    const cs = project.caseStudy;
    console.log(
      `  ${slug.padEnd(22)} [${tier}] ` +
        `deepDives=${cs.deepDives?.length ?? 0} ` +
        `metrics=${cs.keyMetrics?.length ?? 0} ` +
        `tradeoffs=${cs.tradeoffs?.length ?? 0}` +
        (data.stackFix ? `  db=${project.techStack.database.join(",")}` : "")
    );
  }

  console.log("\nDone.");
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
