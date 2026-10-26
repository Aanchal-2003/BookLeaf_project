# BookLeaf Author Support Portal — REST API Specification

This document provides complete documentation of all REST API endpoints implemented in the BookLeaf Author Support & Communication Portal backend.

---

## 1. Overview & Conventions

- **Base URL**: `http://localhost:5000/api` (or proxied via `/api` in Vite)
- **Protocol**: HTTP/1.1 or HTTP/2 over TLS
- **Content-Type**: `application/json`
- **Authentication**: JWT stored in an HTTP-only cookie named `token`, or alternatively passed via `Authorization: Bearer <token>` header.
- **Unified Response Schema**:
  ```json
  {
    "success": true,
    "message": "Optional human-readable confirmation message",
    "data": { ... }
  }
  ```
- **Unified Error Schema**:
  ```json
  {
    "success": false,
    "error": {
      "message": "Description of error condition",
      "code": "ERROR_CODE",
      "details": null
    }
  }
  ```

---

## 2. Health & System Endpoints

### 2.1 Service Health
- **`GET /api/health`**
- **Auth**: None
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "status": "healthy",
      "service": "BookLeaf Author Support Portal API",
      "timestamp": "2026-10-26T13:40:00.000Z",
      "uptime": 124.5,
      "environment": "development"
    }
  }
  ```

### 2.2 Database Connectivity
- **`GET /api/health/db`**
- **Auth**: None
- **Response**: `200 OK` (or `503 Service Unavailable` if DB offline)
  ```json
  {
    "success": true,
    "data": {
      "status": "connected",
      "database": "bookleaf",
      "host": "localhost"
    }
  }
  ```

---

## 3. Authentication Endpoints

### 3.1 Author Login
- **`POST /api/auth/author/login`**
- **Auth**: None
- **Body**:
  ```json
  {
    "email": "priya.sharma@email.com",
    "password": "BookLeaf@2025"
  }
  ```
- **Response**: `200 OK` with `Set-Cookie: token=...; HttpOnly; SameSite=Lax`
  ```json
  {
    "success": true,
    "message": "Author login successful",
    "data": {
      "user": {
        "author_id": "AUTH001",
        "name": "Priya Sharma",
        "email": "priya.sharma@email.com",
        "phone": "+91-98765-43210",
        "city": "Mumbai",
        "joined_date": "2023-03-15T00:00:00.000Z",
        "role": "author"
      }
    }
  }
  ```

### 3.2 Admin Staff Login
- **`POST /api/auth/admin/login`**
- **Auth**: None
- **Body**:
  ```json
  {
    "email": "admin@bookleaf.com",
    "password": "Admin@BookLeaf2025"
  }
  ```
- **Response**: `200 OK` with `Set-Cookie: token=...; HttpOnly; SameSite=Lax`
  ```json
  {
    "success": true,
    "message": "Admin login successful",
    "data": {
      "user": {
        "id": "671cc00...",
        "name": "BookLeaf Operations Lead",
        "email": "admin@bookleaf.com",
        "role": "admin"
      }
    }
  }
  ```

### 3.3 Current Authenticated Session
- **`GET /api/auth/me`**
- **Auth**: Required (`author` or `admin`)
- **Response**: `200 OK` returning active profile.

### 3.4 Logout
- **`POST /api/auth/logout`**
- **Auth**: None
- **Response**: `200 OK`, clears auth cookie.

---

## 4. Author Catalog & Dashboard Endpoints

### 4.1 Author Dashboard Summary
- **`GET /api/dashboard/summary`**
- **Auth**: Required (Role: `author`)
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "metrics": {
        "totalBooks": 2,
        "publishedBooks": 2,
        "totalRoyaltyEarned": 19908,
        "totalRoyaltyPaid": 16338,
        "pendingRoyalties": 3570
      },
      "ticketSummary": {
        "total": 3,
        "open": 1,
        "inProgress": 1,
        "resolved": 1,
        "closed": 0
      },
      "recentTickets": [ ... ],
      "books": [ ... ]
    }
  }
  ```

### 4.2 Author Books Catalog
- **`GET /api/books`**
- **Auth**: Required (Role: `author`)
- **Response**: `200 OK` with array of books strictly filtered by the authenticated `author_id`.

### 4.3 Single Book Details
- **`GET /api/books/:id`**
- **Auth**: Required
- **Access Control**: Authors can only access books where `author_id === req.user.author_id` (IDOR protected). Admins can access any book.

---

## 5. Ticket Management Endpoints (Author)

### 5.1 Create Support Ticket
- **`POST /api/tickets`**
- **Auth**: Required (Role: `author`)
- **Body**:
  ```json
  {
    "book_id": "BK001",
    "subject": "Missing sales figures on Amazon",
    "description": "My book Whispers of the Ganges had 50 copies sold during the festival promotion but numbers did not update."
  }
  ```
- **Response**: `201 Created` with generated `ticket_number`, AI classification, predicted priority, and initial message.

### 5.2 List Author Tickets
- **`GET /api/tickets?status=Open&page=1&limit=20`**
- **Auth**: Required (Role: `author`)
- **Query Params**: `status`, `page`, `limit`
- **Response**: `200 OK` with paginated ticket list.

### 5.3 Author Ticket Details & Message Thread
- **`GET /api/tickets/:id`**
- **Auth**: Required (Role: `author`)
- **Security**: Strictly excludes any `InternalNote` records.
- **Response**: `200 OK` with ticket metadata, associated book context, and public conversation messages.

### 5.4 Author Reply
- **`POST /api/tickets/:id/messages`**
- **Auth**: Required (Role: `author`)
- **Body**: `{ "content": "Thank you for the update. Here are the order IDs..." }`
- **Response**: `201 Created`

---

## 6. Operations & Admin Endpoints

### 6.1 Admin Dashboard Metrics
- **`GET /api/admin/metrics`**
- **Auth**: Required (Role: `admin`)
- **Response**: `200 OK` with counts for total, open, in-progress, resolved, closed, critical/high unresolved, and category breakdown.

### 6.2 Admin Support Queue
- **`GET /api/admin/tickets`**
- **Auth**: Required (Role: `admin`)
- **Query Params**:
  - `status`: `Open` | `In Progress` | `Resolved` | `Closed`
  - `category`: Ticket category string
  - `priority`: `Critical` | `High` | `Medium` | `Low`
  - `assigned_admin_id`: ObjectId or `unassigned`
  - `search`: Searches ticket number, subject, and author name
  - `page`: Page number (default: 1)
  - `limit`: Records per page (default: 20)

### 6.3 Admin Ticket Detail (Workbench)
- **`GET /api/admin/tickets/:id`**
- **Auth**: Required (Role: `admin`)
- **Response**: `200 OK` including:
  - `ticket`: Full ticket schema with separate AI predictions and manual values
  - `author`: Complete author profile
  - `book`: Associated book record
  - `messages`: Public conversation thread
  - `internalNotes`: Private staff notes
  - `auditEvents`: Complete chronological audit trail

### 6.4 Update Ticket Status
- **`PATCH /api/admin/tickets/:id/status`**
- **Auth**: Required (Role: `admin`)
- **Body**: `{ "status": "In Progress" }`
- **Audit**: Automatically records status transition in `AuditEvent`.

### 6.5 Category Override
- **`PATCH /api/admin/tickets/:id/category`**
- **Auth**: Required (Role: `admin`)
- **Body**: `{ "category": "Royalty & Payments", "notes": "Reclassified after audit" }`
- **Audit**: Records `category_overridden` with previous and new values.

### 6.6 Priority Override
- **`PATCH /api/admin/tickets/:id/priority`**
- **Auth**: Required (Role: `admin`)
- **Body**: `{ "priority": "Critical", "notes": "Senior executive escalation" }`
- **Audit**: Records `priority_overridden` with previous and new values.

### 6.7 Ticket Assignment
- **`PATCH /api/admin/tickets/:id/assign`**
- **Auth**: Required (Role: `admin`)
- **Body**: `{ "admin_id": "671cc00..." }` (or `null` to unassign)

### 6.8 Add Private Internal Note
- **`POST /api/admin/tickets/:id/notes`**
- **Auth**: Required (Role: `admin`)
- **Body**: `{ "content": "Spoke to warehouse manager; inventory shipment is being expedited." }`
- **Response**: `201 Created`

### 6.9 Send Approved Public Reply to Author
- **`POST /api/admin/tickets/:id/messages`**
- **Auth**: Required (Role: `admin`)
- **Body**: `{ "content": "Dear Priya, we have verified your sales report and updated the distributor feed..." }`
- **Response**: `201 Created`, posts to public thread and updates ticket status.

### 6.10 Request / Regenerate AI Draft
- **`POST /api/admin/tickets/:id/ai-draft`**
- **Auth**: Required (Role: `admin`)
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "draft": "Dear Priya,\n\nThank you for reaching out regarding your royalties...",
      "suggested_next_step": "Verify author bank account status in finance portal.",
      "missing_information": null
    }
  }
  ```
