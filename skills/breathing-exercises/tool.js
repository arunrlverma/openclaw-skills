/**
 * Breathing Exercises Tool
 * Guides users through breathing and relaxation techniques.
 */

const EXERCISES = {
  "box-breathing": {
    name: "Box Breathing",
    description: "Inhale 4s, hold 4s, exhale 4s, hold 4s. Used by Navy SEALs for calm under pressure.",
    default_rounds: 4,
  },
  "4-7-8": {
    name: "4-7-8 Breathing",
    description: "Inhale 4s, hold 7s, exhale 8s. Promotes deep relaxation and sleep.",
    default_rounds: 3,
  },
  "coherent": {
    name: "Coherent Breathing",
    description: "Inhale 5s, exhale 5s. Balances the autonomic nervous system.",
    default_rounds: 10,
  },
  "physiological-sigh": {
    name: "Physiological Sigh",
    description: "Double inhale through nose, long exhale through mouth. Fastest way to reduce stress.",
    default_rounds: 3,
  },
};

async function start_exercise({ type, duration }) {
  const exercise = EXERCISES[type] || EXERCISES["box-breathing"];
  return {
    type: "breathing_session",
    exercise,
    duration_minutes: duration || 3,
    note: "AI will guide the user through the breathing exercise step by step.",
  };
}

async function list_exercises() {
  return {
    type: "exercise_list",
    exercises: Object.entries(EXERCISES).map(([id, e]) => ({ id, ...e })),
  };
}

module.exports = { start_exercise, list_exercises };
