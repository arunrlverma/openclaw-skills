/**
 * Daily Affirmations Tool
 * Provides positive affirmations, gratitude exercises, and mindset routines.
 */

const THEMES = [
  "confidence", "resilience", "gratitude", "self-love",
  "growth", "calm", "strength", "purpose"
];

async function get_affirmation({ theme }) {
  return {
    type: "affirmation",
    theme: theme || THEMES[Math.floor(Math.random() * THEMES.length)],
    available_themes: THEMES,
    note: "AI will generate a personalized affirmation based on the theme.",
  };
}

async function gratitude_prompt() {
  return {
    type: "gratitude_exercise",
    note: "AI will guide a 3-item gratitude reflection exercise.",
  };
}

async function morning_routine() {
  return {
    type: "morning_routine",
    steps: ["intention setting", "affirmation", "gratitude", "visualization"],
    note: "AI will guide the user through a 5-minute morning mindset routine.",
  };
}

module.exports = { get_affirmation, gratitude_prompt, morning_routine };
