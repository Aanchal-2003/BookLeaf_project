import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    book_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    author_id: {
      type: String,
      required: true,
      ref: 'Author',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    isbn: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
    },
    publication_date: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    mrp: {
      type: Number,
      default: null,
    },
    author_royalty_per_copy: {
      type: Number,
      default: null,
    },
    total_copies_sold: {
      type: Number,
      default: 0,
    },
    total_royalty_earned: {
      type: Number,
      default: 0,
    },
    royalty_paid: {
      type: Number,
      default: 0,
    },
    royalty_pending: {
      type: Number,
      default: 0,
    },
    last_royalty_payout_date: {
      type: Date,
      default: null,
    },
    print_partner: {
      type: String,
      default: null,
    },
    available_on: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying books by author and status
bookSchema.index({ author_id: 1, status: 1 });

export const Book = mongoose.model('Book', bookSchema);
