import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { Author, Book, Admin } from '../src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedDatabase = async ({ silent = false } = {}) => {
  const log = (...args) => {
    if (!silent) console.log(...args);
  };

  log('\n=============================================');
  log('   BookLeaf Portal — Database Seeding Script');
  log('=============================================\n');

  await connectDB();

  // Locate seed data JSON
  const possiblePaths = [
    path.resolve(__dirname, '../data/seed_data.json'),
    path.resolve(__dirname, '../data/bookleaf_sample_data.json'),
    path.resolve(__dirname, '../../data/seed_data.json'),
    path.resolve(process.cwd(), 'server/data/seed_data.json'),
    path.resolve(process.cwd(), 'data/seed_data.json'),
  ];

  let dataPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      dataPath = p;
      break;
    }
  }

  if (!dataPath) {
    throw new Error(`Could not find seed_data.json in paths: ${possiblePaths.join(', ')}`);
  }

  log(`[Seed] Loading sample data from: ${dataPath}`);
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const parsedData = JSON.parse(rawData);

  if (!parsedData.authors || !Array.isArray(parsedData.authors)) {
    throw new Error('Invalid sample data format: missing or non-array "authors" property.');
  }

  const defaultAuthorPassword = env.DEFAULT_AUTHOR_PASSWORD;
  const authorPasswordHash = await bcrypt.hash(defaultAuthorPassword, 10);

  // 1. Seed or Update Authors and their Books
  let authorStats = { inserted: 0, updated: 0, skipped: 0 };
  let bookStats = { inserted: 0, updated: 0, skipped: 0 };

  log(`[Seed] Processing ${parsedData.authors.length} authors...`);

  for (const authorData of parsedData.authors) {
    const existingAuthor = await Author.findOne({ author_id: authorData.author_id });

    if (!existingAuthor) {
      await Author.create({
        author_id: authorData.author_id,
        name: authorData.name,
        email: authorData.email.toLowerCase().trim(),
        phone: authorData.phone,
        city: authorData.city,
        joined_date: new Date(authorData.joined_date),
        password_hash: authorPasswordHash,
      });
      authorStats.inserted++;
    } else {
      // Idempotent update of profile details, preserving existing password
      await Author.updateOne(
        { author_id: authorData.author_id },
        {
          name: authorData.name,
          email: authorData.email.toLowerCase().trim(),
          phone: authorData.phone,
          city: authorData.city,
          joined_date: new Date(authorData.joined_date),
        }
      );
      authorStats.updated++;
    }

    // Process books for this author
    if (authorData.books && Array.isArray(authorData.books)) {
      for (const b of authorData.books) {
        const existingBook = await Book.findOne({ book_id: b.book_id });

        const bookPayload = {
          book_id: b.book_id,
          author_id: authorData.author_id,
          title: b.title,
          isbn: b.isbn,
          genre: b.genre,
          publication_date: b.publication_date ? new Date(b.publication_date) : null,
          status: b.status,
          mrp: b.mrp !== undefined ? b.mrp : null,
          author_royalty_per_copy: b.author_royalty_per_copy !== undefined ? b.author_royalty_per_copy : null,
          total_copies_sold: b.total_copies_sold || 0,
          total_royalty_earned: b.total_royalty_earned || 0,
          royalty_paid: b.royalty_paid || 0,
          royalty_pending: b.royalty_pending || 0,
          last_royalty_payout_date: b.last_royalty_payout_date ? new Date(b.last_royalty_payout_date) : null,
          print_partner: b.print_partner || null,
          available_on: Array.isArray(b.available_on) ? b.available_on : [],
        };

        if (!existingBook) {
          await Book.create(bookPayload);
          bookStats.inserted++;
        } else {
          await Book.updateOne({ book_id: b.book_id }, bookPayload);
          bookStats.updated++;
        }
      }
    }
  }

  // 2. Seed Default Admin Account
  let adminStats = { inserted: 0, updated: 0 };
  const adminEmail = env.DEFAULT_ADMIN_EMAIL.toLowerCase().trim();
  const existingAdmin = await Admin.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash(env.DEFAULT_ADMIN_PASSWORD, 10);
    await Admin.create({
      name: 'BookLeaf Operations Lead',
      email: adminEmail,
      password_hash: adminPasswordHash,
      role: 'admin',
      is_active: true,
    });
    adminStats.inserted++;
    log(`[Seed] Created default admin account: ${adminEmail}`);
  } else {
    adminStats.updated++;
    log(`[Seed] Default admin account already exists: ${adminEmail}`);
  }

  // 3. Verification & Counts
  const totalAuthorsInDB = await Author.countDocuments();
  const totalBooksInDB = await Book.countDocuments();
  const totalAdminsInDB = await Admin.countDocuments();

  const productionBooks = await Book.find({ status: { $regex: /In Production/i } });

  log('\n--- Seed Verification Summary ---');
  log(`Authors in DB:   ${totalAuthorsInDB} (Expected: 10)`);
  log(`Books in DB:     ${totalBooksInDB} (Expected: 18)`);
  log(`Admins in DB:    ${totalAdminsInDB} (Expected: >= 1)`);
  log(`Production Books: ${productionBooks.length} (Expected: 2)`);
  productionBooks.forEach(b => {
    log(`  -> [${b.book_id}] "${b.title}" - Status: ${b.status}, PubDate: ${b.publication_date}, MRP: ${b.mrp}`);
  });

  log('\n--- Operations Counts ---');
  log(`Author operations: Inserted=${authorStats.inserted}, Updated=${authorStats.updated}`);
  log(`Book operations:   Inserted=${bookStats.inserted}, Updated=${bookStats.updated}`);
  log(`Admin operations:  Inserted=${adminStats.inserted}, Updated=${adminStats.updated}`);
  log('\nSeeding completed successfully.\n');

  return {
    totalAuthorsInDB,
    totalBooksInDB,
    productionBooksCount: productionBooks.length,
    authorStats,
    bookStats,
  };
};

// Execute if run directly from CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seed Error]', err);
      await disconnectDB();
      process.exit(1);
    });
}
