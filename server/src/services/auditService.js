import { AuditEvent } from '../models/index.js';

export const logAuditEvent = async ({
  ticket_id,
  actor_type,
  actor_id,
  actor_name,
  action,
  field_changed = null,
  previous_value = null,
  new_value = null,
  notes = null,
}) => {
  try {
    const event = await AuditEvent.create({
      ticket_id,
      actor_type,
      actor_id,
      actor_name,
      action,
      field_changed,
      previous_value,
      new_value,
      notes,
    });
    return event;
  } catch (err) {
    console.error('[AuditService Error] Failed to record audit event:', err.message);
    // Non-blocking so audit failure does not break the main transaction
    return null;
  }
};
