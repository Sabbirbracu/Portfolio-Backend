# PortfolioSite Backend

Express + MongoDB (Mongoose) REST API for the PortfolioSite frontend. Response shapes and routes match the frontend's RTK Query `apiSlice` exactly, and the Vite dev server already proxies `/api` → `http://localhost:5001`.

## Setup

```bash
npm install
# edit .env — set MONGODB_URI (local or Atlas) and ADMIN_PASSWORD
npm run seed     # creates the admin account from .env
npm run dev      # starts on http://localhost:5001 with auto-reload
```

## Structure

```
src/
├── server.js            # entry point
├── app.js               # express app, middleware, route mounting
├── config/db.js         # mongoose connection
├── models/              # Admin, Project, Article, Contact
├── controllers/         # request handlers
├── routes/              # route definitions
├── middleware/          # auth (JWT), error handler
├── utils/               # AppError
└── scripts/seed.js      # admin account seeder
```

## API

All responses use `{ success, message, data }` (except `GET /api/auth/verify`, which returns `{ valid, admin }` as the frontend expects).

### Auth
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/api/admin/login` | public | `{ email, password }` → token + admin |
| GET | `/api/auth/verify` | Bearer token | validates JWT |
| POST | `/api/auth/forgot-password` | public | reset link is logged to server console (no mailer yet) |
| POST | `/api/auth/reset-password` | public | `{ token, password }` |

### Content
| Method | Route | Access |
|---|---|---|
| GET | `/api/portfolio` | public — featured projects + latest articles + stats |
| GET | `/api/projects` | public (`?type=fullstack`, `?featured=true`) |
| GET | `/api/projects/:slug` | public |
| POST / PUT `/:id` / DELETE `/:id` | `/api/projects` | Bearer token |
| PUT | `/api/projects/order` | Bearer token — `{ ids: [...] }` saves the drag-and-drop display order (`meta.order`) used by the homepage and All Projects page |
| POST | `/api/projects/generate` | Bearer token — `{ notes }` → unsaved AI-generated project draft (needs `ANTHROPIC_API_KEY`; 20/hour) |

`GET /api/projects` hides `visibility: "private"` projects from the public; the admin panel passes `?includeHidden=true` with its token to see them. Projects are returned in the admin's drag-and-drop order (`meta.order`, then newest). The homepage "Selected Work" section is the `?featured=true` subset of that same order; new projects are appended to the end.
| GET | `/api/articles` | public |
| GET | `/api/articles/:slug` | public |
| POST / PUT `/:id` / DELETE `/:id` | `/api/articles` | Bearer token |

### Contact
| Method | Route | Access |
|---|---|---|
| POST | `/api/contact` | public, rate-limited (5/hour) |
| GET | `/api/contact` | Bearer token |
| PATCH | `/api/contact/:id/status` | Bearer token — `new` / `read` / `replied` |
| DELETE | `/api/contact/:id` | Bearer token |

### Media (Cloudflare R2)
| Method | Route | Access |
|---|---|---|
| POST | `/api/media` | Bearer token — multipart `files` fields (≤10 files, 25MB each, images/mp4/webm/pdf), optional `folder`; returns public R2 URLs |

## Email (Resend)

Password reset, "password changed" confirmations and contact-form notifications are sent through [Resend](https://resend.com) (`src/services/mailer.js`, templates in `src/services/emailTemplates.js`). Set in `.env`:

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key. Without it mail is skipped (logged), never crashes a request. |
| `MAIL_FROM` | Sender, e.g. `Sabbir Ahmad <noreply@bysabbir.com>` — must be on a domain verified in Resend. |
| `MAIL_NOTIFY_TO` | Inbox that receives "new contact message" notifications (Reply-To is set to the visitor). |
| `MAIL_REPLY_TO` | Optional Reply-To on system mail, e.g. `hello@bysabbir.com`. |
| `SITE_URL` | Public frontend URL used in email links (falls back to the first `CLIENT_URL`). |

Emails are sent fire-and-forget so a mail outage never fails the request, and so `forgot-password` responds in the same time whether or not the account exists.

## Notes

- The `Project` model mirrors `src/types/project.ts` in the frontend, including nested `media`, `links`, `techStack`, `caseStudy`, and `meta` blocks. JSON output maps `_id` → `id` to match the frontend types.
- Login and password-reset routes are rate-limited (10 attempts / 15 min).
- Passwords are hashed with bcrypt (12 rounds); reset tokens are SHA-256 hashed and expire in 15 minutes.
- Forgot-password currently logs the reset URL to the console — wire up an email provider (Resend, Nodemailer) before production.
