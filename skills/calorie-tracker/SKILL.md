# Calorie Tracker

## Use When
- User wants to log food or meals they've eaten
- User asks about calories or macros in a food item
- User wants a daily nutrition summary

## Don't Use When
- User wants a meal plan for the week (use meal-planner instead)
- User wants to search for recipes (use recipe-search instead)

## Tools
- log_food(item, quantity, meal) -> logged entry with estimated macros
- daily_summary(date) -> calories and macros summary
- lookup_nutrition(item) -> nutritional information

## Artifacts
Output saved to: /root/workspace/skills/calorie-tracker/data/
