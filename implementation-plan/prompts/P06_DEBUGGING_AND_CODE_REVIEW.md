# P06 — Debugging and Code Review

**To the human operator:** Paste this prompt ONLY if bugs occur or for final cleanup (T11).

---

<prompt>
We are in the hardening phase (T11). Please perform a code review against the acceptance criteria.

1. Check that NO real network calls are being made by the mock tools.
2. Check that the Oracle relies ONLY on the `mock_outbox` state or `TOOL_CALL_BLOCKED` events, never on text matching against the agent's reasoning.
3. Check that the `.env.example` is accurate and the startup instructions in `README.md` are correct.
4. If there are any pending TypeScript errors or Python linting issues, fix them now.

Do not add new features. Focus only on stability and correctness.
</prompt>
