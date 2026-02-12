/**
 * Mood Journal Tool
 * Tracks mood entries and identifies patterns over time.
 */

const MOODS = ["happy", "calm", "anxious", "sad", "angry", "stressed", "grateful", "neutral"];

async function log_mood({ mood, intensity, notes, triggers }) {
  return {
    type: "mood_entry",
    parameters: { mood, intensity, notes, triggers },
    available_moods: MOODS,
    note: "Mood entry recorded. AI will save and look for patterns.",
  };
}

async function mood_summary({ period }) {
  return {
    type: "mood_summary",
    parameters: { period: period || "week" },
    note: "AI will analyze mood entries and identify trends.",
  };
}

async function prompt_reflection() {
  return {
    type: "reflection_prompt",
    note: "AI will generate a thoughtful journaling prompt based on recent entries.",
  };
}

module.exports = { log_mood, mood_summary, prompt_reflection };
