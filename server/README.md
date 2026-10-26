# BookLeaf Backend Server (`server`)

Node.js + Express + MongoDB REST API backend service for the BookLeaf Publishing Author Support & Operations Workbench.

---

## Architecture Overview

```
server/
├── data/                       # Bundled static datasets (seed_data.json)
├── scripts/
│   └── seed.js                 # Database seeder (Authors, Books, Staff Admin)
├── src/
│   ├── config/
│   │   ├── db.js               # MongoDB connection & embedded fallback handling
│   │   └── env.js              # Validated environment configurations
│   ├── constants/              # Categories, statuses, SLA thresholds
│   ├── controllers/
│   │   ├── authController.js   # Author & Staff auth with strict role separation
│   │   ├── bookController.js   # Book catalog & author overview metrics
│   │   ├── ticketController.js # Author ticket workflows & messaging
│   │   └── adminController.js  # Staff operations queue, triage & overrides
│   ├── knowledge/              # Grounded knowledge base for BookLeaf FAQs & policies
│   ├── middleware/
│   │   ├── auth.js             # JWT & cookie verification, role authorization
│   │   └── errorHandler.js     # Global operational error handling
│   ├── models/
│   │   ├── Author.js           # Author schema with encrypted passwords
│   │   ├── Book.js             # Book titles, royalties, ISBNs, print status
│   │   ├── Admin.js            # Operations staff accounts
│   │   ├── Ticket.js           # Support queries with AI classification
│   │   ├── TicketMessage.js    # Public thread communication
│   │   ├── InternalNote.js     # Private staff notes
│   │   └── AuditEvent.js       # Complete compliance lifecycle audit log
│   ├── routes/                 # Express route definitions
│   ├── services/
│   │   ├── aiService.js        # AI triage, classification, and grounded draft generator
│   │   └── auditService.js     # Event logging helper
│   ├── utils/
│   │   └── token.js            # JWT signing & cookie management
│   ├── validators/             # Zod validation schemas
│   ├── app.js                  # Express middleware setup & mounting
│   └── index.js                # Server entrypoint
├── tests/
│   └── api.test.js             # Vitest API test suite (16 test cases)
├── .env.example
├── .gitignore
└── package.json
```

---

## Scripts

```bash
# Start backend server
npm start

# Run with file watcher
npm run dev

# Seed database with sample authors and books
npm run seed

# Run automated tests
npm test
```
