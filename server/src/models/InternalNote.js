import mongoose from 'mongoose';

const internalNoteSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      index: true,
    },
    admin_name: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

internalNoteSchema.index({ ticket_id: 1, createdAt: 1 });

export const InternalNote = mongoose.model('InternalNote', internalNoteSchema);
