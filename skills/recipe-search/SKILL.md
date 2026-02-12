# Recipe Search

## Use When
- User asks for recipe ideas or specific recipes
- User wants to find recipes based on ingredients they have
- User asks for healthy or diet-specific recipe suggestions

## Don't Use When
- User wants a full weekly meal plan (use meal-planner instead)
- User wants to log food they've eaten (use calorie-tracker instead)

## Environment Variables
- BRAVE_API_KEY: Required. Used to search the web for recipes.

## Tools
- search_recipes(query, dietary, max_time) -> recipe search results
- recipe_detail(url) -> parsed recipe with ingredients and steps

## Artifacts
No persistent artifacts.
