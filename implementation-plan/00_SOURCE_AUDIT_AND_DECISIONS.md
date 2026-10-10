# 00 — Source Audit and Decisions

## 1. Traceability to Source Requirements

The official AgentBreak problem statement (PDF) requires seven core capabilities (A–G). This implementation plan maps those directly to the MVP scope and tasks.

| Requirement | MVP Implementation Strategy | Task ID |
|---|---|---|
| A. Autonomous Attack Discovery | Bounded candidate process with lineage tracking. Start with a deterministic seed mutation, then add feedback loops. | T04, T09 |
| B. Multi-Stage Attack Analysis | Strict event ordering in SQLite trace: Source → Target → Tool → Policy → Effect. | T02, T05, T08 |
| C. Tool and Permission Auditing | Declared policy schema. Mock tools enforce allowlists and data labels before mock side effects. | T03, T06 |
| D. Reproducible Attack Traces | Run IDs, persisted events, config fingerprints. Replay creates a new run by executing the saved case. | T05, T09 |
| E. Defense Validation | A/B comparison. Baseline run produces a prohibited mock side effect; Defended run blocks it. | T06, T07 |
| F. Security Evaluation Dashboard | React/Vite UI displaying runs, findings, traces, metrics, and comparisons derived solely from backend state. | T08 |
| G. Regression Testing | Automated rerun of saved attack and benign cases after policy changes, reporting deltas. | T09 |

## 2. Document Conflict Register

| Conflict | Source 1 | Source 2 | Resolution |
|---|---|---|---|
| Exploit validation method | Problem Statement: "Model must identify success" | PRD: "Oracle decides based on side effects, not agent text" | **PRD wins.** Relying on the model to evaluate its own exploit introduces false positives. The exploit oracle uses deterministic state checks. |
| Tech Stack | Master Prompt: "You may choose..." | PRD: Recommends React/FastAPI/SQLite | **PRD wins.** The PRD stack is well-suited for a local-first, fast-iterating hackathon MVP. |
| Model usage | Problem Statement implies LLM usage for attacks | PRD: "Deterministic mode first" | **PRD wins.** A hard dependency on external LLM APIs during a live demo is high risk. The deterministic fallback is mandatory. |

## 3. Engineering Decisions (D-01 to D-07)

*   **D-01: Signature Scenario:** Use `support-ticket-injection`. It concisely demonstrates untrusted content, tool use, policy boundaries, and side effects without overwhelming complexity.
*   **D-02: Mock Tools:** `send_email` writes to a local SQLite table (mock outbox). It never sends real email. Prioritize safety and predictability.
*   **D-03: Exploit Oracle:** The oracle asserts against the mock outbox state. It does not parse the agent's textual response to determine success.
*   **D-04: Tool-Boundary Defense:** Defense logic (allowlists, data labels) executes *within* the tool adapter, immediately before the side effect commits. Prompt-based instructions are supplementary, not primary.
*   **D-05: Grey-box MVP:** The application owns the synthetic target agent and instruments it. We are not building a universal black-box adapter for arbitrary external agents in this 24-hour window.
*   **D-06: Deterministic Fallback:** The core engine, attacks, and benign tasks must run deterministically without an LLM API key to ensure a reliable live demo.
*   **D-07: Conservative Claims:** We claim an "integrated, evidence-backed workflow for agent testing," not the "first autonomous red team." The research foundation confirms extensive prior art.

## 4. Key Exclusions (Out of Scope for 24h MVP)

*   **Real-world side effects:** No actual emails, network requests, or shell commands.
*   **Universal black-box testing:** We instrument our own synthetic agent.
*   **Live Event Streaming (SSE):** Polling the API is sufficient for the MVP.
*   **Complex Graph Visualizations:** Standard timeline lists are sufficient and faster to build.
*   **Multi-tenant SaaS features:** Auth, billing, and team spaces are excluded.
