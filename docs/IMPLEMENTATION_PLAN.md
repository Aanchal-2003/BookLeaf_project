# BookLeaf Author Support Portal — Architecture & Implementation Plan

## 1. System Architecture

The BookLeaf Author Support Portal is designed as a modular, decoupled full-stack MERN application with a strict separation of concerns:

```
+-------------------------------------------------------------------------------+
|                               Frontend (React + Vite)                         |
|  Tailwind CSS | React Router | Lucide Icons | Axios Client (withCredentials)  |
|                                                                               |
|  [Author Portal Pages]                        [Admin Portal Pages]            |
|  - Login (/login)                             - Admin Login (/admin/login)    |
|  - Author Dashboard (/dashboard)              - Admin Dashboard (/admin)      |
|  - My Books (/books)                          - Ticket Queue (/admin/tickets) |
|  - Submit Ticket (/tickets/new)               - Ticket Detail & Workbench     |
|  - Ticket History & Thread (/tickets/:id)     - AI Response Approval Studio   |
+---------------------------------------+---------------------------------------+
                                        | HTTPS / REST / JSON Cookies
                                        v
+-------------------------------------------------------------------------------+
|                            Backend (Node.js + Express)                        |
|                                                                               |
|  [Middleware Layer]                                                           |
|  - Helmet & CORS (strict credentials)                                         |
|  - Cookie Parser & JWT Verification                                           |
|  - RBAC Guard (Author vs Admin)                                               |
|  - Rate Limiting & Input Validation (Zod)                                     |
|                                                                               |
|  [API Routes & Controllers]                                                   |
|  - /api/auth       (login, logout, me)                                        |
|  - /api/books      (author books catalog)                                     |
|  - /api/tickets    (author & admin CRUD, state management)                    |
|  - /api/messages   (public thread messages)                                   |
|  - /api/admin      (metrics, assignments, private notes, overrides, audit)    |
|  - /api/ai         (classify, score priority, draft response)                 |
|                                                                               |
|  [Domain Services]                                                            |
|  - AIService       (Pluggable LLM Adapter: OpenAI / Gemini / Anthropic / Mock)|
|  - KnowledgeBase   (Indexed BookLeaf policies, prompt context injector)       |
|  - AuditService    (Records state transitions and admin overrides)            |
|                                                                               |
|  [Data Layer (Mongoose ODM)]                                                  |
|  - Author | Book | Admin | Ticket | Message | InternalNote | AuditEvent       |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
                             [MongoDB Database Server]
```

---

## 2. Directory Structure

```
d:/BookLeaf_assignment/
├── client/                     # Vite + React Frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/                # Centralized Axios client & endpoint wrappers
│       ├── context/            # AuthContext, NotificationContext
│       ├── components/         # Shared UI (Navbar, Sidebar, Badges, Modals, Tables)
│       ├── layouts/            # AuthorLayout, AdminLayout, AuthLayout
│       └── pages/              # Author and Admin view components
│
├── server/                     # Express.js Backend
│   ├── package.json
│   ├── src/
│   │   ├── index.js            # Server entry point
│   │   ├── app.js              # Express app configuration & middleware pipeline
│   │   ├── config/             # DB connection, environment schema
│   │   ├── constants/          # Enums (categories, priorities, statuses)
│   │   ├── models/             # Mongoose schemas (Author, Book, Admin, Ticket, etc.)
│   │   ├── routes/             # Express route declarations
│   │   ├── controllers/        # Request handling and response formatting
│   │   ├── middleware/         # Auth, RBAC, error handling, rate limiting
│   │   ├── validators/         # Request schema validation
│   │   ├── services/           # Business logic, AIService, AuditService
│   │   ├── knowledge/          # BookLeaf policies & prompt engineering templates
│   │   └── utils/              # Token utils, pagination helpers, formatters
│   ├── scripts/                # Database seed script (import JSON, seed admin)
│   └── tests/                  # Automated integration tests (Supertest + Vitest)
│
├── docs/                       # Project documentation
│   ├── REQUIREMENTS.md         # Requirements matrix & policy rules
│   ├── IMPLEMENTATION_PLAN.md  # Architecture & phase plan
│   ├── API_SPECIFICATION.md    # OpenAPI / REST endpoint documentation
│   └── APPROACH.md             # Architecture write-up & trade-offs
└── README.md                   # Complete local setup & deployment guide
```

---

## 3. Implementation Phases & Milestones

### Phase 1: Project Setup & Baseline Architecture
- Initialize root workspace with `client/` (Vite + React + Tailwind CSS) and `server/` (Express + Mongoose).
- Configure environment variables (`.env`, `.env.example`).
- Implement central error handling, CORS with credentials, Helmet security headers.
- Establish database connection with graceful fallback / in-memory server support.
- Add healthcheck endpoints (`/api/health`).

### Phase 2: Database Models & Idempotent Seeding
- Define Mongoose schemas with indexes:
  - `Author`: `author_id`, `name`, `email`, `phone`, `city`, `joined_date`, `password_hash`.
  - `Book`: `book_id`, `author_id` (ref Author), `title`, `isbn`, `genre`, `publication_date`, `status`, `mrp`, `author_royalty_per_copy`, `total_copies_sold`, `total_royalty_earned`, `royalty_paid`, `royalty_pending`, `last_royalty_payout_date`, `print_partner`, `available_on`.
  - `Admin`: `name`, `email`, `password_hash`, `role`, `is_active`.
  - `Ticket`: `ticket_number`, `author_id`, `book_id`, `subject`, `description`, `category`, `ai_predicted_category`, `priority`, `ai_predicted_priority`, `status`, `assigned_admin_id`, `ai_processing_status`, `error_metadata`.
  - `Message`: `ticket_id`, `sender_type` ('author'|'admin'), `sender_id`, `content`, `created_at`.
  - `InternalNote`: `ticket_id`, `admin_id`, `content`, `created_at`.
  - `AuditEvent`: `ticket_id`, `actor_type`, `actor_id`, `action`, `field_changed`, `previous_value`, `new_value`, `created_at`.
- Build idempotent seed script (`server/scripts/seed.js`):
  - Read `bookleaf_sample_data.json`.
  - Upsert 10 authors and 18 books with exact null preservation.
  - Generate development admin user (`admin@bookleaf.com`).
  - Verify record counts and test idempotency (running twice produces identical counts).

### Phase 3: Authentication, Authorization & Core REST API
- Implement JWT authentication with secure HTTP-only cookies.
- Build author endpoints (Dashboard summary, books list, ticket creation, ticket thread).
- Build admin endpoints (Queue with filters/sorting/pagination, detail, status updates, overrides, assignment, notes, replies).
- Implement strict RBAC middleware preventing author cross-access and hiding internal notes.
- Write backend integration test suite.

### Phase 4: Author Portal Frontend
- Publishing house aesthetic: warm neutral backgrounds, dark charcoal typography, elegant status badges.
- Author login page.
- Dashboard with live author statistics (total books, published count, total earned, paid, pending royalties).
- "My Books" table handling null fields cleanly ("Not available", distinction of in-production stages).
- Ticket submission form with book dropdown and "General / Account Level".
- Ticket list and detailed ticket message view with live polling.

### Phase 5: Admin Dashboard & Support Workbench
- Admin dashboard overview metrics (tickets by status, priority alerts, category breakdown).
- Ticket queue data table with search and filtering by status, category, priority, date range, and assignee.
- Ticket workbench: Author snapshot, associated book details, thread, private notes, assignment.
- Category & priority override actions with audit trail tracking.

### Phase 6: AI Integration (Classification, Priority, Response Drafting)
- Knowledge base module encoding BookLeaf operating policies.
- AI service with clean prompt engineering and structured JSON outputs.
- Ticket classification into 6 categories with reasoning.
- Priority scoring based on business rules (e.g. ISBN errors = High, long overdue royalties = High/Critical).
- Grounded draft generation combining ticket details + author book data + relevant policy section.
- Admin draft editor: Admin can edit, regenerate, or discard draft before sending.
- Graceful degradation: If AI is disabled or fails, manual ticketing remains fully operational.

### Phase 7: Real-Time Updates & End-to-End Verification
- Polling mechanism with adaptive backoff for both author and admin interfaces.
- Comprehensive end-to-end testing of author and admin flows.
- Automated API test verification.

### Phase 8: Deployment Readiness & Documentation
- Produce complete `README.md` with setup instructions, credentials, architecture notes.
- Produce `docs/API_SPECIFICATION.md` detailing all endpoints.
- Produce `docs/APPROACH.md` (1-page architectural summary and trade-off analysis).
- Verify production build.

### Phase 9: Final Quality & Security Review
- Rigorous self-audit against production standards (AI quality, System Architecture, API Robustness, Core Functionality, UI/UX, Documentation).
- Verification of edge cases, security, and data integrity.
