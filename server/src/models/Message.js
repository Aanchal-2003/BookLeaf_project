import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    sender_type: {
      type: String,
      enum: ['author', 'admin', 'system'],
      required: true,
    },
    sender_id: {
      type: String, // author_id or admin _id
      required: true,
    },
    sender_name: {
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

messageSchema.index({ ticket_id: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
