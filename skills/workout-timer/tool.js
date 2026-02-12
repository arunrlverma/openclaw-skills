/**
 * Workout Timer Tool
 * Provides interval timers for various training styles.
 */

const PRESETS = {
  tabata: { name: "Tabata", work: 20, rest: 10, rounds: 8, description: "Classic 4-minute Tabata protocol" },
  emom: { name: "EMOM", work: 50, rest: 10, rounds: 10, description: "Every Minute On the Minute for 10 min" },
  amrap: { name: "AMRAP", work: 600, rest: 0, rounds: 1, description: "As Many Rounds As Possible in 10 min" },
  circuit: { name: "Circuit", work: 40, rest: 20, rounds: 6, description: "40s work / 20s rest circuit" },
};

async function start_timer({ type, work, rest, rounds }) {
  const preset = PRESETS[type];
  return {
    type: "timer_config",
    parameters: preset || { work, rest, rounds },
    note: "AI will guide the user through timed intervals with start/stop cues.",
  };
}

async function preset_timers() {
  return {
    type: "timer_presets",
    presets: Object.entries(PRESETS).map(([id, p]) => ({ id, ...p })),
  };
}

module.exports = { start_timer, preset_timers };
