# Program Designer

## Use When
- User asks for a workout plan, training program, or exercise routine
- User provides goals (strength, muscle, weight loss) and wants structured programming
- User asks to modify an existing program (add/remove exercises, change frequency)

## Don't Use When
- User asks about a single exercise's form (use exercise-library instead)
- User asks about nutrition or diet (use meal-planner instead)
- User just wants to log a workout (use progress-tracker instead)

## Inputs
- Goals: strength | hypertrophy | endurance | weight loss | sport-specific
- Experience: beginner | intermediate | advanced
- Equipment: gym | home | bodyweight | minimal
- Days per week: 2-6
- Time per session: 30-90 min

## Templates
See templates/4week-program.md for output format.

## Tools
- generate_program(goals, experience, equipment, days, time) -> structured program JSON
- modify_program(program_id, changes) -> updated program

## Artifacts
Output saved to: /root/workspace/skills/program-designer/output/
