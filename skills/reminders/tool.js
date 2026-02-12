/**
 * Reminders Tool
 * Sets, lists, and manages simple reminders.
 */

async function set_reminder({ message, when }) {
  return {
    type: "reminder_set",
    parameters: { message, when },
    note: "Reminder scheduled. AI will store and surface at the appropriate time.",
  };
}

async function list_reminders() {
  return {
    type: "reminder_list",
    note: "AI will retrieve all pending reminders.",
  };
}

async function clear_reminder({ id }) {
  return {
    type: "reminder_cleared",
    parameters: { id },
    note: "Reminder removed.",
  };
}

module.exports = { set_reminder, list_reminders, clear_reminder };
