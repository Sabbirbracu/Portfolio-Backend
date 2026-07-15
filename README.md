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

## Notes

- The `Project` model mirrors `src/types/project.ts` in the frontend, including nested `media`, `links`, `techStack`, `caseStudy`, and `meta` blocks. JSON output maps `_id` → `id` to match the frontend types.
- Login and password-reset routes are rate-limited (10 attempts / 15 min).
- Passwords are hashed with bcrypt (12 rounds); reset tokens are SHA-256 hashed and expire in 15 minutes.
- Forgot-password currently logs the reset URL to the console — wire up an email provider (Resend, Nodemailer) before production.
