import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../scripts/seed.js';

let authorCookie = null;
let adminCookie = null;
let testTicketId = null;

beforeAll(async () => {
  await connectDB();
  await seedDatabase({ silent: true });
});

afterAll(async () => {
  await disconnectDB();
});

describe('1. Health & System Diagnostics', () => {
  it('GET /api/health should return 200 with service status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  it('GET /api/health/db should verify active MongoDB connection', async () => {
    const res = await request(app).get('/api/health/db');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('connected');
  });
});

describe('2. Authentication & Authorization Security', () => {
  it('Author login fails with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/author/login')
      .send({ email: 'priya.sharma@email.com', password: 'WrongPassword123' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Author login succeeds with correct credentials and returns HTTP-only cookie', async () => {
    const res = await request(app)
      .post('/api/auth/author/login')
      .send({ email: 'priya.sharma@email.com', password: 'BookLeaf@2025' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe('Priya Sharma');
    expect(res.body.data.user.author_id).toBe('AUTH001');
    expect(res.body.data.user.password_hash).toBeUndefined();

    // Verify Set-Cookie header contains token
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    authorCookie = cookies.find(c => c.startsWith('token='));
    expect(authorCookie).toBeDefined();
    expect(authorCookie).toContain('HttpOnly');
  });

  it('Admin login succeeds with seeded admin credentials', async () => {
    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'admin@bookleaf.com', password: 'Admin@BookLeaf2025' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('admin');
    expect(res.body.data.user.password_hash).toBeUndefined();

    const cookies = res.headers['set-cookie'];
    adminCookie = cookies.find(c => c.startsWith('token='));
    expect(adminCookie).toBeDefined();
  });

  it('GET /api/auth/me returns author profile for authenticated author session', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [authorCookie]);

    expect(res.status).toBe(200);
    expect(res.body.data.user.author_id).toBe('AUTH001');
  });

  it('Author cannot access protected admin endpoints (RBAC test)', async () => {
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Cookie', [authorCookie]);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

describe('3. Author Data Isolation & Catalog', () => {
  it('GET /api/books returns only books belonging to the authenticated author', async () => {
    const res = await request(app)
      .get('/api/books')
      .set('Cookie', [authorCookie]);

    expect(res.status).toBe(200);
    expect(res.body.data.books.length).toBe(2);
    // Priya Sharma owns BK001 and BK002
    const bookIds = res.body.data.books.map(b => b.book_id);
    expect(bookIds).toContain('BK001');
    expect(bookIds).toContain('BK002');
  });

  it('Author cannot access another author’s book directly (IDOR test)', async () => {
    // BK003 belongs to Rohit Kapoor (AUTH002)
    const res = await request(app)
      .get('/api/books/BK003')
      .set('Cookie', [authorCookie]);

    expect(res.status).toBe(403);
  });

  it('GET /api/dashboard/summary calculates accurate author aggregates', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Cookie', [authorCookie]);

    expect(res.status).toBe(200);
    const { metrics } = res.body.data;
    expect(metrics.totalBooks).toBe(2);
    expect(metrics.publishedBooks).toBe(2);
    // BK001 (11970) + BK002 (7938) = 19908
    expect(metrics.totalRoyaltyEarned).toBe(19908);
    // BK001 (8400) + BK002 (7938) = 16338
    expect(metrics.totalRoyaltyPaid).toBe(16338);
    // BK001 (3570) + BK002 (0) = 3570
    expect(metrics.pendingRoyalties).toBe(3570);
  });
});

describe('4. Ticket Lifecycle, AI Processing, and Admin Actions', () => {
  it('Author creates ticket with AI auto-classification and priority scoring', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Cookie', [authorCookie])
      .send({
        book_id: 'BK001',
        subject: 'Amazon showing wrong ISBN on page',
        description: 'My book Whispers of the Ganges is showing a different ISBN on Amazon India than what is printed on the physical copy.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const ticket = res.body.data.ticket;
    expect(ticket.ticket_number).toBeDefined();
    expect(ticket.author_id).toBe('AUTH001');
    expect(ticket.book_id).toBe('BK001');
    // Verify AI predicted category
    expect(ticket.category).toBe('ISBN & Metadata Issues');
    expect(ticket.priority).toBe('High');
    expect(ticket.ai_draft_response).toBeDefined();

    testTicketId = ticket._id;
  });

  it('Author cannot create a ticket referencing another author’s book', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Cookie', [authorCookie])
      .send({
        book_id: 'BK003', // Rohit Kapoor's book
        subject: 'Inquiry',
        description: 'Trying to raise query for another book',
      });

    expect(res.status).toBe(400);
  });

  it('Admin can view ticket in queue with author details populated', async () => {
    const res = await request(app)
      .get('/api/admin/tickets')
      .set('Cookie', [adminCookie]);

    expect(res.status).toBe(200);
    expect(res.body.data.tickets.length).toBeGreaterThan(0);
    const found = res.body.data.tickets.find(t => t._id === testTicketId);
    expect(found).toBeDefined();
    expect(found.author.name).toBe('Priya Sharma');
  });

  it('Admin adds private internal note (verified hidden from author)', async () => {
    // 1. Admin adds note
    const noteRes = await request(app)
      .post(`/api/admin/tickets/${testTicketId}/notes`)
      .set('Cookie', [adminCookie])
      .send({ content: 'Production team confirmed Bowker feed sync in progress.' });

    expect(noteRes.status).toBe(201);

    // 2. Admin retrieves ticket detail and SEES internal notes
    const adminDetail = await request(app)
      .get(`/api/admin/tickets/${testTicketId}`)
      .set('Cookie', [adminCookie]);

    expect(adminDetail.status).toBe(200);
    expect(adminDetail.body.data.internalNotes.length).toBe(1);
    expect(adminDetail.body.data.internalNotes[0].content).toContain('Bowker feed sync');

    // 3. Author retrieves ticket detail and NEVER sees internal notes
    const authorDetail = await request(app)
      .get(`/api/tickets/${testTicketId}`)
      .set('Cookie', [authorCookie]);

    expect(authorDetail.status).toBe(200);
    expect(authorDetail.body.data.internalNotes).toBeUndefined();
  });

  it('Admin overrides category and priority, verified in audit event log', async () => {
    // Override category
    await request(app)
      .patch(`/api/admin/tickets/${testTicketId}/category`)
      .set('Cookie', [adminCookie])
      .send({ category: 'General Inquiry', notes: 'Reclassified for general assistance' });

    // Override priority
    await request(app)
      .patch(`/api/admin/tickets/${testTicketId}/priority`)
      .set('Cookie', [adminCookie])
      .send({ priority: 'Critical', notes: 'Urgent author escalation' });

    // Inspect ticket detail audit events
    const detail = await request(app)
      .get(`/api/admin/tickets/${testTicketId}`)
      .set('Cookie', [adminCookie]);

    expect(detail.body.data.ticket.category).toBe('General Inquiry');
    expect(detail.body.data.ticket.priority).toBe('Critical');
    // AI predictions are preserved separately!
    expect(detail.body.data.ticket.ai_predicted_category).toBe('ISBN & Metadata Issues');

    const actions = detail.body.data.auditEvents.map(e => e.action);
    expect(actions).toContain('category_overridden');
    expect(actions).toContain('priority_overridden');
  });

  it('Admin sends public reply and author can see it in message thread', async () => {
    const replyRes = await request(app)
      .post(`/api/admin/tickets/${testTicketId}/messages`)
      .set('Cookie', [adminCookie])
      .send({ content: 'We have updated the listing feed with Amazon India. It will refresh in 24 hours.' });

    expect(replyRes.status).toBe(201);

    // Author fetches ticket and verifies message is received
    const authorRes = await request(app)
      .get(`/api/tickets/${testTicketId}`)
      .set('Cookie', [authorCookie]);

    expect(authorRes.status).toBe(200);
    const messages = authorRes.body.data.messages;
    expect(messages.length).toBe(2); // Initial description + admin reply
    expect(messages[1].sender_type).toBe('admin');
    expect(messages[1].content).toContain('updated the listing feed');
  });
});
