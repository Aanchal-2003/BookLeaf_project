# BookLeaf Author Support & Communication Portal — Requirements Specification & Verification Matrix

## 1. Project Overview & Context
BookLeaf Publishing is a leading self-publishing company operating across India and the US, processing over 1,200+ books monthly across an active catalog of 22,000+ titles. Authors frequently reach out regarding royalties, book production status, ISBN issues, quality control, and distribution.

This document details the functional, non-functional, business logic, data, and AI requirements for the **Author Support & Communication Portal** — a full-stack MERN application providing isolated author and administrator portals augmented by an AI assistant grounded in BookLeaf operational policies.

---

## 2. Final Requirements Verification Matrix

| ID | Module | Requirement Description | Implementation Reference | Verification Evidence | Status |
|---|---|---|---|---|---|
| **REQ-AUTH-01** | Auth | Email-based authentication for Authors | `server/src/controllers/authController.js` | Tested in `api.test.js` ("Author login succeeds with correct credentials") | **Complete & Verified** |
| **REQ-AUTH-02** | Auth | Role-based authentication for Admin Staff | `server/src/controllers/authController.js` | Tested in `api.test.js` ("Admin login succeeds with seeded credentials") | **Complete & Verified** |
| **REQ-AUTH-03** | Auth | Secure Session Management & Logout | `server/src/utils/token.js` & `authController.js` | Tested via automated E2E & auth logout routes | **Complete & Verified** |
| **REQ-SEC-01** | Security | Strict Author Data Isolation (Prevent IDOR) | `server/src/middleware/auth.js` | Tested in `api.test.js` ("Author cannot access another author's book directly") | **Complete & Verified** |
| **REQ-SEC-02** | Security | Role-Based Access Control (RBAC) | `server/src/middleware/auth.js` (`requireAdmin`) | Tested in `api.test.js` ("Author cannot access protected admin endpoints") | **Complete & Verified** |
| **REQ-SEC-03** | Security | Private Internal Notes Isolation | `server/src/models/InternalNote.js` | Tested in `api.test.js` ("Author never sees internal notes") | **Complete & Verified** |
| **REQ-DASH-01** | Author Portal | Author Dashboard Summary | `server/src/controllers/bookController.js` | Tested in `api.test.js` & verified live on `/dashboard` | **Complete & Verified** |
| **REQ-BOOK-01** | Author Portal | "My Books" Listing | `client/src/pages/author/AuthorBooks.jsx` | Verified via `/books` table displaying Priya Sharma's titles | **Complete & Verified** |
| **REQ-BOOK-02** | Author Portal | Null & Edge Case Data Presentation | `client/src/pages/author/AuthorBooks.jsx` | Verified: BK013 and BK015 render "Not available" for null MRP/dates, zero royalties as "₹0" | **Complete & Verified** |
| **REQ-TCK-01** | Author Portal | Ticket Submission Form | `client/src/pages/author/AuthorCreateTicket.jsx` | Form submits book or General ticket, tested in `api.test.js` | **Complete & Verified** |
| **REQ-TCK-02** | Author Portal | Ticket History & Detail | `client/src/pages/author/AuthorTicketDetail.jsx` | Thread displays messages and status badges without internal notes | **Complete & Verified** |
| **REQ-ADM-01** | Admin Portal | Operations Dashboard | `client/src/pages/admin/AdminDashboard.jsx` | Dynamic metrics for Open, In Progress, Resolved, Closed, Critical/High | **Complete & Verified** |
| **REQ-ADM-02** | Admin Portal | Ticket Queue & Advanced Filtering | `client/src/pages/admin/AdminTicketQueue.jsx` | Search across #, subject, author; filters for status, category, priority, assignee | **Complete & Verified** |
| **REQ-ADM-03** | Admin Portal | Ticket Management & Status Lifecycle | `server/src/controllers/adminController.js` | Status transitions tested in `api.test.js` | **Complete & Verified** |
| **REQ-ADM-04** | Admin Portal | Internal Admin Notes | `server/src/controllers/adminController.js` | Verified in Workbench: private note saved to dedicated collection and audit log | **Complete & Verified** |
| **REQ-ADM-05** | Admin Portal | Public Responses to Authors | `server/src/controllers/adminController.js` | Verified in `api.test.js` ("Admin sends public reply and author receives it") | **Complete & Verified** |
| **REQ-AI-01** | AI Service | Automatic Ticket Classification | `server/src/services/aiService.js` | Auto-classifies into 6 official BookLeaf categories; tested in `api.test.js` | **Complete & Verified** |
| **REQ-AI-02** | AI Service | Automatic Priority Scoring | `server/src/services/aiService.js` | Priority scored based on business urgency (ISBN mismatch = High); tested in `api.test.js` | **Complete & Verified** |
| **REQ-AI-03** | AI Service | Grounded Response Drafting | `server/src/knowledge/knowledgeBase.js` | Grounded drafts reflect 80/20 split, 45-day window, reprint rules without hallucination | **Complete & Verified** |
| **REQ-AI-04** | AI Service | Human-in-the-Loop Review | `client/src/pages/admin/AdminTicketDetail.jsx` | Admin reviews and edits draft in AI Studio before dispatching; never auto-sent | **Complete & Verified** |
| **REQ-AI-05** | AI Service | Graceful Degradation & Resilience | `server/src/services/aiService.js` | Fallback mechanism ensures ticket creation succeeds even if AI service is down | **Complete & Verified** |
| **REQ-AI-06** | AI Service | Token & Cost Efficiency | `server/src/knowledge/knowledgeBase.js` | `getRelevantPolicyContext()` extracts only pertinent policy excerpts per category | **Complete & Verified** |
| **REQ-RT-01** | Real-Time | Near-Real-Time Updates | `client/src/pages/author/AuthorTicketDetail.jsx` | 5-second polling interval with automatic cleanup delivers replies without refresh | **Complete & Verified** |
| **REQ-AUD-01** | Audit | Audit Trail for Admin Actions | `server/src/models/AuditEvent.js` | Tested in `api.test.js`: category and priority overrides immutably logged with actor & values | **Complete & Verified** |
| **REQ-DATA-01** | Data Import | Idempotent Sample Data Seeding | `server/scripts/seed.js` | Executed twice consecutively: 10 authors, 18 books, 2 in production, zero duplicates | **Complete & Verified** |

---

## 3. Business Policies & Knowledge Base Rules

### 3.1 Ticket Categories (Strict Enum)
1. **Royalty & Payments** — Inquiries about sales numbers, royalty calculations, payment delays, threshold rollover, bank account linking.
2. **ISBN & Metadata Issues** — Mismatched ISBNs on platforms, missing metadata, book title corrections, imprint queries.
3. **Printing & Quality** — Misprints, binding defects, damaged author copies, paper quality, print delays.
4. **Distribution & Availability** — Book marked "Currently Unavailable" on Amazon/Flipkart, stock sync delays, international distribution queries.
5. **Book Status & Production Updates** — Progression through Manuscript -> Editing -> Cover Design -> Typesetting -> Proofreading -> Printing -> Live.
6. **General Inquiry** — General questions, post-publish metadata changes, author dashboard navigation, marketing packages.

### 3.2 Priority Rubric
- **Critical**: Systemic failures, major financial discrepancies with severe delays, unaddressed author crises.
- **High**: ISBN mismatch errors (escalate immediately to production; 48h SLA), severe print batch defects affecting delivered copies, royalties overdue past 45-day quarterly window where threshold is met.
- **Medium**: Distribution stock sync issues ("Currently Unavailable"), production phase inquiries with normal delays, royalty breakdown explanation requests.
- **Low**: Routine metadata updates (author bio/description), general timeline inquiries within standard turnaround, general questions.

### 3.3 BookLeaf Operating Policies (Knowledge Base Grounding)
- **Royalty Split**: 80/20 of net profit (80% to author, 20% to BookLeaf). Net profit = MRP minus printing cost, platform commission (Amazon/Flipkart), and shipping.
- **Payment Schedule**: Quarterly calculations, paid within 45 days after quarter ends via linked bank transfer.
- **Threshold**: ₹1,000 minimum. Balances below ₹1,000 automatically roll over to the next quarter.
- **ISBN Rules**: Unique ISBN assigned under BookLeaf imprint. Own imprint requires author to obtain independently. ISBN errors are treated as high priority with a 48-hour resolution timeline.
- **Printing**: Turnaround is 5–7 business days. Partners include Repro India and Epitome Books in addition to the Delhi in-house facility. Free reprints are provided for verified defects upon receipt of photographic evidence.
- **Distribution**: Amazon India, Flipkart, Amazon US, Amazon UK, and BookLeaf Store. New listings take 7–10 business days to go live. Stock sync issues resolved within 24–48 hours.
- **Production Pipeline**: Manuscript Received -> Editing -> Cover Design -> Typesetting -> Proofreading -> ISBN Assignment -> Printing -> Distribution Setup -> Published & Live. Delays typically occur during author approval stages (Cover Design and Proofreading revisions).

---

## 4. Key Implementation Artifacts

- **Backend Source**: [`server/src`](file:///d:/BookLeaf_assignment/server/src)
- **Frontend Source**: [`client/src`](file:///d:/BookLeaf_assignment/client/src)
- **Seed Script**: [`server/scripts/seed.js`](file:///d:/BookLeaf_assignment/server/scripts/seed.js)
- **Integration Test Suite**: [`server/tests/api.test.js`](file:///d:/BookLeaf_assignment/server/tests/api.test.js)
- **Architecture & Approach Document**: [`docs/APPROACH.md`](file:///d:/BookLeaf_assignment/docs/APPROACH.md)
- **API Specification**: [`docs/API_SPECIFICATION.md`](file:///d:/BookLeaf_assignment/docs/API_SPECIFICATION.md)
