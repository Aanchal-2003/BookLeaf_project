# BookLeaf Author Support Portal — Engineering Approach & Architectural Trade-offs

## 1. Project Goals & Problem Statement
BookLeaf Publishing manages over 1,200 monthly titles across an active catalog of 22,000+ books. The primary operational bottleneck is high-volume author communication regarding complex topics: quarterly royalty calculations, ISBN platform mismatches, physical print defects, and distribution stock synchronization.

Our core goal was to build a secure, production-ready MERN web application with isolated Author and Operations Admin portals, powered by an AI assistant grounded in authentic BookLeaf operating policies to dramatically accelerate response times without compromising empathy, accuracy, or data security.

---

## 2. Architecture & Data Flow
The system is constructed with a decoupled MERN stack:
- **Backend (Express & MongoDB)**: RESTful controllers, domain services, and Mongoose ODM models. Data isolation is enforced at the controller query level: author endpoints extract `author_id` strictly from cryptographically verified JWT tokens rather than client-supplied URL or body parameters, eliminating Insecure Direct Object Reference (IDOR) vulnerabilities.
- **Frontend (React + Vite + Tailwind CSS)**: Styled with an editorial, publishing-house aesthetic (warm parchment tones `#FAF7F2`, charcoal typography `#1F2327`, and deep burgundy accents `#721C2B`). Implements near-real-time polling (5-second intervals with automatic cleanup) ensuring conversation updates and ticket status transitions reflect without full page reloads.
- **Database Indexing**: Compound indexes on `{ author_id: 1, status: 1 }` and `{ status: 1, priority: 1, createdAt: -1 }` guarantee fast dashboard aggregations and sub-second queue filtering as the catalog scales.

---

## 3. Grounded AI Integration & Human-in-the-Loop Philosophy
The core architectural focus is high AI Integration Quality. Our design implements three grounded capabilities:
1. **Auto-Classification**: Routes tickets into one of 6 official BookLeaf categories (`Royalty & Payments`, `ISBN & Metadata Issues`, `Printing & Quality`, `Distribution & Availability`, `Book Status & Production Updates`, `General Inquiry`).
2. **Dynamic Priority Scoring**: Evaluates business urgency based on policy rules (e.g. ISBN errors are flagged `High` with a 48-hour SLA; overdue royalties meeting the ₹1,000 threshold are prioritized over routine bio updates).
3. **Knowledge Base Grounded Response Drafting**: Injects relevant policy sections (80/20 royalty split, 45-day quarterly payout cycle, reprint policies) along with verified author and book data into the response generator.
4. **Safety & Zero-Hallucination Policy**: The AI is instructed never to invent payout dates, claim completed investigations, or promise unverified refunds.
5. **Mandatory Human-in-the-Loop**: Generated drafts are loaded into an interactive admin editor where staff can review, refine, regenerate, or discard the draft before dispatching. Responses are **never automatically sent** to authors.
6. **Resilience & Graceful Degradation**: If an external LLM API is rate-limited or unavailable, ticket creation and manual admin replies continue uninterrupted with explicit status tags (`ai_processing_status: 'failed'`).

---

## 4. Key Security Measures
- **HTTP-Only JWT Cookies**: Authentication tokens are stored in `HttpOnly`, `SameSite=Lax` cookies, preventing Cross-Site Scripting (XSS) token theft.
- **Permanent Internal Note Isolation**: Internal admin notes are stored in a dedicated `InternalNote` collection and are completely excluded from all author-facing routes and serializers.
- **Complete Audit Trail**: Administrative overrides (category, priority, assignee, status transitions) are immutably logged with the actor's identity, timestamps, previous values, and new values.
- **Data Integrity & Exact Null Preservation**: Production-stage books (`BK013`, `BK015`) retain null publication dates, null MRPs, and zero royalties without fabricating synthetic figures.

---

## 5. Architectural Trade-offs
- **Polling vs. WebSockets**: Selected polling (5-second active tab interval) over raw WebSockets. While WebSockets offer sub-second latency, polling provides superior reliability across serverless/PaaS hosting environments (e.g. Vercel, Render free tiers) without reconnection drops, complex sticky sessions, or stateful socket server overhead.
- **Pluggable AI Engine**: Engineered a dual-mode AI service that works with live LLMs (OpenAI, Gemini, Anthropic) while providing a deterministic local mock engine. This ensures the test suite and evaluation run immediately without requiring paid external API keys.

---

## 6. Testing Strategy & Production Evolution
- **Automated Test Suite**: 16 end-to-end integration tests using Vitest and Supertest verifying authentication, RBAC, IDOR prevention, ticket lifecycle, and audit logs.
- **Future Improvements**: If evolved into enterprise production, we would integrate Redis for queue pub/sub, AWS S3 with presigned URLs for author photo uploads of defective print copies, and automated webhook alerts into Slack/Zendesk for Critical-priority tickets.
