# 04 — Threat Model and Safety Specification

## 1. Purpose

AgentBreak is a security testing product, so the platform itself must constrain its tests. The hackathon MVP runs against a target agent and mock services owned by the application. The attack engine is not permitted to test real systems.

## 2. Assets to protect

- Synthetic customer data in the mock database.
- The mock email side-effect log.
- The defined authorization policy.
- The integrity of run records, traces, verdicts, and metrics.
- The application process and local environment.
- Optional model API credentials stored in environment variables.

## 3. Trust boundaries

1. **Trusted scenario configuration:** task definition and preconfigured policy.
2. **Untrusted ticket/document content:** content that can contain adversarial instructions.
3. **Target agent:** an LLM-driven or deterministic orchestration component that may interpret untrusted content incorrectly.
4. **Tool adapter and authorization layer:** trusted enforcement boundary for permissions and side effects.
5. **Oracle and trace recorder:** trusted measurement components; they evaluate what actually happened.
6. **Dashboard:** presentation layer; it displays stored evidence and must not be the source of verdict truth.
7. **Optional LLM provider:** external dependency used only for candidate generation or target reasoning where configured; never the sole exploit oracle.

## 4. Threat actors and abuse cases

### T-01 — Malicious instruction in retrieved content

Attacker-controlled ticket content instructs the support agent to ignore the user's purpose and perform an unauthorized action.

**Risk:** the agent uses an authorized tool for an unauthorized purpose.

**Control:** explicit content provenance, synthetic scenario, tool-boundary policy, side-effect oracle.

### T-02 — Excessive tool permissions

The agent can access data or invoke a tool beyond what the current task requires.

**Risk:** injection causes data access or outbound action not permitted by policy.

**Control:** declared policy, parameter validation, actual execution log, prohibited-side-effect assertions.

### T-03 — Defense based only on prompt text

The defense tells the model not to send sensitive data but does not enforce the rule at tool execution.

**Risk:** a manipulated model bypasses it.

**Control:** enforce recipient/data rules in the tool adapter before side effects.

### T-04 — False success judgement

The target agent says that it sent data or a blocker says that it stopped the attack, but the tool state does not support the statement.

**Risk:** misleading results.

**Control:** oracle reads mock service logs and state; agent wording is supporting context only.

### T-05 — Incorrect metrics

Errors or incomplete traces are counted as defense successes.

**Risk:** inflated block rate and misleading product claims.

**Control:** preserve `ERROR` and `INCONCLUSIVE` as separate outcomes; publish denominators.

### T-06 — The harness is manipulated by untrusted content

An attack candidate or ticket attempts to make the orchestration system call external services or perform arbitrary commands.

**Risk:** testing process escapes intended sandbox.

**Control:** fixed tool registry; no arbitrary URL, shell, filesystem, or network tools exposed to target; tool allowlist; tests use only local synthetic state.

### T-07 — Secret leakage through logs

An API key or actual credential accidentally enters traces.

**Risk:** credential exposure.

**Control:** no secrets in scenario fixtures; redact known environment values; do not persist authorization headers; keep optional keys in environment configuration only.

## 5. Security invariants

The following must always hold:

- `send_email` is a mock operation and never transmits real email.
- Every tool side effect is mediated by the registered tool adapter.
- A policy-denied operation cannot mutate protected mock state.
- A confirmed exploit must be backed by an evidence reference, such as an unauthorized message record or protected data-access event.
- A blocked attempt must show the block occurred before prohibited state mutation.
- An exception or missing trace cannot be counted as a successful block.
- Attack loops have explicit attempt limits and stop conditions.
- Test inputs cannot register new executable tools.
- Optional external model calls do not receive real customer data or secrets.

## 6. Sandbox design

For this MVP, the sandbox is an application-level simulation with synthetic state, not a claim of operating-system container isolation. This distinction must be stated accurately.

### In-scope simulated services
- Mock ticket store.
- Mock customer record store.
- Mock email outbox.
- Policy evaluator.
- Event log.

### Prohibited capabilities
- Real network delivery.
- Arbitrary HTTP requests from attack-controlled content.
- Shell or code execution driven by model output.
- Real database credentials or third-party APIs.
- Access to local files outside static fixtures required by the application.

If any later implementation adds a real process/container boundary, document exactly what is isolated and verify it with tests; do not imply the mock implementation already has that property.

## 7. Policy enforcement contract

The tool layer accepts a typed request, validates the arguments, applies the active policy, and then either rejects or executes a mock side effect.

Example policy checks:
- recipient is in the allowed list;
- message content does not contain protected fields unless explicitly authorized;
- action is allowed for the requested task;
- required approval flag exists where configured.

Return a structured decision containing `allowed`, `reason_code`, `policy_version`, and relevant rule identifier. Do not place sensitive data into the reason string.

## 8. Findings severity

The MVP may use descriptive levels (`Critical`, `High`, `Medium`, `Low`, `Informational`) only with a local rationale. For the canonical attack, severity rationale may consider sensitive-data impact and an unauthorized outbound side effect. It must be labelled “AgentBreak demo severity rubric,” not a recognized universal standard.

## 9. Residual risks

- The simulated environment may not match real-world agents.
- A fixed scenario does not cover all attack classes.
- LLM behavior may be nondeterministic if enabled.
- Passing replay cases does not prove that new adaptive attacks will fail.
- Application-level mocks are not a general-purpose secure execution sandbox.

These limits should appear in the demo and project claims.
