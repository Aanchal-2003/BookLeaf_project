import mongoose from 'mongoose';
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES, AI_STATUSES } from '../constants/enums.js';

const ticketSchema = new mongoose.Schema(
  {
    ticket_number: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    author_id: {
      type: String,
      required: true,
      ref: 'Author',
      index: true,
    },
    book_id: {
      type: String,
      ref: 'Book',
      default: null, // Null for General / Account Level queries
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: TICKET_CATEGORIES,
      index: true,
    },
    ai_predicted_category: {
      type: String,
      enum: TICKET_CATEGORIES,
      default: null,
    },
    priority: {
      type: String,
      required: true,
      enum: TICKET_PRIORITIES,
      default: 'Medium',
      index: true,
    },
    ai_predicted_priority: {
      type: String,
      enum: TICKET_PRIORITIES,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: TICKET_STATUSES,
      default: 'Open',
      index: true,
    },
    assigned_admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
      index: true,
    },
    ai_processing_status: {
      type: String,
      enum: AI_STATUSES,
      default: 'pending',
      index: true,
    },
    ai_confidence: {
      type: Number,
      default: null,
    },
    ai_reasoning: {
      type: String,
      default: null,
    },
    ai_draft_response: {
      type: String,
      default: null,
    },
    attachment_metadata: {
      filename: { type: String, default: null },
      size: { type: Number, default: null },
      mimetype: { type: String, default: null },
      url: { type: String, default: null },
    },
    error_metadata: {
      type: Object,
      default: null,
    },
    resolved_at: {
      type: Date,
      default: null,
    },
    closed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries in admin queue
ticketSchema.index({ status: 1, priority: 1, createdAt: -1 });
ticketSchema.index({ author_id: 1, createdAt: -1 });

export const Ticket = mongoose.model('Ticket', ticketSchema);
