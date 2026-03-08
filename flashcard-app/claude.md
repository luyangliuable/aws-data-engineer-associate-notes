# Architecture Principles

This document outlines the architectural principles applied to the AWS DEA Flashcard application.

## CUPID

### Composable

- Small functions that do one thing (each < 20 lines)
- Components accept props and emit events via callbacks
- No hidden dependencies - all dependencies are explicit imports
- Pure functions are easily composable

### Unix Philosophy

- Each module has one job:
  - `srsAlgorithm.ts`: Only SM-2 calculations
  - `database.ts`: Only file I/O operations
  - `reviewActions.ts`: Only server-side orchestration
  - `Card.tsx`: Only card display with flip animation
  - `StudySession.tsx`: Only study flow management

### Predictable

- Pure functions return same output for same input
- No global state mutations
- Server actions handle all side effects
- Data flow is explicit and unidirectional

### Idiomatic

- Next.js App Router patterns
- React Server Components where possible
- TypeScript strict mode conventions
- Standard file naming conventions

### Domain-Based

- File names match domain concepts (Card, Review, SRS)
- Types named after real-world entities
- Directory structure reflects domain boundaries

## SOLID

### Single Responsibility

- `Card.tsx`: Displays card content only
- `srsAlgorithm.ts`: Calculates intervals only
- `database.ts`: File operations only
- `submitReview()`: Handles one review submission

### Open/Closed

- New rating types can be added by extending Rating type
- New card sources can be added without changing components
- Algorithm parameters are configurable

### Liskov Substitution

- Review interface works for both new and existing reviews
- CardWithReview extends Card without breaking existing code

### Interface Segregation

- Small, focused types (Card, Review, Stats)
- No god objects - each type has specific purpose
- Components receive only data they need

### Dependency Inversion

- Components depend on types, not implementations
- Server actions are called via function references
- Database layer abstracts file system details

## DRY

- Shared types in `types.ts`
- Date formatting utilities reused
- File path constants in database.ts
- Single source of truth for JSON structure

## Clean Code

- Functions < 20 lines
- No comments needed - names explain intent
- Early returns avoid deep nesting
- Descriptive variable names (isFlipped, not f)
- Boolean props prefixed with verbs (isSubmitting, not submitting)
