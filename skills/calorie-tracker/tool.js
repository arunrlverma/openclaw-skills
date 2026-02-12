/**
 * Calorie Tracker Tool
 * Logs food intake and provides nutritional information.
 */

async function log_food({ item, quantity, meal }) {
  return {
    type: "food_log",
    parameters: { item, quantity, meal },
    note: "Food entry recorded. AI will estimate macros and save to daily log.",
  };
}

async function daily_summary({ date }) {
  return {
    type: "daily_summary",
    parameters: { date: date || "today" },
    note: "AI will compile all logged food entries and calculate totals.",
  };
}

async function lookup_nutrition({ item }) {
  return {
    type: "nutrition_lookup",
    query: item,
    note: "AI will provide estimated calories, protein, carbs, and fat per serving.",
  };
}

module.exports = { log_food, daily_summary, lookup_nutrition };
