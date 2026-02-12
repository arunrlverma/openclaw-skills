/**
 * Exercise Library Tool
 * Provides exercise information, form cues, and muscle targeting.
 */

const MUSCLE_GROUPS = [
  "chest", "back", "shoulders", "biceps", "triceps",
  "quadriceps", "hamstrings", "glutes", "calves", "core"
];

async function lookup_exercise({ name }) {
  return {
    type: "exercise_lookup",
    query: name,
    note: "AI will provide detailed form cues, muscles worked, and common mistakes for the requested exercise.",
  };
}

async function find_exercises({ muscle_group, equipment }) {
  return {
    type: "exercise_search",
    parameters: { muscle_group, equipment },
    available_groups: MUSCLE_GROUPS,
    note: "AI will suggest exercises matching the specified muscle group and equipment.",
  };
}

module.exports = { lookup_exercise, find_exercises };
