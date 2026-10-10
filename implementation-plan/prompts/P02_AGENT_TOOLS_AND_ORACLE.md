# P02 — Agent, Tools, and Oracle

**To the human operator:** Paste this prompt to implement the policy defense.

---

<prompt>
We are now implementing the tool-boundary defense (T03 continued) and T04 (Mutation).

1. In `app/tools/policy.py`, create a `PolicyEngine`. It should have a flag `defense_enabled`. If enabled, it intercepts calls to `send_email`. If the recipient is not in a hardcoded allowlist, it denies the action (does not mutate `mock_outbox`) and emits a blocked status.
2. Update `app/tools/mock_tools.py` to route through `PolicyEngine`.
3. Update `app/oracle/exploit_oracle.py` so that if the outbox is empty but a block occurred, it returns `BLOCKED`.
4. Update `test_core.py` to run two scenarios:
   - Run 1: Defense OFF -> Expect `CONFIRMED_EXPLOIT`.
   - Run 2: Defense ON -> Expect `BLOCKED`.

Run the script and confirm the terminal output matches these expectations.
</prompt>
