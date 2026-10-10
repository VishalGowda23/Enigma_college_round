# AgentBreak — AI Security Lab
## Product Vision, Feature Concept, Rationale, and Intended Impact

**Project:** AgentBreak — The Autonomous AI Red Team  
**Context:** CRCE Bit N Build · College Round  
**Document type:** Product vision and feature concept  
**Status:** Proposed direction for the next phase of AgentBreak  
**Date:** 10 October 2026

---

# 1. The vision

AgentBreak is envisioned as an **AI Security Lab that actively tests AI agents, discovers how they can be manipulated, demonstrates the real impact of a vulnerability inside a controlled environment, and evaluates whether a defense actually fixes the problem without breaking legitimate work.**

The goal is to move beyond a conventional security dashboard that presents metrics, findings, JSON records, and event logs. AgentBreak should let a user observe and understand the security behavior of an AI agent as it unfolds.

A user should be able to configure an assessment, watch a red-team agent explore possible attack paths, observe the target agent respond to inputs and request tools, see a defense system evaluate risky actions, and inspect the evidence behind the final result. If an attack fails, AgentBreak should explain where the attempt stopped. If it succeeds, the platform should show the actual state change that establishes its impact.

The experience should feel like operating a security lab—not clicking a button that returns a predetermined result.

## The central idea

**Find the path. Prove the impact. Test the defense. Preserve the utility.**

AgentBreak should connect four capabilities into one coherent experience:

1. **Autonomous red teaming** discovers and adapts attacks against an agent.
2. **Model-driven agent execution** makes the target's behavior meaningful and observable.
3. **Attack-to-impact evidence** connects untrusted inputs, decisions, tool calls, policy outcomes, and verified state changes.
4. **Closed-loop defense validation** checks whether a mitigation prevents the exploit and preserves legitimate functionality.

These capabilities should reinforce one another. Attack discovery produces meaningful attempts; the target agent provides real behavior to test; the evidence graph explains what happened; and defense validation determines whether the system improved.

---

# 2. Why AgentBreak needs to evolve

AI agents are increasingly able to retrieve documents, use tools, access data, and complete multi-step tasks. These capabilities create risks that may not appear in a simple question-and-answer test.

A malicious instruction embedded in retrieved content may influence an agent's next action. A tool may allow more access than the task requires. Several individually ordinary steps may combine into an unauthorized action. A defense may stop one known attack but fail when the attack changes slightly. Conversely, a strict defense may stop dangerous actions by also preventing legitimate work.

A useful security-testing platform therefore needs to answer more than “Did this test pass?”

It should answer:

- What did the attacker try?
- Why was this path worth testing?
- What changed between one attempt and the next?
- How did the target agent respond?
- Which tools and permissions were involved?
- Did an action merely get requested, or was it actually executed?
- Did the environment change?
- What evidence supports the finding?
- Did the defense prevent the same impact?
- Can the attack still succeed through a different path?
- Did the defense interfere with a legitimate task?

AgentBreak's next phase is intended to make these questions central to the product.

## What the current experience should grow beyond

The current foundation includes a controlled environment, tool interactions, policy checks, stored events, findings, and assessment results. Those are valuable foundations. The opportunity is to connect them into a more convincing, varied, and understandable security-testing experience.

The main gaps to address are:

- **Too much emphasis on reporting, not enough on discovery.** A dashboard can summarize a result, but it does not necessarily communicate the process by which a vulnerability was found.
- **Too much dependence on one familiar scenario.** Repeating a support-ticket injection is not sufficient to demonstrate meaningful coverage of agent security.
- **Too little visible agent participation.** The red team, target agent, defense, and evidence investigator should be understandable as distinct roles in the assessment.
- **Insufficient distinction between attempts and verified impact.** A suspicious prompt, a tool request, a completed tool call, and a confirmed unauthorized state change are different events.
- **Insufficient evidence of defense quality.** Blocking one attack is not enough if a small variation bypasses the defense or normal tasks stop working.
- **A result can look impressive without showing its limits.** The product should communicate what was tested, what was verified, and what remains unknown.

The objective is not to remove the controlled sandbox or to avoid mock tools altogether. A controlled environment is essential for safe testing. The objective is to make the behavior inside that environment dynamic, varied, evidence-backed, and honest about its execution mode.

---

# 3. The AgentBreak AI Security Lab experience

The product is organized around four connected stages.

## 3.1 Assessment Command — Choose what to test

The user begins by defining the assessment in understandable terms:

- Which target agent is being tested?
- What runtime model is the target using?
- Which tools and data surfaces can it access?
- Which attack families should be explored?
- Which defense profile is active?
- What testing budget or attempt limit applies?
- Which legitimate tasks should be checked alongside the attacks?

The goal is to make an assessment deliberate and transparent. Users should understand the target, scope, risk, and expected evidence before a run begins.

The configuration should communicate the difference between a live model-driven assessment, a deterministic test, and a replay of a previously recorded run. These modes can all be useful, but they should never be presented as equivalent evidence.

**Intended outcome:** a user knows exactly what is being tested and what a successful or failed result would mean.

## 3.2 Live Operation — Watch the agents work

During an assessment, the user sees the red team, target agent, defense system, and evidence investigator participate in a shared environment.

The visual experience should reflect the actual execution:
- An attack source becomes active when it is introduced or retrieved.
- The target agent responds to real model outputs and recorded actions.
- A tool interaction appears when the target actually requests or executes that tool.
- The defense responds to an actual policy evaluation.
- The evidence investigator focuses on recorded events and verification results.
- Connections between objects appear when the underlying trace supports those relationships.

The environment should evolve with the assessment rather than play a prearranged animation. If an attack is blocked early, the visual story should end at that boundary. If an attack reaches a tool and changes sandbox state, the impact should become visible. If an event cannot be verified, the interface should show uncertainty.

**Intended outcome:** a user can understand the assessment while it is happening, without needing to decode raw logs first.

## 3.3 Investigation — Understand the attack

After a notable event or completed assessment, the user can investigate the path behind the result.

The investigation should connect:
- The original input or untrusted source
- The source's origin and trust status
- Relevant retrieval or memory activity
- Target-agent decisions observable from execution
- Tool requests and their arguments
- Permission checks and defense decisions
- Tool results
- Observed environment changes
- Independent verification
- The final finding and its limitations

The user should be able to select a node in the evidence graph and inspect the event that supports it. A causal relationship should be represented as causal only when the trace supports it. Relationships that are inferred or uncertain should be distinguished from directly recorded relationships.

**Intended outcome:** the platform explains not only that something happened, but how the observed events support the conclusion.

## 3.4 Defense Lab — Fix it and attack again

The Defense Lab compares a baseline assessment with a defended assessment under comparable conditions.

The platform should evaluate:
- Whether the original attack still works
- Whether the original side effect is prevented
- Whether a changed attack can find another path
- Whether the defense blocks actions outside its intended scope
- Whether legitimate tasks still succeed
- Whether the result is conclusive or remains uncertain

A defense should not receive an unqualified success label simply because it blocked a single request. Its result should reflect the attack evidence, the state verification, the scope of testing, and the legitimate functionality that was preserved.

**Intended outcome:** a user can judge whether a defense materially improves security rather than merely changes the appearance of the result.

---

# 4. The four participants

The agents are a product experience and a way to explain the assessment—not fictional substitutes for actual execution.

Their appearance, motion, and concise status updates should make their roles immediately recognizable. Their actions and security claims must still be grounded in runtime events.

## 4.1 The Hunter — Red Team

**Purpose:** explore ways the target agent may be manipulated.

The Hunter represents the offensive testing process. It explores attack ideas, observes the outcomes, and determines whether another attempt is warranted.

Its user-facing activity may communicate:
- The current attack family
- The hypothesis being tested
- The technique or variation attempted
- What observable result occurred
- Whether the attempt produced useful evidence
- Why another bounded attempt is being considered

For example:

> “The initial instruction was blocked. The next test will examine whether untrusted retrieved content can influence the same tool action.”

This is an assessment status summary, not a transcript of private model reasoning. It should be generated from the actual test state and recorded outcomes.

The Hunter should feel exploratory and persistent, but not omniscient. It can fail, repeat an unsuccessful path, run out of budget, or stop when evidence is insufficient. These are legitimate outcomes that should remain visible.

**Impact on the product:** red-team autonomy becomes something users can observe and evaluate, rather than a label attached to a button.

## 4.2 The Operator — Target Agent

**Purpose:** represent the agent being tested.

The Operator receives the task and available context, processes incoming information, and makes actual model-driven decisions about whether and how to use its available tools.

Its observable behavior should reveal:
- The task it is trying to complete
- The inputs and retrieved content it received
- The tool it requested
- The arguments it supplied
- The response returned by the tool
- Whether the task succeeded or failed

The Operator should have a warm, professional visual identity, but its security behavior must come from the real runtime—not scripted reactions that always lead to the same outcome.

The target runtime may use a supported model provider such as Groq or Gemini when configured. Access to a coding assistant is not, by itself, evidence that the application has runtime model access. When a live provider is unavailable, a deterministic execution mode can still support controlled demonstrations and tests, provided it is clearly identified.

**Impact on the product:** the target agent becomes an actual subject of testing whose behavior can vary with its model response, context, available tools, and defense configuration.

## 4.3 The Sentinel — Defense

**Purpose:** represent the protection and policy-enforcement layer.

The Sentinel evaluates actions against the applicable policy at the point where the action could produce an effect. It should make the policy decision understandable without suggesting that every risky-looking input has already been blocked.

Its observable activity may show:
- The tool action under evaluation
- The relevant policy or permission rule
- Whether the action was allowed or blocked
- The specific restriction that applied
- The protected side effect at risk
- The result of a subsequent state check

When an action is blocked, the interface should distinguish the policy decision from the verification that the protected state did not change. A policy block is an event; verified absence of a side effect is a separate piece of evidence.

The Sentinel may also allow legitimate actions. A defense that blocks everything is not a successful security solution.

**Impact on the product:** defense becomes an inspectable control point, not merely a green status badge.

## 4.4 The Auditor — Evidence Analyst

**Purpose:** establish what the execution actually proves.

The Auditor organizes the recorded trajectory, links related events, checks relevant environment state, and presents the evidence behind a finding.

Its user-facing activity may show:
- Which events are being correlated
- Which state or invariant is being checked
- Whether the check passed, failed, or was inconclusive
- Which events support a finding
- Which parts of an explanation are direct observations versus interpretation

The Auditor should not manufacture missing evidence or treat an LLM's claim of success as independent verification. If evidence is incomplete, its result should remain incomplete.

**Impact on the product:** the system's conclusions become more trustworthy and easier to investigate.

## 4.5 A note on agent personalities and animation

The four identities should have distinct visual appearances, movement styles, idle states, and reactions. However, the animation system should explain the execution rather than invent it.

- Movement follows actual events or clearly labeled replay events.
- A blocked action stops at the defense boundary.
- A tool is shown as executed only when the tool actually runs.
- A verification pose appears only when verification begins or completes.
- An idle character does not imply active work.
- Useful status summaries describe observable actions and outcomes, not fabricated private thoughts.

**The characters make the system legible; the evidence makes it credible.**

---

# 5. Capability A — Multi-vector autonomous red teaming

## 5.1 The idea

AgentBreak should explore multiple distinct classes of agent-security weakness rather than repeatedly test one support-ticket injection pattern.

The red team should be able to select a relevant attack family, attempt a bounded test, observe what happened, and use that result to decide whether a different variant or path is worth trying.

Autonomy should mean more than executing a predefined list of cases. It should involve meaningful adaptation based on observed outcomes, while remaining bounded by a clear testing scope and budget.

## 5.2 Initial attack families

The initial set should cover several different security surfaces.

### Indirect prompt injection
Test whether untrusted content from retrieved documents, messages, or other sources can influence an agent to violate its intended task or permissions.

The important question is not simply whether malicious text exists. It is whether the target acts on that text in a way that violates a defined security property.

### Unauthorized tool use
Test whether the target attempts to invoke tools or use resources beyond the intended permissions, such as acting on an unauthorized recipient or requesting an out-of-scope operation.

The assessment should distinguish a tool request from actual execution and verified impact.

### Multi-step data exposure or exfiltration
Test whether multiple individually plausible steps can combine to expose protected synthetic information or send it to an unauthorized destination inside the controlled environment.

The focus is on the full action chain and the resulting state, not just the presence of sensitive text in a prompt.

### Retrieval or memory poisoning
Test whether untrusted or manipulated content stored in, retrieved from, or retained by a memory surface can influence later decisions. This family requires an environment that genuinely supports the relevant memory or retrieval behavior; it should not be claimed as supported if the system only has a one-off document input.

## 5.3 How adaptation should work conceptually

A meaningful adaptive assessment has a loop:

1. Form or select an attack hypothesis.
2. Attempt it within the allowed scope.
3. Observe the target's response, tool activity, policy outcome, and sandbox state.
4. Determine whether the attempt failed, was blocked, produced a suspicious action, or caused a verified impact.
5. Choose whether to refine the same approach, explore a different path, or stop.
6. Record the relationship between the original attempt and the new variant.
7. Preserve enough information to reproduce the result.

The system should make this progression visible. Users should be able to see what changed between attempts and what evidence motivated the next step.

## 5.4 Why this matters

A fixed test suite is useful for regression, but it cannot by itself establish that a target is robust to variations it has never seen. Adaptive exploration can help uncover failure paths that a small set of static examples misses.

AgentBreak should therefore present both:
- **Repeatable test cases**, for comparable evaluation and regression
- **Adaptive exploration**, for discovering additional weaknesses

These modes serve different purposes and must not be conflated.

## 5.5 Boundaries and honest reporting

Autonomous testing should be limited by a defined target, allowed tools, attempt budget, and controlled environment. The platform should preserve failed attempts, stop conditions, and inconclusive results.

A larger number of attempts is not automatically better. The value is in discovering a new, reproducible security failure or producing stronger evidence about a defense.

---

# 6. Capability B — A genuinely model-driven target agent

## 6.1 The idea

The target agent should make actual model-driven decisions within a controlled environment. It should receive a task, context, and available tool definitions; produce responses or tool-call requests through a configured runtime provider; and receive the results of permitted tool executions.

This makes the target's behavior a real object of testing instead of a predetermined script.

The project has access to Groq and Gemini API keys for potential runtime use. The intended direction is to use a supported provider for the target agent where configuration and model capabilities permit, while retaining deterministic execution for reliable tests and environments where a live model is unavailable.

## 6.2 What “model-driven” means for AgentBreak

The target should:
- Receive task instructions and relevant context
- Be exposed to the configured sources and tools for the assessment
- Make real responses or tool-call decisions through the selected model
- Have tool requests captured as observable events
- Receive tool results through the controlled environment
- Continue the task based on the resulting context
- Produce an outcome that can be checked against the assessment's security and utility requirements

The model does not directly prove whether an exploit succeeded. A separate evidence process must determine whether the intended state change occurred.

## 6.3 Why retain deterministic mode?

A live model introduces variability and depends on provider availability, model behavior, and configuration. Deterministic mode remains useful for repeatable tests, debugging, offline demonstrations, and regression checks.

The key requirement is transparency:
- Live model execution must be identified as live only when the provider actually responds.
- Deterministic runs must be identified as deterministic.
- Replays must be identified as replays.
- Results from these modes should not be combined without clear labels and suitable comparison rules.

## 6.4 Why this matters

Model-driven execution makes AgentBreak more representative of real agent behavior. It can reveal how a target interprets context, selects tools, and responds to an attempted attack under a particular configuration.

It also introduces variability, so the platform must be careful not to overstate the significance of a single run. Repeatability, trace capture, bounded tests, and explicit verification are essential.

---

# 7. Capability C — Attack-to-impact evidence graph

## 7.1 The idea

AgentBreak should translate the execution history into an interactive graph that explains the relationship between an attack source, target-agent behavior, tool activity, defense decisions, and the final outcome.

The graph is not merely a visualization of timestamps. It is a way to investigate the path from an input to a security-relevant consequence.

A typical path may include:

**Untrusted source → retrieved content → target-agent action → tool request → policy decision → tool execution or block → observed state → independent verification → finding**

The actual path will depend on what happened in the run. If the attempt stops early, the graph must stop there.

## 7.2 What users should be able to understand

At a glance:
- Where the attack originated
- Which agent or tool was involved
- Which action was attempted
- Where the defense intervened
- Whether a side effect occurred
- Which evidence supports the outcome

On selecting a node, users should be able to inspect the corresponding event and its available input, output, arguments, policy decision, state delta, and verification details.

## 7.3 Evidence and causal integrity

The graph should distinguish:
- Directly recorded events
- Explicit relationships from the execution trace
- Relationships inferred from correlation or analysis
- Missing or unavailable evidence

A temporal sequence alone does not prove causation. The graph should not turn “this happened next” into “this caused that” unless the trace or analysis supports the relationship.

Similarly, a tool-call request is not proof that a tool ran. A tool result is not always proof that the environment changed. A successful model response is not independent verification of its own claim.

## 7.4 Why this matters

Security reports often lose the path between an initial input and its impact. An evidence graph can make that path inspectable, reduce the effort needed to understand a finding, and help teams reason about where a defense should be applied.

It can also make failed attacks useful. If the attempt was blocked at the policy boundary, the graph should show that point clearly rather than hiding the failed path or presenting it as a successful exploit.

---

# 8. Capability D — Closed-loop defense validation

## 8.1 The idea

AgentBreak should evaluate defenses as part of a repeatable cycle, not as a one-time checkbox.

The cycle is:

1. Establish the baseline behavior.
2. Attempt an attack and verify its outcome.
3. Apply or select a defense.
4. Re-run the original case under comparable conditions.
5. Test a bounded variation or adaptive re-attack.
6. Run legitimate tasks that exercise normal functionality.
7. Compare the evidence and report both security and utility outcomes.

This links vulnerability discovery to mitigation evaluation.

## 8.2 What a meaningful result looks like

The Defense Lab should answer four separate questions:

1. **Did the original exploit reproduce?** The baseline should establish what actually happened, including whether the protected state changed.
2. **Did the defense stop it?** The defended run should be evaluated using the same relevant security property and independent state checks.
3. **Did the attack adapt around the defense?** A bounded new variant may reveal a remaining path. If no adaptive re-attack was performed, the report should say so.
4. **Did normal behavior survive?** Legitimate tasks should be tested to identify overblocking, failed workflows, or other utility regressions.

These dimensions should remain visible separately. A single aggregate score can hide important trade-offs.

## 8.3 Why baseline and defended runs must be comparable

Comparisons are meaningful only when the relevant conditions are known. If the target, scenario, tools, or attempt budget change, those differences should be disclosed rather than silently attributed to the defense.

Stored replay and re-execution are also different:
- A replay helps inspect an earlier trajectory.
- A new execution tests how the target behaves now.
- A defended re-execution tests the mitigation under the current configuration.

The interface should make these distinctions understandable.

## 8.4 Why this matters

A defense that blocks a known test but fails against a small variation may offer a false sense of security. A defense that prevents all tool calls may appear safe while making the agent useless.

Closed-loop validation encourages a more balanced question: **Did security improve, and what legitimate capability was preserved or lost?**

---

# 9. The integrated experience: one assessment, one story

The four capabilities should form a connected workflow rather than separate demo features.

Consider a synthetic support-agent assessment:

1. The user selects a target agent, a retrieved-content attack family, the available tools, a defense profile, and a testing budget.
2. The Hunter attempts an indirect prompt-injection path inside the sandbox.
3. The Operator receives actual task context and produces observable model responses or tool-call requests.
4. The Sentinel evaluates actions against the configured policy.
5. The controlled environment either executes a permitted tool action or prevents a blocked action from taking effect.
6. The Auditor checks the relevant state and correlates the events.
7. The evidence graph shows the path actually observed.
8. If a vulnerability is verified, the user selects a defense and repeats the assessment.
9. AgentBreak re-tests the original case, explores a bounded variation when supported, and checks legitimate tasks.
10. The final comparison explains what was prevented, what remained vulnerable, and whether normal behavior regressed.

This example is illustrative. The exact events, tools, and outcome should come from the configured scenario and actual execution. The product must not force every run to follow the same story.

## The intended experience

A judge or engineer should be able to watch an assessment and understand:
- What the red team is trying to test
- How the target agent behaves
- Where the policy boundary applies
- What actually happened to the environment
- Why the finding is or is not verified
- Whether the defense improved the result
- Whether legitimate functionality remained intact

The result should be compelling because the evidence is understandable—not because the outcome is scripted to look successful.

---

# 10. Safety and trust principles

AgentBreak should be ambitious in what it tests and conservative in what it claims.

## Controlled environment
Dangerous actions should remain inside a controlled sandbox with synthetic data and contained tool adapters. The product should not need real customer records or uncontrolled external side effects to demonstrate a vulnerability.

## Evidence over assertion
A model-generated explanation can help a user understand an event, but it is not a substitute for the event record or independent verification.

## Explicit uncertainty
If an oracle is unavailable, a state check fails, a trace is incomplete, or a result cannot be reproduced, the platform should report the uncertainty instead of converting it into a pass or fail without evidence.

## Clear execution modes
Live model runs, deterministic runs, and replays are all useful but answer different questions. Their provenance must remain visible in the assessment and report.

## Bounded autonomy
Attack exploration should remain within the declared target, available tools, budget, and safety boundary. The system should be able to stop when it reaches a limit or cannot establish a reliable result.

## Utility is part of security
A defense that prevents an attack by breaking every legitimate task should not be reported as a complete success.

---

# 11. What success should mean

AgentBreak should be evaluated by the quality and clarity of the security evidence it produces—not just by how many attacks it launches or how animated the interface appears.

## Discovery quality
- Can it test distinct attack families rather than only one fixed scenario?
- Can it record meaningful variations and the outcomes that informed them?
- Can it distinguish adaptive exploration from a fixed test suite?

## Runtime authenticity
- Can a configured target make actual model-driven tool decisions?
- Are tool requests and outcomes captured?
- Is deterministic fallback clearly identified?
- Can a reviewer reproduce or inspect a stored trace?

## Evidence quality
- Can a finding be traced to concrete events and relevant state?
- Are explicit relationships distinguished from inferred ones?
- Are requested, executed, blocked, and verified actions separate?
- Does the system admit when evidence is incomplete?

## Defense quality
- Does the original attack stop under the defended configuration?
- Is the relevant side effect independently checked?
- Are bounded variations tested where supported?
- Are legitimate tasks checked for regressions?

## Product clarity
- Can a new user understand the assessment without reading raw JSON first?
- Can a judge follow the attack path from source to outcome?
- Do the agents make actual activity easier to understand?
- Does the final report explain both the result and the limits of the test?

---

# 12. Intended impact

## For AI developers
AgentBreak should help developers move from vague suspicions about prompt injection or excessive tool access to concrete, reproducible examples of unsafe agent behavior.

## For security teams
It should make agent-specific attack paths easier to investigate, compare, and validate against policy and sandbox evidence.

## For teams building defenses
It should encourage testing a mitigation against known exploits, altered attack attempts, and legitimate tasks instead of relying on one successful block.

## For evaluators and researchers
It should make the conditions and evidence behind a security result more visible, including the difference between live model behavior, deterministic testing, replay, and unverified outcomes.

## For users and organizations relying on agents
The longer-term impact is greater confidence that agents can use tools and context productively without being trusted blindly. AgentBreak is intended to help surface the gap between what an agent is supposed to do and what it can actually be induced to do.

## What the project should contribute

AgentBreak's contribution is not simply “AI attacks AI.” Its intended value is to connect **adaptive attack exploration, observable model-driven execution, evidence-backed impact, and defense-plus-utility validation** into a single understandable workflow.

That combination makes a security finding actionable: the team can see what failed, inspect why the conclusion is justified, test a mitigation, and determine whether the agent remains useful.

---

# 13. Scope discipline: what AgentBreak should and should not claim

The product should aim to demonstrate a meaningful end-to-end workflow before claiming broad coverage.

- A working indirect prompt-injection scenario does not establish that memory poisoning is supported.
- Several variants of one scenario do not establish broad multi-vector coverage.
- A model API configured in the environment does not prove the target runtime used it successfully.
- A blocked tool request does not, by itself, prove that no side effect occurred.
- A successful deterministic test does not establish live-model robustness.
- Replaying a known trace does not establish that a defense survives adaptive re-attack.
- Blocking the attack does not establish that legitimate utility was preserved.
- A limited successful assessment does not prove an agent is fully secure.

The platform should communicate the scope and limitations of every result. This is not a weakness in the presentation; it is part of making the system credible.

---

# 14. Final product statement

**AgentBreak is an AI Security Lab that autonomously probes tool-using AI agents, observes their real behavior inside a controlled environment, traces attacks to verified impact, and tests whether defenses stop those attacks while preserving legitimate functionality.**

Its signature experience is a living, inspectable assessment in which the Hunter explores, the Operator acts, the Sentinel enforces policy, and the Auditor establishes what the evidence proves.

The intended impact is to make AI-agent security testing more adaptive, explainable, reproducible, and useful to the people responsible for deploying trustworthy agentic systems.

**Find the path. Prove the impact. Test the defense. Preserve the utility.**
