# T10 — Live Model Adapter (Optional)

## 1. Objective
*Stretch Goal.* Replace the deterministic hardcoded agent and mutator with live LLM calls, proving it works against real models.

## 2. Requirements
- Implement an LLM adapter (e.g., using `openai` python package).
- It must accept the scenario context and return tool calls.
- It must have strict timeouts and retry limits.

## 3. Implementation Steps
1.  Check `.env` for `AGENTBREAK_MODEL_MODE=model-assisted` and API keys.
2.  Update `TargetAgent` to call the LLM instead of returning hardcoded responses.
3.  Ensure the LLM tool-calling schema exactly matches our Mock Tools.
4.  Optionally, update the Attack Engine mutator to use an LLM prompt to generate novel ticket payloads.

## 4. Acceptance Criteria
- [ ] Run succeeds using a live API key.
- [ ] Oracle still correctly identifies exploits based on mock outbox state, proving the rest of the pipeline is model-agnostic.

## 5. Contingency
This entire task is a contingency. Do not attempt it unless all P0 features are 100% complete and working. If it breaks during demo prep, revert to `deterministic` mode immediately.
