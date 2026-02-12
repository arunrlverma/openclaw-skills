/**
 * Program Designer Tool
 * Generates structured workout programs based on user parameters.
 */

const PROGRAM_TEMPLATES = {
  strength: {
    rep_ranges: "3-5",
    rest_minutes: "3-5",
    compound_focus: true,
    progression: "linear",
  },
  hypertrophy: {
    rep_ranges: "8-12",
    rest_minutes: "1-2",
    compound_focus: false,
    progression: "double_progression",
  },
  endurance: {
    rep_ranges: "15-20",
    rest_minutes: "0.5-1",
    compound_focus: false,
    progression: "volume",
  },
};

async function generate_program({ goals, experience, equipment, days, time }) {
  const template = PROGRAM_TEMPLATES[goals] || PROGRAM_TEMPLATES.hypertrophy;

  return {
    type: "workout_program",
    parameters: { goals, experience, equipment, days, time },
    template,
    weeks: 4,
    note: "Program structure generated. AI will fill in specific exercises based on equipment and experience level.",
  };
}

async function modify_program({ program_id, changes }) {
  return {
    type: "program_modification",
    program_id,
    changes,
    note: "Modification request recorded. AI will apply changes to the existing program.",
  };
}

module.exports = { generate_program, modify_program };
