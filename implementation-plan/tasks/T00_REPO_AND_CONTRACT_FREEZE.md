# T00 — Repository and Contract Freeze

## 1. Objective
Establish the repository structure, agree on shared data schemas, and assign team responsibilities. This prevents merge conflicts and API mismatches later.

## 2. Requirements
- Create the Git repository (or local project folder).
- Both teammates review and agree to `02_ARCHITECTURE_AND_CONTRACTS.md`.
- Both teammates agree on the API JSON payloads.
- Decide who owns Backend/Engine (Teammate A) and Frontend/Integration (Teammate B).

## 3. Implementation Steps
1.  Initialize the project root folder.
2.  Create `.gitignore` (Python + Node.js standard).
3.  Create `.env.example` with standard keys.
4.  Commit the implementation plan documents into a `docs/` folder for reference.

## 4. Acceptance Criteria
- [ ] Repo exists and both teammates have access.
- [ ] Enums for `Event_Type` and `Attempt_Outcome` are finalized.
- [ ] Roles are assigned.

## 5. Contingency
If there's disagreement on the tech stack, immediately default to the PRD recommendation (FastAPI/React) and move on. Time is critical.
