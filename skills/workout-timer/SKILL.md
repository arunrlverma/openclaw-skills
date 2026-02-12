---
name: workout_timer
description: User wants interval timers for HIIT, Tabata, or circuit training
---

# Workout Timer

## Use When
- User wants interval timers for HIIT, Tabata, or circuit training
- User asks for rest period countdowns between sets
- User wants a timed workout session

## Don't Use When
- User wants a full workout program (use program-designer instead)
- User wants to log completed workouts (use progress-tracker instead)

## Tools
- start_timer(type, work, rest, rounds) -> timer configuration
- preset_timers() -> common timer presets (Tabata, EMOM, AMRAP)

## Artifacts
No persistent artifacts.
