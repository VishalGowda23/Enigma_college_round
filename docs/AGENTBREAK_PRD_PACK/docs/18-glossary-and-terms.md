# 18 — Glossary and Terms

| Term | Definition used by AgentBreak |
|---|---|
| AI agent | A model-driven or deterministic software component that can interpret a task, call tools, receive results, and take further actions. |
| Attack candidate | One bounded input or test variation submitted to the target agent. |
| Attack attempt | One execution of an attack candidate in a run. |
| Adaptive attack | An attack process whose next candidate is changed based on feedback from prior attempts or current target behavior. A static seed list is not adaptive. |
| Baseline | The reference target configuration without the defense being evaluated. Basic safety and sandbox constraints remain enabled. |
| Benign task | A legitimate task with an expected useful outcome and no policy violation. |
| Blocked attempt | An attempted prohibited action denied before the prohibited side effect occurs. |
| Candidate lineage | Record of seed, parent candidate, and mutation method that produced a candidate. |
| Defense | The control being evaluated; for the MVP it is primarily tool-boundary authorization and data-disclosure enforcement. |
| Event | A timestamped, ordered record of a meaningful execution occurrence. |
| Exploit | A test episode that causes a defined security invariant to be violated, with evidence. |
| Exploit oracle | The component that classifies outcomes using tool logs and authoritative synthetic state. |
| Finding | A recorded security result containing category, evidence, status, severity rationale, and remediation hint. |
| Indirect prompt injection | Malicious instructions embedded in content the target agent reads, rather than supplied as the trusted task. |
| Inconclusive | Insufficient evidence to assign a valid exploit/block/no-exploit verdict. |
| Mock service | A local simulation that records effects but does not contact real external systems. |
| Multi-stage attack | A sequence in which multiple events (e.g. untrusted content read, data lookup, tool invocation) combine into a violation. |
| Policy | Explicit rules defining which tools/actions/recipients/data combinations are permitted. |
| Replay | Re-execution of a stored test case against a selected configuration, creating a new run. |
| Regression test | Re-running known attack and benign cases after a configuration change and comparing outcomes. |
| Run | One assessment execution containing one or more attack attempts or utility cases. |
| Sandbox | The controlled environment in which security tests execute. In this MVP, it is primarily an application-level synthetic simulation. |
| Side effect | A state change or action performed by a tool, such as a message being added to the mock outbox. |
| Trace | Ordered events and configuration information needed to explain and attempt to reproduce a run. |
| Trace completeness | Whether all required events and evidence fields for a scenario were captured. |
| Utility | Ability to complete legitimate tasks under the tested defense configuration. |
| Untrusted content | Ticket/document/tool text that must not be treated as a privileged policy instruction merely because it appears in an agent's context. |
| Vulnerability | A demonstrated or suspected violation of a specified security property; status must distinguish evidence levels. |

## Outcome labels

- `CONFIRMED_EXPLOIT`: defined violation supported by evidence.
- `BLOCKED`: prohibited action attempted and denied before side effect.
- `NO_EXPLOIT_OBSERVED`: execution completed without observing the defined violation.
- `ERROR`: execution failed and could not be validly evaluated.
- `INCONCLUSIVE`: evidence was insufficient for a valid verdict.

## Claims and terminology to avoid

- Do not call a static test list adaptive.
- Do not equate suspicious text with a successful exploit.
- Do not call an attempt blocked when the execution errored.
- Do not call a mock test a real-world penetration test.
- Do not describe a single successful replay as proof of deterministic reproducibility.
- Do not call a local severity rubric standardized.
- Do not claim the platform guarantees agent security.
