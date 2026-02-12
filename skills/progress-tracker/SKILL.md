---
name: progress_tracker
description: User wants to log a completed workout
---

# Progress Tracker

## Use When
- User wants to log a completed workout
- User asks about their PRs, progress, or workout history
- User wants to track body measurements or weight over time

## Don't Use When
- User wants a new workout program (use program-designer instead)
- User asks about exercise form (use exercise-library instead)

## Tools
- log_workout(date, exercises) -> saved workout entry
- get_history(period, exercise) -> workout history summary
- log_measurement(type, value, date) -> saved measurement

## Artifacts
Output saved to: /root/workspace/skills/progress-tracker/data/
