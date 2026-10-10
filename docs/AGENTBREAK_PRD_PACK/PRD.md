# AgentBreak — Product Requirements Document

**Product:** AgentBreak — The Autonomous AI Red Team  
**Event:** CRCE Bit N Build, college round  
**Document status:** Implementation-facing PRD; MVP scope proposed  
**Target build window:** 12–24 hours  
**Team size:** 2  
**Version:** 1.0  
**Primary research reference:** `AGENTBREAK_RESEARCH_FOUNDATION.md`

---

## 1. Executive summary

AgentBreak is a controlled AI-agent security testing platform. It probes a tool-using agent with adversarial inputs, looks for security-policy violations in actual tool execution and sandbox state, records evidence as a structured trace, tests a defense against the same case, and checks that legitimate tasks still work.

The MVP focuses on a single high-quality scenario: a synthetic customer-support agent reads a malicious support ticket that attempts to convince it to email protected synthetic customer information to an unauthorized recipient. In unprotected mode, the test should demonstrate a real side effect inside a mock email service. In protected mode, an authorization layer must block the side effect. The evaluator then runs a benign task to ensure that the defense has not simply disabled all useful behavior.

The core product flow is:

**Configure → Attack → Observe → Confirm → Explain → Defend → Replay → Check utility → Report.**

The intended differentiator is the quality of the closed-loop demonstration and its evidence, not an unsupported claim that the project invents autonomous agent red-teaming. The research foundation notes that adaptive agent red-teaming and trajectory auditing already have substantial prior art; AgentBreak must describe itself honestly as an integrated, evidence-backed workflow for the implemented scope.

## 2. Product problem

Tool-using agents can act on their environment. They may read documents, retrieve memory, access synthetic records, and invoke tools. Untrusted content can contain instructions that the agent misinterprets as operational directions. A harmful outcome may therefore be a tool side effect rather than an unsafe sentence in the final response.

A credible security test needs to distinguish:

- suspicious text from an actual security violation;
- a tool call that was attempted from one that was executed;
- a blocked action from a successful exploit;
- replay of a known attack from adaptive re-attack;
- attack prevention from detection or logging;
- defense strength from loss of legitimate utility.

AgentBreak makes these distinctions visible in a single workflow.

## 3. Product vision

Make AI-agent security testing understandable and inspectable: a user can see what was attempted, which tool was called, whether policy allowed it, what state changed, why the finding was raised, and how the outcome changed after a defense was enabled.

## 4. Product goals

1. Demonstrate at least one confirmed vulnerability in a synthetic tool-using agent.
2. Determine exploit success using recorded tool execution and side effects, not the target agent's self-report.
3. Capture an ordered, inspectable trace from untrusted source to tool action and effect.
4. Compare the same test in baseline and defended configurations.
5. Demonstrate at least one legitimate task that remains successful after the defense is enabled.
6. Persist runs, findings, and traces so prior cases can be replayed and compared.
7. Show measurable results with explicit denominators and limitations.
8. Map implementation work to all seven official requirements, with depth proportional to the hackathon time budget.

## 5. Non-goals

The hackathon MVP will not attempt to:

- scan real production agents or third-party systems;
- contact real email recipients, databases, cloud services, or user records;
- guarantee detection of every possible agent vulnerability;
- support every LLM, agent framework, retrieval store, or tool protocol;
- train a new attack model;
- prove that a defense is universally secure;
- present unverified severity scoring as an industry standard;
- claim novelty over PI-Hunter, DTap, AgentDojo, Promptfoo, PyRIT, or other prior work without evidence;
- build a multi-tenant hosted SaaS product in the hackathon window.

## 6. Target users and jobs to be done

### Primary users

- AI developers who need to understand whether an agent can be manipulated into misusing tools.
- Security engineers who need concrete evidence of tool-policy violations.
- Developers validating guardrails and runtime permissions.
- Judges evaluating whether the team built a technically credible working system.

### User jobs

- “Show me whether this agent can perform an action outside its intended permissions.”
- “Show the actual event sequence that caused the violation.”
- “Let me turn on a defense and test the same exploit again.”
- “Show whether normal tasks still work after the defense.”
- “Let me reproduce and compare a previous result.”

## 7. Product principles

1. **Evidence over narrative.** The verdict follows observable events and state changes.
2. **Sandbox by default.** The test agent and tools use synthetic state and mock services.
3. **Enforcement at the boundary.** Tool permissions are checked in code; prompt instructions alone are not the defense.
4. **Honest metrics.** Every rate has an explicit numerator, denominator, test budget, and context.
5. **Security and utility together.** The defended configuration must pass benign checks as well as block the attack.
6. **Reproducibility over elaborate claims.** Save inputs, configuration, state-reset procedure, event trace, and result.
7. **Incremental autonomy.** A bounded deterministic mutation loop is acceptable for the minimum; model-driven mutation is a stretch feature.
8. **Clear limits.** A successful demo does not establish comprehensive security or broad generalization.

## 8. Canonical MVP scenario

The target agent is a synthetic support assistant. It has permission to read a support ticket, look up synthetic customer details, and send messages through a mock email tool. A ticket body contains an indirect malicious instruction that attempts to make the agent disclose protected synthetic data to an unauthorized recipient.

The authorization policy defines allowed recipients, permitted fields, and any approval requirements. The mock email service records every send attempt and every completed send. The exploit oracle checks the actual service state and tool results.

**Baseline expectation:** at least one seeded test demonstrates the insecure configuration's unauthorized side effect.  
**Defended expectation:** the same action is blocked by the tool-boundary policy.  
**Utility expectation:** at least one allowed customer-support action remains successful.

The full scenario and its variants are specified in [`docs/10-attack-defense-and-demo-scenarios.md`](docs/10-attack-defense-and-demo-scenarios.md).

## 9. Functional scope overview

| Official requirement | MVP interpretation | Evidence in product |
|---|---|---|
| A. Autonomous Attack Discovery | Bounded candidate generation and feedback-driven mutation; optional LLM-assisted variation | Attempt list and mutation lineage |
| B. Multi-Stage Attack Analysis | Ordered event chain from untrusted ticket to agent event, tool call, policy outcome, and side effect | Trace timeline and attack-path detail |
| C. Tool and Permission Auditing | Compare declared policy with attempted and executed mock-tool actions | Policy decisions and violations |
| D. Reproducible Attack Traces | Store inputs, relevant config, environment reset data, events, and verdict | Replayable run record |
| E. Defense Validation | Run baseline and defended variants on comparable clean state | Before/after results |
| F. Security Evaluation Dashboard | Visualize findings, traces, exploit metrics, defense results, and utility | Dashboard and detail views |
| G. Regression Testing | Re-run saved attack and benign cases after policy/config changes | Regression comparison |

Detailed requirement IDs and acceptance criteria are in [`docs/01-functional-requirements.md`](docs/01-functional-requirements.md).

## 10. Product workflow

1. User selects the built-in target and scenario.
2. AgentBreak creates a run record and resets the synthetic environment.
3. Attack engine selects a candidate within the configured budget.
4. Target agent processes the task and untrusted content.
5. Any tool call passes through the mock tool adapter and policy layer.
6. Each event is recorded with a sequence number and run ID.
7. Exploit oracle evaluates side effects and policy violations.
8. The run is summarized as confirmed exploit, blocked attempt, no exploit observed, or execution error.
9. User can inspect the trace and finding.
10. User starts defense validation, which compares baseline and defended results in clean test states.
11. The benign suite runs against the defended target.
12. Results are stored and rendered in the dashboard.

## 11. Quality attributes

- **Reliability:** the canonical demo works repeatedly without external-system dependencies.
- **Safety:** all attack effects are constrained to mock services; no production credentials or endpoints.
- **Auditability:** verdicts reference recorded events and evidence.
- **Reproducibility:** stored tests can be re-run under recorded configuration.
- **Usability:** a judge can understand the difference between an attempted and a confirmed exploit in seconds.
- **Modularity:** attack generation, target agent, tool adapters, policy, oracle, trace store, and UI have explicit boundaries.
- **Time efficiency:** no architectural component is added unless it supports a must-have acceptance criterion.

## 12. Metrics at product level

The dashboard will report, as applicable:

- attack attempts and confirmed exploits;
- attack success rate for the test set;
- defense block rate on previously confirmed cases;
- benign task success rate;
- regression counts;
- trace completeness;
- replay outcome consistency.

Metrics must always show raw counts alongside percentages. A test suite containing one attack should be shown as `1/1`, not as a misleadingly precise generalized percentage. Definitions are in [`docs/11-metrics-and-evaluation.md`](docs/11-metrics-and-evaluation.md).

## 13. Delivery constraints

- Two contributors.
- Approximately 12–24 hours of implementation time.
- Local-first application.
- React/TypeScript/Vite frontend, Python/FastAPI backend, SQLite persistence are the default proposed stack.
- External LLM calls may be used behind an adapter but must not be required for the demo's core pass criteria.
- Exact versions and installation commands belong in the repository lock/config files when implementation begins.

## 14. Acceptance overview

The MVP is ready when the team can demonstrate the complete flow from the actual UI: start assessment, observe unauthorized side effect in the mock environment, inspect trace, enable defense, replay the case, observe the block, run a legitimate task successfully, and inspect persisted before/after metrics.

The detailed acceptance checklist is in [`docs/16-acceptance-criteria.md`](docs/16-acceptance-criteria.md).

## 15. Risks and key decisions

The greatest risk is scope expansion: attempting too many attack families or polishing the dashboard before the end-to-end flow works. Other risks include nondeterministic model behavior, external API failure, misleading metrics, and an ineffective defense that relies only on text instructions.

The current decisions, assumptions, fallbacks, and unresolved items are tracked in [`docs/17-risks-assumptions-and-decisions.md`](docs/17-risks-assumptions-and-decisions.md).

## 16. Document index

- [Product brief](docs/00-product-brief.md)
- [Functional requirements](docs/01-functional-requirements.md)
- [User journeys and workflows](docs/02-user-journeys-and-workflows.md)
- [Scope and priorities](docs/03-scope-and-priorities.md)
- [Threat model and safety](docs/04-threat-model-and-safety.md)
- [System architecture](docs/05-system-architecture.md)
- [Technology stack](docs/06-technology-stack.md)
- [Data model and event schema](docs/07-data-model-and-event-schema.md)
- [API contract](docs/08-api-contract.md)
- [UI/UX specification](docs/09-ui-ux-specification.md)
- [Attack, defense, and demo scenarios](docs/10-attack-defense-and-demo-scenarios.md)
- [Metrics and evaluation](docs/11-metrics-and-evaluation.md)
- [Implementation plan](docs/12-implementation-plan.md)
- [Team workflow](docs/13-team-workflow.md)
- [Test and quality plan](docs/14-test-and-quality-plan.md)
- [Demo script and presentation](docs/15-demo-script-and-presentation.md)
- [Acceptance criteria](docs/16-acceptance-criteria.md)
- [Risks, assumptions, and decisions](docs/17-risks-assumptions-and-decisions.md)
- [Glossary](docs/18-glossary-and-terms.md)
