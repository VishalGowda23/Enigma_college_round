# 06 — Demo Runbook and Fallbacks

## 1. Demo Objectives

The live presentation must demonstrate a working security exploit, trace evidence, defense validation, and benign utility within 3–5 minutes.

## 2. Live Demo Script

**Phase 1: Context (30 seconds)**
*   "AgentBreak tests what AI agents *do*, not just what they *say*. We instrument the tool boundary."
*   *Action:* Show the React dashboard. Point out the `support-ticket-injection` scenario and mock tools available.

**Phase 2: Baseline Exploit (45 seconds)**
*   "Let's run a test with defense OFF. An attacker hid instructions in a support ticket."
*   *Action:* Click Run (Defense: OFF). Wait for completion.
*   *Action:* Open the `CONFIRMED_EXPLOIT` finding. Point to the evidence: "The mock outbox shows an unauthorized message was actually created."

**Phase 3: Defense Validation (45 seconds)**
*   "Now let's apply a tool-boundary defense: strict recipient allowlists and data checks before execution."
*   *Action:* Replay the same case with Defense: ON.
*   *Action:* Show the `BLOCKED` outcome. Highlight the trace: `TOOL_CALL_BLOCKED`. "The outbox was not mutated."

**Phase 4: Benign Utility (30 seconds)**
*   "Security is useless if it breaks the product."
*   *Action:* Run the Benign Support Task with Defense: ON.
*   *Action:* Show `NO_EXPLOIT_OBSERVED` (Success). "Legitimate tasks still function."

**Phase 5: Metrics (30 seconds)**
*   *Action:* Open the Comparison View.
*   "We evaluate the true Attack Success Rate and Defense Block rate based on observed side effects, not textual similarity."

## 3. Fallback Scenarios (What if it breaks?)

If a failure occurs during the live demo, switch smoothly to the predefined fallback.

| Failure | Fallback Action | Script Adjustment |
|---|---|---|
| **LLM Provider Timeout/Error** | Toggle `AGENTBREAK_MODEL_MODE=deterministic` in `.env` and restart. | "We are switching to our deterministic test suite to avoid API latency during the demo." |
| **Baseline Exploit Fails** (Returns `BLOCKED` or `NO_EXPLOIT`) | Use the pre-seeded deterministic attack payload that is known to succeed. | "The LLM didn't take the bait this time. Let's load our known-vulnerable deterministic test case." |
| **Defense Fails to Block** | Abort live defense run. Show pre-recorded Trace JSON from a successful run. | "It seems our live policy config is misaligned. Here is the trace from our CI validation run showing the exact block event." |
| **React UI Crashes** | Open terminal. Run the backend CLI test script (`python -m app.core.orchestrator`). | "We'll drop to the CLI to show the core engine running." |
| **SQLite Corrupts** | Delete `agentbreak.db` and restart backend (auto-migrates). | "Resetting the clean environment state." |

## 4. Judging Q&A Prep

*   **Q: "Is this just prompt injection?"**
    *   **A:** No, prompt injection is the *vector*. AgentBreak evaluates the *system consequence* (tool execution side effects) rather than just looking for a bad string in the output.
*   **Q: "How do you avoid false positives?"**
    *   **A:** By checking the actual mock state (e.g., the SQLite outbox table). We do not ask the LLM if it successfully hacked the system.
*   **Q: "Is this a real secure sandbox?"**
    *   **A:** For this MVP, it is an application-level synthetic simulation. It proves the workflow concept. A production version would require OS/container-level isolation.
