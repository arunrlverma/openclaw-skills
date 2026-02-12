/**
 * Progress Tracker Tool
 * Logs workouts, tracks PRs, and records body measurements.
 */

async function log_workout({ date, exercises }) {
  return {
    type: "workout_log",
    parameters: { date, exercises },
    note: "Workout entry recorded. AI will format and save to data directory.",
  };
}

async function get_history({ period, exercise }) {
  return {
    type: "history_query",
    parameters: { period, exercise },
    note: "AI will retrieve and summarize workout history for the given period.",
  };
}

async function log_measurement({ type, value, date }) {
  return {
    type: "measurement_log",
    parameters: { type, value, date },
    note: "Measurement recorded. Supported types: weight, body_fat, chest, waist, arms, legs.",
  };
}

module.exports = { log_workout, get_history, log_measurement };
