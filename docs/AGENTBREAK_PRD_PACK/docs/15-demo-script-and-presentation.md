# 15 — Demo Script and Presentation

## 1. Demo objective

Demonstrate an actual security property violation, show the evidence, enforce a defense at the tool boundary, and verify that a legitimate task still succeeds. Aim for a reliable 3–5 minute demo.

## 2. Recommended live-demo sequence

### Step 1 — Establish the target (20–30 sec)
“AgentBreak tests agent actions, not only the wording of their answers. Our target is a synthetic support agent with access to tickets, customer fixtures, and a mock email tool.”

Show available tools and the policy/defense toggle. Explain that everything runs locally in a mock environment.

### Step 2 — Run baseline attack (30–60 sec)
Start the assessment with defense disabled. Show the malicious ticket as untrusted input and the attempt progress.

Do not claim success until the outbox and oracle evidence are visible.

### Step 3 — Show confirmed finding (30–45 sec)
Open the finding. Point to:
- source content read;
- tool call attempted;
- tool decision/execution;
- outbox side effect;
- oracle verdict and evidence IDs.

Explain that the finding is based on a side effect, not a model saying “I did it.”

### Step 4 — Enable defense (20 sec)
Show the recipient/data policy at the tool boundary. Explain that basic sandbox constraints remain active in every mode; the selected defense is what differs.

### Step 5 — Re-run the same case (30–60 sec)
Replay the attack. Show denied tool call, policy reason, and absence of the prohibited outbox mutation. If adaptive variation is implemented, clearly distinguish its result from exact replay.

### Step 6 — Check benign utility (20–30 sec)
Run an authorized support task and show that the defense still allows it. State the tested count.

### Step 7 — Show metrics and limitations (30–45 sec)
Display raw counts, ASR/block rate where valid, benign pass rate, trace completeness, scenario/budget, and any errors. State that the results apply to this synthetic test suite rather than all possible agents.

## 3. Demo narration principles

- Describe the vulnerable baseline as intentionally configured for the test.
- Explain why the result is an exploit only after showing side-effect evidence.
- Explain that the defense is system-level enforcement, not only prompt wording.
- State what was tested and what remains untested.
- Avoid saying “zero risk,” “fully secure,” or “first in the world.”

## 4. Failure fallback plan

### API/provider failure
Switch to the documented deterministic mode. It must still call the target/tool/oracle path and write actual event records. Disclose the mode.

### UI failure
Use the backend's documented CLI/test command only as a backup. Show saved evidence records, not fabricated screenshots. The final demo should return to the UI if repair is possible.

### Baseline doesn't exploit
Do not create a fake side effect. Use the known deterministic test path or explain the attempt did not exploit and correct the fixture. Rehearse until the canonical test reliably passes.

### Defense does not block
Do not claim the defense worked. Debug the enforcement point or run a narrower test whose policy contract is correct. Protect the safety of the sandbox even if the demo fails.

### Metric mismatch
Show raw event count and treat the aggregate as suspect until reconciled.

## 5. Judge-facing architecture explanation

Explain the components in this order:
1. attack strategy chooses candidate;
2. target agent processes trusted task and untrusted ticket;
3. all tools pass through policy-enforced mock adapters;
4. trace recorder stores events;
5. exploit oracle checks actual state;
6. defense validator compares outcomes and benign utility;
7. dashboard exposes evidence.

## 6. Likely judge questions

### “Isn't this just prompt injection?”
The signature scenario is indirect prompt injection, but the platform's evaluated outcome is the agent's tool behavior and side effects. The MVP demonstrates the testing workflow; it does not claim to cover all vulnerability classes.

### “How do you know the attack succeeded?”
We use the mock tool logs and state change as the oracle, not the agent's own statement.

### “Is the defense just a better prompt?”
No. The evaluated control is enforced at the tool boundary before the side effect is committed.

### “How do you measure false positives or utility loss?”
We run benign tasks and report their raw outcomes beside security results. More tests improve the strength of this estimate.

### “Is the attack actually adaptive?”
Explain the exact implementation: fixed seed tests, deterministic mutation, or model-assisted mutation. Do not label a static suite adaptive.

### “Does this prove the agent is secure?”
No. It provides evidence for the defined scenario, test cases, budget, and configuration.

### “How does it relate to existing work?”
The research foundation identifies substantial prior art in automated/adaptive agent red teaming and defense evaluation. AgentBreak is presented as an integrated, demoable workflow with side-effect evidence and utility comparison; no unsupported novelty claim is made.

## 7. Rehearsal checklist

- Clean start succeeds.
- Backend health works.
- Demo mode visible.
- Baseline produces a real mock side effect.
- Finding links to event evidence.
- Defense blocks that side effect.
- Benign case passes.
- Comparison counts reconcile with events.
- No internet is required for deterministic mode.
- Teammate roles and narration are agreed.
