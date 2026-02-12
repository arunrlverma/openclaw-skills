# Meal Planner

## Use When
- User asks for meal plans, recipes, or dietary guidance
- User wants to track macros or calories
- User asks about food substitutions or dietary restrictions

## Don't Use When
- User asks about workout programming (use program-designer instead)
- User asks about specific medical dietary needs (recommend professional consultation)

## Inputs
- Daily calorie target (optional)
- Dietary restrictions: none | vegetarian | vegan | keto | paleo | gluten-free
- Meals per day: 2-6
- Prep time preference: minimal | moderate | elaborate

## Tools
- generate_meal_plan(calories, restrictions, meals, prep_time) -> weekly meal plan
- suggest_recipe(ingredients, restrictions) -> recipe suggestions

## Artifacts
Output saved to: /root/workspace/skills/meal-planner/output/
