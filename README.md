# BookLeaf Author Support & Communication Portal

> **A production-ready full-stack MERN application for BookLeaf Publishing, featuring isolated Author and Operations Admin portals augmented by an AI response assistant grounded in real operational policies.**

[![Tests](https://img.shields.io/badge/tests-16%20passed-brightgreen.svg)](#automated-testing)
[![Stack](https://img.shields.io/badge/stack-MERN-blue.svg)](#technology-stack)
[![Node](https://img.shields.io/badge/node->=20.0.0-emerald.svg)](#prerequisites)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

---

## 1. Executive Summary

BookLeaf Publishing processes over 1,200 books monthly across an active catalog of 22,000+ titles in India and the US. Authors frequently reach out regarding royalties, book production status, ISBN platform issues, and printing defects. Handling these inquiries manually causes response delays and inconsistent communication.

This application provides a complete, secure, and production-tested solution:
- **Author Portal**: Authors log in to view their personalized catalog, inspect live sales & royalties, submit queries with associated books, and track near-real-time conversation threads.
- **Operations Admin Portal**: Staff members manage a unified ticket queue with multi-field search and filters, review AI-predicted categories and priorities, adjust administrative overrides, record private internal notes, and use an **AI Draft Studio** to review, edit, and dispatch grounded replies.
- **Grounded AI Engine**: Auto-classifies tickets into 6 official BookLeaf categories, scores priority based on business urgency, and drafts empathetic responses grounded in BookLeaf policies (80/20 royalty split, 45-day quarterly payout cycle, reprint protocols). **Human-in-the-loop is enforced: AI drafts are never sent automatically.**
- **Enterprise Security**: Role-based access control (RBAC), strict author data isolation preventing IDOR vulnerabilities, HTTP-only JWT cookies, dedicated private note isolation, and an immutable audit trail.

---

## 2. Technology Stack

- **Database**: MongoDB Server 9.0 (with Mongoose ODM 8.9)
- **Backend**: Node.js v24 LTS + Express.js 4.21 (ES Modules)
- **Frontend**: React 18.3 + Vite 5.4
- **Styling**: Tailwind CSS 3.4 (Editorial publishing palette: parchment `#FAF7F2`, charcoal `#1F2327`, burgundy `#721C2B`, forest green)
- **Routing**: React Router DOM 6.28
- **Icons**: Lucide React
- **HTTP Client**: Axios with credentials enabled
- **Security**: Helmet, bcryptjs (salt rounds = 10), jsonwebtoken (HTTP-only cookies), express-rate-limit, Zod
- **Testing**: Vitest 3.0 + Supertest 7.0

---

## 3. Architecture & Directory Structure

```
d:/BookLeaf_assignment/
├── client/                     # Vite + React Frontend SPA
│   ├── public/                 # Static brand assets & robots.txt
│   ├── src/
│   │   ├── api/                # Centralized Axios client with error interceptors
│   │   ├── components/common/  # Navbar, StatusBadge, LoadingSpinner, EmptyState
│   │   ├── context/            # AuthContext (session state, login, logout)
│   │   ├── layouts/            # AuthorLayout and AdminLayout (RBAC guards)
│   │   ├── pages/
│   │   │   ├── author/         # Login, Dashboard, My Books, Create Ticket, Detail
│   │   │   └── admin/          # Login, Dashboard, Ticket Queue, Workbench
│   │   ├── App.jsx             # React router configuration
│   │   ├── index.css           # Tailwind base styles & publishing utility classes
│   │   └── main.jsx            # React root mount
│   ├── .env.example            # Client environment template
│   ├── .gitignore              # Client ignore rules
│   ├── index.html              # HTML shell & Google Fonts typography
│   ├── package.json            # Client dependencies (React, Vite, Lucide, Tailwind)
│   ├── postcss.config.js       # PostCSS plugins
│   ├── tailwind.config.js      # Custom theme tokens & design system
│   ├── vite.config.js          # Dev proxy (/api -> localhost:5000)
│   └── README.md               # Frontend documentation
│
├── server/                     # Express.js REST API Backend
│   ├── data/                   # Bundled seed datasets (seed_data.json)
│   ├── scripts/
│   │   └── seed.js             # Idempotent data import (10 authors, 18 books, default admin)
│   ├── src/
│   │   ├── config/             # MongoDB connection (db.js) & environment (env.js)
│   │   ├── constants/          # Official enum values (categories, priorities, statuses)
│   │   ├── controllers/        # auth, book, ticket, and admin controllers
│   │   ├── knowledge/          # BookLeaf operating policies & context extractor
│   │   ├── middleware/         # Auth, RBAC, error handling, Zod validation
│   │   ├── models/             # Author, Book, Admin, Ticket, Message, InternalNote, AuditEvent
│   │   ├── routes/             # REST route declarations
│   │   ├── services/           # AIService (classification, priority, drafts) & AuditService
│   │   ├── utils/              # JWT signing, cookie handlers
│   │   ├── validators/         # Zod validation schemas
│   │   ├── app.js              # Express app pipeline & unified static asset serving
│   │   └── index.js            # Server entry point
│   ├── tests/
│   │   └── api.test.js         # Vitest + Supertest automated integration test suite
│   ├── .env                    # Active local environment variables
│   ├── .env.example            # Backend environment template
│   ├── .gitignore              # Server ignore rules
│   ├── package.json            # Server dependencies (Express, Mongoose, Zod, Vitest)
│   └── README.md               # Backend documentation
│
├── docs/                       # Comprehensive Architecture & Project Docs
│   ├── REQUIREMENTS.md         # Requirements matrix & policy rules
│   ├── IMPLEMENTATION_PLAN.md  # Architecture & phase specifications
│   ├── API_SPECIFICATION.md    # Complete REST API endpoint reference
│   └── APPROACH.md             # 1-page engineering approach & trade-off analysis
├── package.json                # Root monorepo orchestration (concurrently dev runner)
├── .env.example                # Root environment template
├── .gitignore                  # Monorepo gitignore
└── README.md
```

---

## 4. Quickstart & Local Setup

### 4.1 Prerequisites
1. **Node.js**: Version 20 LTS or higher (`node -v`)
2. **MongoDB**: Local MongoDB instance running on `localhost:27017` or MongoDB Atlas URI

### 4.2 Installation
Clone or navigate to the project directory and install dependencies:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4.3 Environment Configuration
Create a `.env` file in the `server/` directory (a pre-configured `.env` is already provided):

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/bookleaf
JWT_SECRET=bookleaf_super_secure_jwt_secret_key_change_in_production_2025
JWT_EXPIRES_IN=7d
COOKIE_SECRET=bookleaf_cookie_signing_secret_key_2025

DEFAULT_ADMIN_EMAIL=admin@bookleaf.com
DEFAULT_ADMIN_PASSWORD=Admin@BookLeaf2025
DEFAULT_AUTHOR_PASSWORD=BookLeaf@2025

AI_PROVIDER=mock
AI_API_KEY=
AI_MODEL=gpt-4o-mini
```

### 4.4 Database Seeding (Idempotent)
Run the automated seed script to import all 10 authors, 18 books, and provision the default admin account:

```bash
cd server
npm run seed
```

**Seed Verification Output:**
- `Authors in DB: 10 (Expected: 10)`
- `Books in DB: 18 (Expected: 18)`
- `Admins in DB: 1 (Expected: >= 1)`
- `Production Books: 2 (BK013 and BK015 accurately retain null publication dates, null MRP, and zero royalties)`
- Running `npm run seed` repeatedly produces zero duplicate records (`Inserted=0, Updated=10/18`).

### 4.5 Running the Application

You can start **both the Backend and Frontend together** with a single command from the root folder:

```bash
# Start both Backend (port 5000) and Frontend (port 5173) concurrently
npm start
```

Or you can start each service individually in separate terminals:

```bash
# Terminal 1: Backend Server (starts on http://localhost:5000)
cd server
npm start

# Terminal 2: Frontend Client (starts on http://localhost:5173)
cd client
npm start
```

Open your browser to **`http://localhost:5173`** to access the application.

---

## 5. Demo Test Credentials

To facilitate rapid testing and onboarding, both login pages include **one-click quick-fill buttons** on the interface.

### 5.1 Author Portal (`/login`)
| Author Name | Email | Password | Dataset Details |
|---|---|---|---|
| **Priya Sharma** | `priya.sharma@email.com` | `BookLeaf@2025` | 2 live books (`BK001`, `BK002`), ₹3,570 pending royalty |
| **Sneha Kulkarni** | `sneha.kulkarni@email.com` | `BookLeaf@2025` | 3 books including `BK013` (In Production - Cover Design) |
| **Kavita Deshmukh** | `kavita.deshmukh@email.com` | `BookLeaf@2025` | 2 books: `BK015` (In Production - Typesetting) & `BK016` (₹850 pending, below ₹1k threshold) |
| *All Authors* | *(any author from JSON)* | `BookLeaf@2025` | Formatted `firstname.lastname@email.com` |

### 5.2 Operations Admin Portal (`/admin/login`)
| Role | Email | Password | Privileges |
|---|---|---|---|
| **Operations Lead** | `admin@bookleaf.com` | `Admin@BookLeaf2025` | Full queue management, overrides, notes, AI drafts |

---

## 6. Automated Testing

The backend includes a comprehensive automated test suite powered by **Vitest** and **Supertest** covering 16 integration scenarios:
- Health and database connectivity
- Author login with valid and invalid credentials
- Admin login with role verification
- Author data isolation and IDOR prevention (author cannot view other authors' books)
- Author dashboard aggregate accuracy
- Ticket submission with automatic AI classification and priority scoring
- Verification of book ownership on ticket submission
- Admin queue filtering, search, and pagination
- Strict isolation of private internal notes (verified completely omitted from author views)
- Admin category overrides, priority adjustments, and immutable audit logging
- Dispatching admin replies and receiving them on the author message thread

Run the test suite with:

```bash
cd server
npm run test
```

**Test Execution Result:**
```
 ✓ tests/api.test.js (16 tests) 651ms
 Test Files  1 passed (1)
      Tests  16 passed (16)
```

---

## 7. AI Integration & Grounding Design

### 7.1 BookLeaf Operating Knowledge Base
The AI service incorporates BookLeaf operational rules defined in `server/src/knowledge/knowledgeBase.js`:
- **Royalty Split**: 80/20 net profit split. Net profit = MRP minus printing, platform commission, shipping.
- **Payout Timeline**: Quarterly calculations; paid within 45 days after quarter ends via linked bank transfer.
- **Minimum Threshold**: ₹1,000. Under ₹1,000 rolls over to next quarter.
- **ISBN Policy**: Assigned under BookLeaf imprint. ISBN platform mismatches are treated as High Priority with a 48-hour SLA.
- **Printing Defects**: Free reprint upon receiving photos of defective author copies (5–7 business days turnaround).
- **Distribution**: New listings take 7–10 business days to go live; platform stock sync resolved within 24–48 hours.

### 7.2 Human-in-the-Loop & Safety
1. **Auto-Classification**: Selects 1 of 6 official categories with confidence score and reasoning.
2. **Priority Scoring**: Predicts urgency (`Critical`, `High`, `Medium`, `Low`).
3. **Response Drafting**: Pre-generates an empathetic, grounded response incorporating verified author and book data.
4. **Editable Admin Studio**: In the Admin Workbench, staff can review, edit, regenerate, or discard the draft before clicking **"Approve & Dispatch to Author"**.
5. **Zero Auto-Send**: The system **never** automatically transmits AI drafts to authors.
6. **Graceful Degradation**: If an external LLM is down or unconfigured, ticket creation and manual replies remain fully functional with clear UI tags (`ai_processing_status: 'failed'`).

---

## 8. Production Build & Deployment

The application supports unified single-port deployment (the Express backend serves the pre-compiled React bundle from `client/dist` when available):

```bash
# 1. Build the React frontend
cd client
npm run build

# 2. Start the unified production server (serves frontend + API on port 5000)
cd ../server
npm start
```

### Deploying to Render / Railway / VPS:
1. Push repository to private GitHub/GitLab.
2. Set Build Command: `npm install --prefix server && npm install --prefix client && npm run build --prefix client`
3. Set Start Command: `npm start --prefix server`
4. Configure environment variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`).

---

## 9. Documentation Index

- [Requirements Verification Matrix](file:///d:/BookLeaf_assignment/docs/REQUIREMENTS.md)
- [Architecture & Implementation Plan](file:///d:/BookLeaf_assignment/docs/IMPLEMENTATION_PLAN.md)
- [Complete REST API Specification](file:///d:/BookLeaf_assignment/docs/API_SPECIFICATION.md)
- [1-Page Engineering Approach Document](file:///d:/BookLeaf_assignment/docs/APPROACH.md)

---

## 10. License

MIT License. Designed and engineered for BookLeaf Publishing.
