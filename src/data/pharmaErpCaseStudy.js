/**
 * TechNest Pharma ERP: in-depth case study.
 *
 * Source: the project's v4.0 engineering documentation (handover edition, Oct 2026) and the two
 * repositories it describes. The system is proprietary and internal to the client, so this
 * describes architecture and engineering decisions only. It deliberately omits supplier and
 * customer data, prices, schema and endpoint details, credentials, configuration names, and
 * contact information. The client is named because the project owner chose to; if the client has
 * not agreed to that, change `title`, `meta.company`, and the prose "TechNest" mentions in one place here.
 *
 * Every number below was counted from the documentation or the repository. No business-outcome
 * figures (hours saved, revenue) are claimed, because the documentation doesn't contain any.
 *
 * Published by src/scripts/addPharmaErpCaseStudy.js. Edit images, text, and visibility afterwards
 * from the admin panel; re-running the script never overwrites images or settings.
 */

export const pharmaErp = {
  slug: "pharma-sourcing-erp",
  title: "TechNest Pharma ERP",
  tagline: "Pharmaceutical Sourcing, Procurement & Finance Platform",
  description:
    "An internal ERP that follows a pharmaceutical sourcing opportunity from government tender notice to supplier quotation, purchase order, payment, and customer invoice. AI does the slow reading; a person approves every decision that matters.",

  type: "fullstack",
  status: "live",
  year: 2026,
  duration: "~10 weeks to client handover",

  // Created private on purpose: review the text, add images, then set the visibility in the admin panel.
  visibility: "private",

  media: { banner: "", thumbnail: "", gallery: [], videoDemo: "" },
  links: {},

  techStack: {
    primary: ["Next.js", "FastAPI", "PostgreSQL", "TypeScript", "Python"],
    frontend: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "TanStack Query", "React Hook Form", "Zod", "Tiptap"],
    backend: ["Python 3.12", "FastAPI", "SQLAlchemy", "Alembic", "Pydantic", "HTTPX", "Argon2"],
    database: ["PostgreSQL 16"],
    aiMl: ["Google Gemini", "NVIDIA-hosted models (fallback)", "Tesseract OCR", "pdfplumber"],
    realtime: ["Server-sent events", "Gmail push (Pub/Sub)"],
    devops: ["Docker", "Docker Compose", "Nginx", "Certbot", "GitHub Actions", "GHCR", "Cloudflare R2"],
    tools: ["Gmail API", "Resend", "PubChem", "FDA GSRS", "OpenAPI"],
  },

  summaryMetrics: {
    users: "Internal team: owner, staff, and viewer roles",
    scale: "70 tables, 278 API operations, 54 screens",
    impact: "One traceable record from tender notice to customer invoice",
  },

  caseStudy: {
    role: "Full-Stack Software Engineer",
    targetUsers: "Procurement, sourcing, and finance staff at a pharmaceutical trading company",

    showcaseNote:
      "This is a proprietary system built for TechNest Pharma's internal use, so this case study describes the architecture and the engineering decisions only. No supplier or customer details, prices, credentials, or financial records are shown, and the screenshots are anonymised.",

    problem:
      "Sourcing decisions lived in spreadsheets, shared mailboxes, and paper files. Tenders, supplier replies, quotations, and payments could not be traced to one another, and supplier prices quoted in different currencies and units could not be compared reliably.",

    solution:
      "A single application that follows each opportunity end to end. It captures tender notices, matches the requested products, emails suppliers, extracts and compares their quotations, issues purchase orders, tracks payables and landed cost, and raises customer invoices. AI helps at the slow steps, but nothing becomes official until a person approves it.",

    // The first four lead the homepage card, so they carry the strongest story.
    features: [
      "AI reads tenders, supplier emails, and quotations; a person approves every result before it becomes a record",
      "Side-by-side quotation comparison with unit and currency normalisation, and no hidden supplier recommendation",
      "Purchase orders through payables and landed cost, with the exchange rate frozen on every financial record",
      "One traceable chain from tender notice to customer invoice, backed by a complete activity audit log",
      "Tender notice capture on a schedule, with document extraction, OCR, and line-by-line review",
      "Product matching that explains how each match was made, plus automatic research on products missing from the catalogue",
      "Grouped supplier enquiries sent from a connected Gmail mailbox, with full communication timelines",
      "Purchase orders with signatures, PDF emailing, supplier confirmation, shipments, and batch-level receiving",
      "Supplier proforma and invoice matching, supplier statements, customer invoices, and CSV reports",
      "Three-role access control and TOTP two-factor authentication",
    ],

    architecture:
      "A Next.js frontend talks to a FastAPI REST backend organised in layers: routers handle transport, services own business rules and transactions, and repositories package queries. PostgreSQL is the single source of truth. Recurring work, such as mailbox sync, tender fetching, AI reading, and exchange-rate updates, runs as background loops inside the API process, made safe across workers with database advisory locks. Everything is containerised and rolled out through CI/CD to a VPS behind Nginx.",

    challenges: [
      {
        problem: "Supplier quotations arrive as free-form emails in different currencies, units, and terms.",
        solution:
          "A cheap rule filter finds quotation-like replies, a queued AI step extracts structured drafts, and a person approves each one against the source email. Only approved quotations feed the comparison, which normalises units and converts currencies without guessing.",
      },
      {
        problem: "AI is probabilistic and free-tier quotas are small, but pharmaceutical sourcing needs accountability.",
        solution:
          "Every model call goes through one module that validates output against a schema and falls back across providers. AI output is advisory until approved, and failures retry with back-off and then wait for a person.",
      },
      {
        problem: "Money records must stay correct and auditable even as exchange rates change daily.",
        solution:
          "Every binding financial record freezes the exchange rate that applied on its own date. Amounts use exact decimal arithmetic, and mistakes are reversed with a reason rather than deleted.",
      },
      {
        problem: "Government tenders often request substances that are not yet in the catalogue.",
        solution:
          "An enrichment pipeline researches the substance in public chemical registries, corroborates identity across sources, ranks candidates with a score that lists its reasons, and presents the result for approval.",
      },
    ],

    contribution: [
      "Designed the overall architecture, domain model, and the end-to-end procurement and finance workflow",
      "Built the FastAPI backend: 24 API modules, service and repository layers, and the PostgreSQL schema with 62 migrations",
      "Built the Next.js application: 54 screens, a typed data layer, role-aware navigation, and printable documents",
      "Implemented the AI layer: provider fallback, schema validation, background queues, and human approval gates",
      "Built the quotation comparison, purchase-order lifecycle, payables, landed-cost, and invoicing logic",
      "Implemented authentication, role-based access, two-factor authentication, and the audit trail",
      "Set up containers, CI/CD, TLS, and the production rollout, and wrote the handover documentation",
    ],

    outcome:
      "Delivered a working internal ERP, handed over to the client with full engineering documentation: an architecture guide, a 70-table database reference, and a 278-operation API reference generated from the live OpenAPI schema. The system gives the team one traceable record in place of spreadsheets and mailboxes.",

    learnings: [
      "Bounded automation earns trust faster than ambitious automation. People adopt AI quickly when they can see and approve what it proposed.",
      "Writing down what the system will not do is as valuable as the feature list, because it turns scope arguments into decisions.",
      "A boring, well-instrumented queue inside the database is often enough, and far easier to run than a new piece of infrastructure.",
      "Documentation is part of the product when you hand a system over, so it should be generated from the system wherever possible.",
    ],

    executiveSummary: {
      intro:
        "A pharmaceutical sourcing business was running tenders, supplier email, quotations, and payments across spreadsheets, mailboxes, and paper. I built one system that follows a sourcing opportunity from tender notice to customer invoice, and I made automation deliberately subordinate to human review.",
      points: [
        "Delivered a full-stack ERP covering sourcing, procurement, and finance in about ten weeks, with handover documentation.",
        "Used AI where it removes the most manual work (reading tenders, emails, and quotations) while keeping every official record behind a human approval.",
        "Made supplier prices genuinely comparable by normalising units and currencies, and refused to recommend a supplier on the buyer's behalf.",
        "Built financial records that stay correct over time: exchange rates frozen per record, exact decimal maths, and reversals instead of deletions.",
        "Shipped it production-ready: role-based access, two-factor authentication, an audit log, 638 automated tests, and CI/CD.",
      ],
    },

    keyMetrics: [
      { value: "~10", label: "Weeks to client handover" },
      { value: "70", label: "Database tables" },
      { value: "278", label: "API operations" },
      { value: "54", label: "Application screens" },
      { value: "638", label: "Automated tests" },
    ],

    context: [
      "The business sources active pharmaceutical ingredients, intermediates, excipients, finished products, and packaging materials from manufacturers and traders around the world, and responds to government tenders that ask for specific products. Each opportunity involves a long chain of steps: reading the tender, finding the product, finding suppliers, asking for quotes, comparing offers, placing an order, tracking shipments, and paying and invoicing.",
      "Before the system, that chain was held together by spreadsheets, shared email, and paper files. Information existed, but it was scattered, and nobody could easily answer questions such as which supplier last quoted this product, what that really costs per kilogram in the base currency, or which tender an order came from.",
      "The goal was not to automate a buyer's judgment. It was to remove the copying, searching, and reconciling around it, and to leave a trail that anyone could audit.",
    ],

    workflow: {
      intro:
        "The whole product is one chain of records. Each stage links to the one before it, so any invoice can be traced back to the tender notice that started it.",
      stages: [
        {
          track: "sourcing",
          title: "Tender notice captured",
          detail:
            "Notice sources are fetched on a schedule. Listing identity and document hashes stop the same notice entering twice.",
        },
        {
          track: "sourcing",
          title: "Extraction and review",
          detail:
            "PDF text and tables, with OCR where there is no text layer, become reviewable tender lines. The pipeline stops at 'needs review'; nothing becomes a live bid on its own.",
          ai: true,
          human: true,
        },
        {
          track: "sourcing",
          title: "Product matching and research",
          detail:
            "A five-tier ladder suggests catalogue matches and records how each was made. Unknown substances are researched in public registries and scored with named reasons.",
          ai: true,
          human: true,
        },
        {
          track: "sourcing",
          title: "Grouped supplier enquiry",
          detail:
            "One supplier, one enquiry, one email, many products. It is previewed, sent from the connected Gmail mailbox, and replies attach to the same thread.",
          human: true,
        },
        {
          track: "sourcing",
          title: "Quotation review",
          detail:
            "Cheap rules screen incoming replies, AI extracts a structured draft, and a person approves it against the source email before it becomes official.",
          ai: true,
          human: true,
        },
        {
          track: "finance",
          title: "Quotation comparison",
          detail:
            "Prices are normalised to kg, L, or piece and to the base currency, with the workings shown. Nothing is marked cheapest.",
          human: true,
        },
        {
          track: "finance",
          title: "Purchase order",
          detail:
            "Drafted from selected quotations, issued with a frozen exchange rate and payment schedule, signed, emailed as a PDF, and confirmed by the supplier.",
          ai: true,
          human: true,
        },
        {
          track: "finance",
          title: "Shipments and receiving",
          detail:
            "Shipments are suggested from supplier emails, goods are received with batch and expiry per line, and the supplier's invoice is matched to what was ordered and received.",
          ai: true,
          human: true,
        },
        {
          track: "finance",
          title: "Payables, payments, landed cost",
          detail:
            "Payables appear only when the supplier confirms. Payments are reversed, never deleted, and freight, duty, and bank charges are allocated to each line.",
          human: true,
        },
        {
          track: "finance",
          title: "Customer invoice and receipt",
          detail:
            "Signed, numbered invoices with server-side line maths, receipts, supplier statements, and CSV reports close the loop.",
          human: true,
        },
      ],
      outro:
        "Wherever a stage carries the person marker, the system stops and waits. That is the product's most important design rule.",
    },

    // Captions describe the screenshot for each slot; images are added in the admin panel (Case study -> Product tour).
    // Matching ready-made images: PortfolioSite-main/design/pharma-erp/out/ (see build.py there).
    screensIntro:
      "A tour of the screens that carry the workflow, from the first tender line to the audit trail. Supplier names in these screens are blurred.",
    screens: [
      {
        title: "Tender notice review",
        caption:
          "An OCR-read tender notice, with a warning wherever the scan and the site listing disagree. Every tender line waits for review before it counts.",
        image: "",
      },
      {
        title: "Tender shortlist",
        caption:
          "A tender's products shortlisted against candidate suppliers, with contact status and a one-click enquiry for each.",
        image: "",
      },
      {
        title: "Supplier enquiry",
        caption:
          "One enquiry per supplier, tracked from sent to completed, with the requested products, quotation review, and email thread in one place.",
        image: "",
      },
      {
        title: "Quotation review",
        caption:
          "The supplier's original email beside the structured draft the AI extracted. Nothing becomes official until a person approves it.",
        image: "",
      },
      {
        title: "Quotation comparison",
        caption:
          "Offers in different units and currencies side by side, normalised with the workings shown and no supplier recommended.",
        image: "",
      },
      {
        title: "Purchase order",
        caption:
          "A purchase order with priced lines, the frozen exchange rate, the payment schedule (payables), and receiving progress.",
        image: "",
      },
      {
        title: "Finance overview",
        caption:
          "Procurement, payables, payments, expenses, and receivables in one view, with a twelve-month trend.",
        image: "",
      },
      {
        title: "Activity audit log",
        caption:
          "Who changed what and when, across every module. The record behind the system's accountability.",
        image: "",
      },
    ],

    challengeIntro: "The brief sounded like a data-entry problem, but the hard parts were about trust and correctness:",
    challengePoints: [
      "How do you use AI on emails and documents without letting a wrong extraction become an official price or order?",
      "How do you compare quotes that arrive in different currencies, units, and pack sizes without quietly inventing conversions?",
      "How do you keep financial records stable when exchange rates move every day?",
      "How do you handle tenders that ask for products nobody has catalogued yet, without making a buyer research each one by hand?",
      "How do you run recurring background work safely, without adding infrastructure the client would have to operate?",
    ],

    constraints: [
      "Pharmaceutical sourcing is accountability-heavy: nothing automated can silently become an official record.",
      "AI quotas on free tiers are small, and models are sometimes overloaded, so the AI layer had to degrade gracefully.",
      "Tender pages and documents are scraped and read by OCR, so the source formats can change without warning.",
      "Quotations arrive in many currencies and units, and ambiguous units (such as drums or bags) cannot be converted safely.",
      "A small operational footprint: one server, with no message broker or separate cache for the client to run.",
    ],

    approachIntro: "I treated the system as one chain of records, and built it in the order the work actually flows.",
    approachSteps: [
      {
        title: "Modelled the whole chain first",
        body: "I mapped one opportunity from notice to invoice and designed the data so every step links to the one before it. That is what makes the final audit trail possible.",
      },
      {
        title: "Built in increments, sourcing before finance",
        body: "Sourcing came first: tenders, products, suppliers, enquiries, and quotations. Finance was layered on top: quotation comparison, then purchase orders, payables, costs, and sales. Each stage reused the records of the one before.",
      },
      {
        title: "Put a human gate at every AI boundary",
        body: "Extraction, matching, and research all produce proposals. A person confirms them. The code paths that create official records are separate from the code paths that read external data.",
      },
      {
        title: "Agreed the boundaries in writing",
        body: "Some things were explicitly left out, such as a general ledger, duty calculation, and stock management. They were recorded as decisions with the questions the client would need to answer to change them.",
      },
      {
        title: "Documented it as a deliverable",
        body: "The handover edition documents the architecture, workflows, database, and a complete API reference generated from the live OpenAPI schema, so the documentation stays true to the code.",
      },
    ],
    approachOutro:
      "The result is a system whose behaviour can be explained: every proposal shows how it was produced, and every official record shows who approved it and when.",

    architectureIntro: "A conventional, layered application. The interesting decisions are in how the pieces are bounded.",
    architectureComponents: [
      {
        name: "Next.js web application",
        detail: "App Router workspaces ordered the way work flows, a typed data layer with cached server state, role-aware navigation, and a separate print layout for letterhead documents.",
      },
      {
        name: "FastAPI REST API",
        detail: "24 modules and 278 operations. Routers handle transport, services own business rules and transactions, and repositories package queries. Domain errors are mapped centrally.",
      },
      {
        name: "PostgreSQL",
        detail: "The single source of truth: 70 tables, native enums, exact numeric money, advisory locks for safe background work, and 62 migrations.",
      },
      {
        name: "Background workers",
        detail: "Seven in-process loops handle follow-ups, mailbox sync, tender fetching, AI reply reading, product research, and exchange-rate sync, each safe across workers.",
      },
      {
        name: "AI layer",
        detail: "One module owns every model call: schema-validated output, provider fallback, retry with back-off, and a record of which model answered.",
      },
      {
        name: "Integrations and storage",
        detail: "Gmail for supplier mail, Cloudflare R2 for documents behind authenticated downloads, Resend for system email, and public chemical registries for research.",
      },
    ],
    architectureOutro:
      "Nothing in the design is exotic. That was deliberate: a small team can operate it, and a new developer can find where a rule lives.",
    architectureNotes: [
      {
        title: "Business rules enforced in code, not convention",
        body: [
          "A supplier's latest quotation is decided by the date the email arrived, never by the date printed inside it.",
          "Payables are created only when the supplier confirms an order, in the same transaction that confirms it.",
          "Issued purchase-order lines are immutable. Only delivery date, port, notes, and the signature can still change.",
          "An order can be cancelled only before goods are received, and after any payments are reversed.",
          "An exchange rate that any financial record depends on cannot be deleted.",
          "Invoice numbers come from an atomic per-year counter and are assigned at issue, so abandoned drafts never waste a number.",
        ],
      },
      {
        title: "Access model: three roles, enforced on the server",
        body: [
          "Viewers read. Staff prepare operational and financial records. Owners do everything, including the steps that need separation of duties.",
          "Staff can prepare a data import, but only an owner can approve and commit it.",
          "Backend dependencies are the authority. Hiding a button in the interface is never the control.",
        ],
      },
    ],

    deepDives: [
      {
        title: "AI that proposes, and people who decide",
        paragraphs: [
          "The first rule of the AI layer is that a model can read, but it cannot decide. Incoming supplier mail is only queued. A background worker, not the request that received the email, makes the model calls, so mail sync never waits on, or fails because of, an AI provider.",
          "Cheap rules run first: quotation signals and shipping keywords are checked before any model is called, so unrelated mail costs nothing. The worker claims small batches with an atomic update under a database advisory lock, so a reply is never read twice and a burst of mail never becomes a burst of simultaneous model calls.",
          "Every call goes through a single module that asks for JSON matching a schema and validates the answer again before it touches the database. If a model is overloaded or out of quota, the call falls back to the next model, and then to a second provider. Rate-limited or unavailable items retry with exponential back-off, then wait for a person. A failed reading never changes an email or an order.",
          "Even a supplier's purchase-order confirmation is confirmed automatically only when every condition holds: the order is in the right state, the model is highly confident, the email quotes the right order number, the sender is a known address for that supplier, and no commercial term is being changed. In every other case it goes to a person. The backend, not the model, makes that decision.",
        ],
      },
      {
        title: "Comparing prices that were never comparable",
        paragraphs: [
          "Suppliers quote the same product in dollars per kilogram, euros per metric tonne, or a price band with a minimum order. The quotation comparison puts them side by side by converting each price to a canonical unit and to the base currency, while always showing the original value and the workings next to the result.",
          "The rules are strict on purpose. A unit that cannot be converted safely, such as a drum, bag, or vial, is labelled not comparable instead of being guessed. A missing exchange rate leaves the base price blank and says so. Mass, volume, and count are never converted into one another.",
          "The \"latest quotation\" for a supplier uses the date the email actually arrived (or the entered date, for a manual quote), not the date printed inside the quote, because suppliers often resend old reference dates. And the screen never marks anything cheapest or best. It prepares the evidence, and the buyer chooses.",
        ],
      },
      {
        title: "Money records that stay true",
        paragraphs: [
          "Every binding financial record, whether an issued purchase order, a payable, a payment, an expense, an invoice, or a receipt, stores the exchange rate that applied on its own date, along with the resulting base-currency amount. Nothing recalculates it afterwards, and a rate that any record depends on cannot be deleted.",
          "Amounts are exact decimals end to end, rounded the way a bank statement rounds. Payments and receipts are never deleted: a mistake is reversed with a mandatory reason, and the original row, the reversal, the user, and the time all remain. Document numbers come from an atomic per-year counter, so two people issuing at the same moment can never collide.",
          "Obligations follow reality, not hope. A purchase order is issued internally first, then emailed to the supplier, and payables are created only when the supplier confirms. Supplier proformas and invoices are then matched against what was ordered and what was received, and any difference is shown for a person to decide.",
        ],
      },
      {
        title: "Researching products nobody has catalogued yet",
        paragraphs: [
          "When a tender line matches nothing in the catalogue, a buyer used to research the substance by hand. The enrichment pipeline now does the first pass: it resolves the wording to a compound in a public chemical database, corroborates the CAS number against a regulatory registry, and then looks for suppliers by that number.",
          "The result is ranked with a score built only from named signals, such as the number printed on the tender matching, a trusted source confirming it, two sources agreeing, or evidence conflicting. A figure like 85% always reads as a list of reasons. Close scores for two different substances are treated as an ambiguity, not a ranking, and conflicts are flagged for review instead of being resolved silently.",
          "External research never writes to the catalogue. The only code that turns research into a product, a synonym, or a supplier runs when a staff member presses Approve. Sources were also chosen after checking each site's rules, and sites that disallow scraping are not scraped.",
        ],
      },
      {
        title: "Background work without a message broker",
        paragraphs: [
          "The system needs scheduled and queued work: fetching tenders on a schedule, reconciling mail, reading replies, researching products, and syncing exchange rates. Rather than add a broker and a cache for the client to operate, these run as asynchronous loops inside the API process, with PostgreSQL providing the coordination.",
          "Advisory locks ensure only one worker performs a given pass, atomic updates claim each item exactly once, and stuck items are released after a timeout. Notifications carry deduplication keys, so recurring sweeps stay safe across workers. The honest limit is that this suits a single-server deployment. If the system ever needed to scale across several servers, a durable queue and a shared rate limiter would be the next step.",
        ],
      },
    ],

    tradeoffs: [
      {
        decision: "Human approval before any AI output becomes official",
        alternative: "Fully automated extraction and ordering",
        rationale: "Extraction is probabilistic and the data is financial and regulatory. A person approving against the source email costs seconds and removes the worst failure mode.",
      },
      {
        decision: "Background loops with PostgreSQL advisory locks",
        alternative: "A message broker and a separate worker fleet",
        rationale: "Far fewer moving parts for a single-server deployment. The trade-off, limited horizontal scaling, is documented and acceptable for the current load.",
      },
      {
        decision: "An operational finance ledger",
        alternative: "A full general ledger and accounting module",
        rationale: "The client needed to track orders, payables, costs, and invoices. Accounting depth was explicitly left out, with the open questions recorded for a future phase.",
      },
      {
        decision: "Exchange rates frozen on each financial record",
        alternative: "Recalculating at reporting time with the latest rate",
        rationale: "Recalculation silently changes history. Freezing gives a stable audit trail, and the difference between booking and payment rates stays visible.",
      },
      {
        decision: "Show normalised prices without recommending a supplier",
        alternative: "Automatically ranking or highlighting the cheapest offer",
        rationale: "The cheapest price is not always the right supplier. The system prepares the evidence and the buyer decides.",
      },
      {
        decision: "Controlled vocabularies defined in code",
        alternative: "Database enumerations for payment methods and expense categories",
        rationale: "Adding a new term needs no migration, which suits terms the client was still deciding.",
      },
      {
        decision: "Decoupled Next.js frontend and FastAPI backend",
        alternative: "A single full-stack framework",
        rationale: "A typed OpenAPI contract between them keeps both sides honest, and produced the generated API reference for handover.",
      },
    ],

    security: {
      intro: "An internal business system holds supplier relationships, prices, and financial records, so access is strict and observable.",
      points: [
        "Passwords hashed with Argon2, short-lived access tokens kept in memory, and HTTP-only refresh cookies with rotation and reuse detection.",
        "Optional TOTP two-factor authentication, forced password change for invited users, and one-time, expiring reset tokens.",
        "Three roles (owner, staff, viewer) enforced by server-side dependencies. Hiding a button is never the control.",
        "Separation of duties: staff prepare imports, only an owner can approve and commit them.",
        "Mailbox tokens encrypted at rest, and production refuses plaintext storage. OAuth state is validated, and push notifications verify their signing identity.",
        "Private documents served only through authenticated endpoints, with separate storage for public avatars.",
        "Rate limits on every caller, tighter on login and password reset, plus a complete activity audit log of who changed what.",
      ],
    },

    deployment: {
      intro: "The system is containerised and shipped through a pipeline, so a release is a repeatable action rather than a manual task.",
      points: [
        "Docker Compose runs PostgreSQL, the API, the web app, Nginx, and automatic certificate renewal on a VPS.",
        "GitHub Actions builds the API and web images separately, publishes them to a container registry, and rolls out over SSH when the main branch advances.",
        "CI runs linting and the backend test suite against a real PostgreSQL database, and linting, type-checking, and a production build for the frontend.",
        "Database migrations can run as part of startup, and documents are designed to live in private object storage rather than on the container's disk.",
      ],
    },

    results: {
      metrics: [
        { label: "Database tables", value: "70" },
        { label: "API operations across 24 modules", value: "278" },
        { label: "Application screens", value: "54" },
        { label: "Automated tests", value: "638" },
        { label: "Database migrations", value: "62" },
        { label: "Background workers", value: "7" },
        { label: "Lines of code (Python and TypeScript)", value: "130k+" },
      ],
      modulesNote:
        "These figures describe the size and rigour of the system, counted from the repository and its generated documentation. They are not business-outcome claims.",
      businessImpact: [
        "Replaced scattered spreadsheets, mailboxes, and paper with a single system of record for the entire sourcing and finance chain.",
        "Made every decision traceable, from the tender notice that started an opportunity to the payment that closed it.",
        "Took the slow reading, copying, and researching work off buyers, while keeping each approval with a person.",
        "Gave the client a system they can extend, backed by a handover document, a database reference, and an API reference.",
      ],
    },

    improvements: [
      "Introduce a durable queue and a shared rate limiter if the system needs to scale across several servers.",
      "Add a staging environment and a manual approval step before production deployments.",
      "Ship database backups off-host and add central logging and metrics for production visibility.",
      "Paginate the finance lists, which were left unpaginated while data volumes were small.",
      "Extend the scope the client chooses to open up: stock and warehouse tracking, bank reconciliation, and letter-of-credit tracking.",
    ],

    reflection: [
      "The part I am proudest of is not the AI. It is the discipline around it. Anyone can call a model; the harder work is deciding what the model is not allowed to do, and then making that boundary part of the code rather than a convention.",
      "Pharmaceutical sourcing rewards that kind of care. A wrong price, a guessed unit, or a silently changed exchange rate is not an inconvenience, it is a financial and regulatory problem. Building a system that shows its workings, refuses to guess, and leaves a trail turned out to be the whole product.",
    ],
  },

  meta: {
    featured: true,
    tags: ["ERP", "pharmaceutical", "procurement", "finance", "AI automation", "internal tool"],
    company: "TechNest Pharma",
    confidentialityNote:
      "Proprietary internal system. Architecture and engineering decisions only; no client data, supplier details, credentials, or financial records.",
  },
};

export default pharmaErp;
