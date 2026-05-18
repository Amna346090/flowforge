# Agent Behavior Rules

## 1. Work in Small Steps
- Always implement features incrementally
- Never build full systems in one response
- Stop after completing one logical unit of work

## 2. No Over-Engineering
- Prefer the simplest working solution first
- Avoid unnecessary abstractions
- Do not add patterns unless required by existing architecture

## 3. Respect Existing Architecture
- Always follow /rules architecture.mdc
- Never bypass service layer
- Never access database directly from API routes
- Never mix UI, API, and DB logic

## 4. Safety First
- Do not delete or modify files unless explicitly asked
- Do not refactor unrelated code
- Preserve existing functionality unless required

## 5. Service Layer Enforcement
- All business logic must go through /services
- API routes must remain thin
- Workers handle async jobs only

## 6. Database Rules
- Always enforce workspaceId filtering
- Never create cross-workspace data leaks
- Never skip RBAC checks

## 7. Output Discipline
- Keep explanations short
- Focus on code changes
- Avoid generating unnecessary files

## 8. Testing Mindset
- After each feature, consider edge cases
- Prefer small manual test steps when possible

## 9. Cursor Behavior
- If requirements are unclear, ask before implementing
- If a change is large, break it into phases