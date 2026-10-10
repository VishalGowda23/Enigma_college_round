# 05 — Team and AI Coding Workflow

## 1. Antigravity Collaboration Model

This project is built using Google Antigravity as the primary AI coding assistant. The workflow relies on passing highly structured, pre-written prompt chunks to Antigravity to ensure the AI adheres to the architecture.

### The "Prompt-Driven" Workflow
1.  **Select Task:** Identify the next task from the Timeline (e.g., T02).
2.  **Load Context:** Open the relevant contract files in the IDE (e.g., `02_ARCHITECTURE_AND_CONTRACTS.md`, `T02_SYNTHETIC_AGENT_AND_MOCK_TOOLS.md`).
3.  **Execute Prompt:** Copy the corresponding Antigravity prompt (e.g., `P02_AGENT_TOOLS_AND_ORACLE.md`) and paste it into the chat.
4.  **Review & Commit:** Verify the generated code against the Acceptance Criteria in the task file. Commit working code immediately.

## 2. AI Guardrails

To prevent the AI from generating out-of-scope code or deviating from the PRD:

*   **No unprompted framework additions:** If Antigravity suggests adding Celery, Redis, or LangChain, explicitly reject it unless authorized by the architecture doc.
*   **Strict UI isolation:** Antigravity must not combine Backend routing logic and Frontend React logic in the same prompt pass.
*   **Enforce Error States:** Remind Antigravity that `ERROR` != `BLOCKED`.

## 3. Human Teammate Synchronization

For the 2-person team:

*   **Check-ins:** Every 90 minutes. Mandatory sync on API contract changes.
*   **Branching:** Trunk-based development (`main` branch) is acceptable for a 24-hour hackathon, provided commits are small and atomic. If stepping on toes, use short-lived branches (`teammateA-backend`, `teammateB-ui`).
*   **Blocker Protocol:** If stuck on an AI hallucination or a stubborn bug for >20 minutes, declare a blocker. Switch to the simplest, dumbest working solution (e.g., hardcode a deterministic path) and move on.
