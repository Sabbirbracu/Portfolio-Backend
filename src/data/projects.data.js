/**
 * Seed data migrated from the frontend's src/data/projects.ts.
 * `slug` is the natural key — the migration script upserts on it.
 */
const projects = [
  {
    slug: "bhashal",
    title: "Bhashal",
    tagline: "English Grammar Learning Platform",
    description:
      "A structured English grammar learning platform for Bangla speakers — block-based curriculum engine, quiz & mastery system, payments, and a full admin panel. Built with FastAPI, PostgreSQL, and Next.js 14.",

    type: "fullstack",
    status: "in-progress",
    year: 2026,
    duration: "Ongoing",
    visibility: "public",

    media: {},

    links: {
      live: "https://bhashal.com",
    },

    techStack: {
      primary: ["FastAPI", "PostgreSQL", "Next.js 14", "TypeScript", "Redis"],
      frontend: ["Next.js 14 (App Router)", "React 18", "TypeScript", "Tailwind CSS", "TanStack Query", "Zustand"],
      backend: ["FastAPI", "SQLAlchemy 2.0 (async)", "Alembic", "Pydantic"],
      database: ["PostgreSQL", "Redis"],
      tools: ["SSLCommerz", "Cloudflare R2", "JWT", "React Hook Form", "Zod"],
    },

    summaryMetrics: {
      scale: "Block-based curriculum engine: Levels → Skills → Chapters → Units → Lessons → Blocks",
      impact: "Milestone 1 (backend, database & block architecture) complete; admin panel in progress",
    },

    caseStudy: {
      role: "Full Stack Engineer (sole developer)",
      teamSize: 1,
      targetUsers:
        "Bangla-speaking learners studying English grammar through structured, gamified lessons",

      problem:
        "Grammar learning apps treat lessons as flat pages. Bhashal needed a deeply structured curriculum — reusable grammar concepts, per-concept mastery tracking, free/paid access rules, and a content pipeline editors can actually operate — all served to both a student app and an admin panel from one API.",

      solution:
        "Designed a block-based content architecture (CoreBlock / GrammarSlot / ExampleScreen) on PostgreSQL with async SQLAlchemy, a review-queue publishing lifecycle, centralized lesson access control, quiz delivery with mastery scoring, and SSLCommerz payments with server-side IPN validation and automatic enrollment.",

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

      architecture:
        "Single FastAPI backend with a layered structure (core / models / schemas / services / api) serving two Next.js apps through one REST layer. Async SQLAlchemy 2.0 with Alembic migrations, JWT auth with role-based access and refresh tokens, Redis for caching, Cloudflare R2 for media.",

      challenges: [
        {
          problem:
            "Modeling grammar concepts that repeat across lessons while tracking each learner's mastery of each concept.",
          solution:
            "Introduced Grammar Slots as first-class entities linked to lesson blocks and quiz questions; wrong answers tag the slot, and a mastery service recomputes per-concept scores.",
        },
        {
          problem:
            "Letting non-technical editors publish safely without breaking live curriculum order.",
          solution:
            "Built a status lifecycle (draft → review → published ↔ unpublished) with individual and bulk transitions, numeric order editing, and free/paid toggles behind admin-only routes.",
        },
      ],

      contribution: [
        "Designed the full database schema and block architecture",
        "Built the FastAPI backend end to end (auth, content, quiz, payments, progress)",
        "Implemented the admin panel in Next.js 14 with TanStack Query and Table",
        "Integrated SSLCommerz with server-side payment verification",
      ],

      outcome:
        "Milestone 1 delivered: complete backend, database, and content pipeline. Admin panel (Milestone 2) in active development. Live at bhashal.com.",
    },

    meta: {
      tags: ["edtech", "fastapi", "nextjs", "postgresql", "in-progress"],
    },
  },

  {
    slug: "ai-customer-support",
    title: "AI Customer Support Platform",
    tagline: "AI-Powered Business Assistant",
    description:
      "An intelligent customer support solution designed to automate FAQs, collect leads, and provide instant responses using modern AI technologies.",

    type: "ai-ml",
    status: "in-progress",
    year: 2026,
    duration: "Ongoing",
    visibility: "public",

    media: {},

    techStack: {
      primary: ["Next.js", "AI APIs", "Node.js", "RAG", "Vector Search"],
      frontend: ["Next.js", "TypeScript", "Tailwind CSS"],
      backend: ["Node.js", "Express"],
      aiMl: ["LLM APIs", "RAG Pipelines", "Vector Search", "Embeddings"],
      database: ["PostgreSQL", "Vector Store"],
    },

    summaryMetrics: {
      scale: "Multi-channel support architecture",
      impact: "Automates FAQs, captures leads, and answers customers instantly",
    },

    caseStudy: {
      role: "Product Engineer (sole developer)",
      teamSize: 1,
      targetUsers:
        "Businesses that want to automate customer support and lead capture without a large support team",

      problem:
        "Small and mid-sized businesses lose leads and customers when support is slow. Hiring a 24/7 support team is expensive, and generic chatbots frustrate users because they don't know the business.",

      solution:
        "Building an AI assistant that is trained on each business's own knowledge base. It answers customer questions instantly using retrieval-augmented generation (RAG), escalates to humans when needed, and captures qualified leads automatically.",

      features: [
        "AI-powered conversations",
        "Knowledge base integration",
        "Lead capture automation",
        "Multi-channel support architecture",
      ],

      architecture:
        "Next.js frontend with a Node.js API layer. Business documents are embedded into a vector store; incoming questions are answered through a RAG pipeline over the business's own knowledge base, with conversation state and lead data persisted in PostgreSQL.",

      outcome:
        "In active development — core conversation engine and knowledge-base ingestion working; lead capture and multi-channel delivery in progress.",
    },

    meta: {
      featured: true,
      tags: ["ai", "saas", "rag", "automation", "in-progress"],
    },
  },

  {
    slug: "shaadimartbd",
    title: "ShaadiMart",
    tagline: "Modern Matrimony Platform",
    description:
      "A full-featured matchmaking platform with secure authentication, real-time messaging, profile management, and an optimized user experience built for long-term scalability.",

    type: "fullstack",
    status: "live",
    year: 2025,
    duration: "4 months",
    visibility: "public",

    media: {
      banner: "/Shaadimart_banner.png",
      gallery: ["/Shaadimart1.png", "/Shaadimart2.png", "/Shaadimart3.png"],
    },

    links: {
      live: "https://dev.shaadimartbd.com/",
      github: "https://github.com/Sabbirbracu/ShaadimartBD",
    },

    techStack: {
      primary: ["Next.js", "TypeScript", "Laravel", "Tailwind CSS", "WebSocket"],
      frontend: ["Next.js", "TypeScript", "Tailwind CSS"],
      backend: ["Laravel", "Laravel Sanctum"],
      database: ["MySQL"],
      realtime: ["WebSocket"],
      devops: ["Nginx", "Hostinger VPS", "GitHub Actions"],
    },

    summaryMetrics: {
      users: "Active users in Bangladesh",
      scale: "Production-grade platform",
      impact: "Improved onboarding completion rates",
    },

    caseStudy: {
      role: "Full Stack Engineer (Backend-heavy)",
      teamSize: 3,
      targetUsers: "Bangladesh-based users seeking verified matrimony matches",

      problem:
        "Traditional matrimony platforms lacked structured profile completion, controlled access to sensitive contact information, real-time secure communication, high drop-off during onboarding, and weak verification flows.",

      solution:
        "Designed enforced multi-step profile completion with progress tracking; implemented subscription-based access control for contact visibility; built a WebSocket-based real-time chat; and created an admin dashboard for moderation and subscription management.",

      features: [
        "Next.js application with TypeScript",
        "Secure authentication using Laravel Sanctum",
        "Real-time messaging",
        "Mobile-first responsive interface",
        "Admin dashboard for moderation and plans",
      ],

      architecture:
        "Token-based authorization to control subscription-level access; Nginx reverse proxy for WSS over port 443; separation of concerns between auth, profile, search, and messaging services for future mobile scalability.",

      challenges: [
        {
          problem:
            "WebSocket connections failed in production due to SSL and port issues.",
          solution:
            "Configured Nginx reverse proxy to support secure WSS traffic over port 443, resolving connection stability and SSL termination issues.",
        },
        {
          problem: "High onboarding drop-off during profile creation.",
          solution:
            "Implemented enforced, step-by-step onboarding with progress indicators and inline validation to improve completion rates.",
        },
      ],

      contribution: [
        "Designed backend architecture",
        "Implemented authentication & subscription systems",
        "Integrated WebSockets for real-time chat",
        "Deployed and managed production environment",
        "Fixed live production issues",
      ],

      outcome:
        "Operationally stable in production; improved onboarding completion and increased engagement via real-time chat.",
    },

    meta: {
      featured: true,
      tags: ["matrimony", "real-time", "saas", "production"],
    },
  },

  {
    slug: "rchms",
    title: "Runner City Housing Management",
    tagline: "Property Management Platform",
    description:
      "A modern housing management platform built to simplify property operations, tenant management, and administrative workflows through a scalable and intuitive web application.",

    type: "fullstack",
    status: "live",
    year: 2024,
    duration: "2 months",
    visibility: "public",

    media: {
      banner: "/rchms_banner.png",
      gallery: ["/rchms1.png", "/rchms2.png", "/rchms3.png"],
    },

    links: {
      live: "https://rchms.qullia.com/",
      github: "https://github.com/Sabbirbracu/rchms",
    },

    techStack: {
      primary: ["React", "Redux Toolkit", "Node.js", "Express", "MongoDB"],
      frontend: ["React", "Redux Toolkit", "Tailwind CSS"],
      backend: ["Node.js", "Express"],
      database: ["MongoDB"],
      devops: ["Production Deployment", "Git Version Control"],
    },

    summaryMetrics: {
      scale: "Production housing system",
      impact: "Reduced manual workload for housing operations",
    },

    caseStudy: {
      role: "Full Stack Engineer",
      teamSize: 2,
      targetUsers:
        "Residential housing authorities, property managers, and community administrators",

      problem:
        "Manual housing management systems struggled with secure user onboarding, payroll accuracy, data integrity, and scalable role-based access. Existing solutions were either fragmented or lacked financial-grade database reliability.",

      solution:
        "Built an end-to-end housing automation platform with secure registration, role-based access control, and automated payroll processing. Leveraged MySQL for transactional safety and data consistency, with a modular Express backend and a fast React (Vite) frontend.",

      features: [
        "Role-based dashboard for administrators and residents",
        "Secure authentication and data management",
        "Scalable frontend architecture with React & Redux Toolkit",
        "Optimized API integration for fast user experience",
        "Automated payroll calculation & records",
        "Data validation and audit-friendly workflows",
      ],

      architecture:
        "Client-side React application built with Vite for fast performance, communicating with an Express REST API. MySQL chosen for strong relational integrity and payroll-safe transactions. Backend structured with separation of concerns for auth, payroll, and housing modules.",

      challenges: [
        {
          problem: "Ensuring payroll accuracy and transactional consistency.",
          solution:
            "Used MySQL with relational constraints and controlled write operations to guarantee financial data integrity.",
        },
        {
          problem: "Securing sensitive user and payroll data.",
          solution:
            "Implemented secure registration flows, role-based access control, and strict API validation.",
        },
      ],

      contribution: [
        "Designed overall system architecture",
        "Implemented secure authentication & role-based access",
        "Built payroll automation logic",
        "Developed React frontend with Vite",
        "Integrated MySQL database schema",
        "Handled deployment and production readiness",
      ],

      outcome:
        "Successfully deployed a stable production system supporting real housing operations. Reduced manual workload and improved data reliability for housing and payroll management.",
    },

    meta: {
      featured: true,
      tags: ["housing", "payroll", "enterprise", "production"],
    },
  },

  {
    slug: "the-daily-drift",
    title: "The Daily Drift",
    tagline: "Content Platform",
    description:
      "Content-driven web application with clean UI, optimized frontend performance, and REST API backend deployed on modern cloud infrastructure.",

    type: "fullstack",
    status: "live",
    year: 2023,
    duration: "3 months",
    visibility: "public",

    media: {},

    links: {
      live: "https://thedailydrift.qullia.com/",
      github: "https://github.com/Sabbirbracu/The-Daily-Drift-Frontend",
    },

    techStack: {
      primary: ["React", "Tailwind", "Node.js", "Express", "MongoDB"],
      frontend: ["React", "Tailwind CSS"],
      backend: ["Node.js", "Express"],
      database: ["MongoDB"],
      devops: ["Vercel", "MongoDB Atlas"],
    },

    summaryMetrics: {
      performance: "Optimized for fast page loads",
      scale: "Cloud-deployed infrastructure",
    },

    caseStudy: {
      role: "Full Stack Developer",
      teamSize: 1,
      targetUsers: "Content consumers seeking curated daily articles and news",

      problem:
        "Content platforms often suffer from cluttered interfaces, slow load times, and poor mobile experiences. Users needed a clean, fast platform to consume curated content without distractions.",

      solution:
        "Built a minimalist content platform focusing on readability and performance. Implemented lazy loading, optimized images, and clean typography for an excellent reading experience across all devices.",

      features: [
        "Clean, distraction-free reading interface",
        "Category-based content organization",
        "Responsive design for all devices",
        "Fast page loads with lazy loading",
        "SEO-optimized content structure",
        "Social sharing integration",
      ],

      architecture:
        "Decoupled frontend and backend architecture. React frontend deployed on Vercel for edge performance. Express API with MongoDB Atlas for scalable data storage. Image optimization pipeline for fast loading.",

      challenges: [
        {
          problem: "Achieving fast initial page loads with rich content.",
          solution:
            "Implemented code splitting, lazy loading, and image optimization to achieve sub-2-second load times.",
        },
        {
          problem: "SEO optimization for dynamic content.",
          solution:
            "Used semantic HTML, proper meta tags, and structured data markup for improved search visibility.",
        },
      ],

      contribution: [
        "Designed and implemented full application",
        "Optimized frontend performance",
        "Built RESTful API backend",
        "Deployed to cloud infrastructure",
        "Implemented SEO best practices",
      ],

      outcome:
        "Launched a live content platform with excellent performance metrics and positive user feedback on readability.",
    },

    meta: {
      tags: ["content", "blog", "media", "performance"],
    },
  },
];

export default projects;
