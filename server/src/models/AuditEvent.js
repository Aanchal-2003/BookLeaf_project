import mongoose from 'mongoose';

const auditEventSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    actor_type: {
      type: String,
      enum: ['admin', 'author', 'system', 'ai'],
      required: true,
    },
    actor_id: {
      type: String,
      required: true,
    },
    actor_name: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    field_changed: {
      type: String,
      default: null,
    },
    previous_value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    new_value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

auditEventSchema.index({ ticket_id: 1, createdAt: -1 });

export const AuditEvent = mongoose.model('AuditEvent', auditEventSchema);
