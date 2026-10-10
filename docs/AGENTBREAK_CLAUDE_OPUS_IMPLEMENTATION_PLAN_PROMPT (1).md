# MASTER PROMPT — AGENTBREAK 24-HOUR IMPLEMENTATION PLAN

You are Claude Opus acting as a principal software architect, staff-level full-stack engineer, AI-agent security engineer, hackathon technical lead, and implementation-planning specialist. Your assignment is to analyze the attached AgentBreak research foundation and PRD documentation pack, then produce an exceptionally detailed, executable, dependency-aware implementation plan for a two-person team with exactly 24 hours to build and rehearse a compelling MVP.

**Do not implement the application. Do not write application source code. Do not restart broad research.** Your deliverable is the plan and its supporting Markdown files, including task-by-task prompts that a lower-cost coding model operating through Google Antigravity can execute.

The plan must be specific enough that the team can follow it without repeatedly asking a model to make architecture, scope, interface, or sequencing decisions.

---

## 1. Project context and fixed constraints

- **Project:** AgentBreak — The Autonomous AI Red Team.
- **Event:** CRCE Bit N Build, college round.
- **Time budget:** 24 hours total, including setup, integration, testing, demo preparation, and contingency. Treat this as a hard deadline, not a suggestion to create a 24-hour coding-only schedule followed by more work.
- **Team:** two people.
- **Coding environment:** Google Antigravity.
- **Implementation approach:** AI-heavy. One teammate will primarily direct coding agents, manage task prompts, review diffs, make integration decisions, and keep the repo coherent. The other teammate will primarily run tests, verify results, integrate and troubleshoot, prepare the demo and presentation, and help with coding where needed. Design a practical, flexible split; do not assume either person can do only one type of task.
- **Repository:** an existing but mostly empty GitHub repository. Inspect its actual state before planning file changes. Do not assume it is a brand-new repo or overwrite existing material.
- **Implementation model:** a low-cost coding model such as an available Gemini Flash model, invoked through Antigravity. Do not rely on one exact model/version being available. Make tasks self-contained and compatible with a coding model that may need precise instructions.
- **Runtime model/API access for AgentBreak:** UNKNOWN at planning time. Do not assume an API key exists. Make availability checking a short first-hour preflight, not a blocker for the project.
- **Demo mode:** HYBRID. The product should use a live model-backed path when configured and reliable, but must retain a clearly disclosed deterministic/offline fallback that can complete the core demo without a network or runtime API key.
- **Technology decision:** the current PRD proposes React + TypeScript + Vite, Python + FastAPI, SQLite, Pydantic, and a small testing stack. You must critique the stack for a 24-hour build in Antigravity and choose a final stack. Do not preserve multiple equally recommended stacks. If you recommend changing the proposal, explain the benefit, transition cost, risks, and exact consequences for the docs and task plan.
- **Priority:** high wow factor, but with a working, technically credible demo as the non-negotiable foundation. Wow should come from a polished security-operations interface, clear evidence, a convincing before/after sequence, and real measurable results—not fake metrics, excessive animation, or scope expansion.
- **Output format:** one master `IMPLEMENTATION_PLAN.md`, supporting detail in separate Markdown files, and copy-paste-ready task prompts for implementation through Antigravity.
- **Research status:** the research phase is considered finalized. The task is implementation planning, not a new novelty search or full systematic literature review.

### Operating principle

**A narrow, complete, evidence-backed security workflow beats seven superficial features.** Keep all seven official requirements represented in scope and traceability, but prioritize a working vertical slice and clearly label partial or stretch functionality.

---

## 2. Inputs that must be read in full

Use every supplied input as an actual source, not a quick skim. Do not rely only on executive summaries, filenames, search snippets, or the existing implementation-plan draft.

### A. Official problem statement PDF

`CRCE Round Problem Statements.pdf`

This is the source of truth for the official AgentBreak problem statement and its seven requirements. Locate the relevant AgentBreak pages and verify the title, backstory, exact problem statement, and wording of Features A–G. Also inspect any relevant competition constraints or evaluation criteria contained in the PDF. Record exact discrepancies if the PDF and a derived document disagree; do not silently rewrite official wording.

### B. Final research foundation

Use the file named or identified as the finalized, most comprehensive research foundation, expected to be `AGENTBREAK_RESEARCH_FOUNDATION (2).md` or the copy renamed `AGENTBREAK_RESEARCH_FOUNDATION.md`.

Pay specific attention to:
- the executive synthesis and limitations;
- official requirements and inferred requirements;
- requirements traceability and feature analyses;
- prior-art and novelty caveats;
- candidate directions, especially the hypothesized closed-loop validation direction;
- architectural trade-offs;
- exploit evidence and finding-state distinctions;
- sandbox, tool-boundary policy, and permission auditing;
- metric definitions and their denominators;
- trace provenance, replay modes, repeatability and regression;
- local versus hosted model trade-offs;
- the updated repository/code inspection and correction records;
- the final audit and remaining unknowns.

Do not interpret an “unknown” as evidence that a feature is absent from existing products. Do not claim AgentBreak is the first or only system of its kind. Do not reopen the research foundation's open research checklist unless an item is a true implementation blocker; log it as an assumption or explicit limitation instead.

### C. Entire PRD pack

Read the ZIP and/or extracted directory `AGENTBREAK_PRD_PACK/`, including the root documents, manifest, and **every** Markdown file:

- `PRD.md`
- `README.md`
- `manifest.json`
- `docs/00-product-brief.md`
- `docs/01-functional-requirements.md`
- `docs/02-user-journeys-and-workflows.md`
- `docs/03-scope-and-priorities.md`
- `docs/04-threat-model-and-safety.md`
- `docs/05-system-architecture.md`
- `docs/06-technology-stack.md`
- `docs/07-data-model-and-event-schema.md`
- `docs/08-api-contract.md`
- `docs/09-ui-ux-specification.md`
- `docs/10-attack-defense-and-demo-scenarios.md`
- `docs/11-metrics-and-evaluation.md`
- `docs/12-implementation-plan.md`
- `docs/13-team-workflow.md`
- `docs/14-test-and-quality-plan.md`
- `docs/15-demo-script-and-presentation.md`
- `docs/16-acceptance-criteria.md`
- `docs/17-risks-assumptions-and-decisions.md`
- `docs/18-glossary-and-terms.md`

The current `docs/12-implementation-plan.md` is a preliminary baseline. Expand and improve it substantially; do not merely copy it, and do not create a slightly reformatted duplicate.

**If any required file is not available, explicitly identify it, explain the planning impact, and proceed with a bounded assumption. Do not pretend that you read files you could not access.**

---

## 3. Source hierarchy and decision discipline

Use this hierarchy:

1. **Official problem statement PDF:** defines the exact official requirements.
2. **User constraints in this prompt:** define the current deadline, team model, coding environment, demo approach, repo status, stack-review requirement, and output format.
3. **PRD pack:** defines the currently selected product behavior, MVP, scenario, interfaces, requirements, metrics, and acceptance criteria.
4. **Research foundation:** informs technical risk, limitations, prior art, appropriate evaluation, and honest claims.
5. **Your engineering judgement:** may resolve implementation choices, but must be identified as a recommendation or decision—not misrepresented as a source requirement.

When sources conflict:
- create a concise **Conflict and Resolution Register**;
- quote or reference the conflicting IDs/file/section names;
- state which source has authority for the issue;
- choose an implementation resolution where appropriate;
- record the consequence for scope, acceptance tests, schedule, and any document that would need updating;
- do not alter the official requirements silently.

Separate each important statement into one of these categories where useful: **Source requirement**, **Documented decision**, **Planning recommendation**, **Assumption needing validation**, or **Deferred/unknown**.

Do not ask me questions. When an input is unavailable, use the safest, simplest bounded assumption and record it.

---

## 4. Product and technical direction to preserve

The chosen MVP is a controlled security laboratory built around one signature scenario:

- A synthetic customer-support agent receives a legitimate task and reads a support ticket containing indirect malicious instructions.
- Synthetic customer data and mock tools are used exclusively.
- The tool set includes `read_ticket(ticket_id)`, `lookup_customer(customer_id)`, and `send_email(recipient, content, data_labels)` or the closest contract already defined in the PRD. Do not silently change tool names or argument schemas; reconcile any differences in the decision register.
- The local mock email service records attempted and completed sends but never contacts real recipients.
- Baseline mode should demonstrate a genuine unauthorized mock side effect in the intentionally vulnerable configuration.
- The exploit oracle determines success from actual tool execution, policy decisions, and sandbox state—not solely from model narration or an LLM judge.
- Defense is enforced before a side effect is committed, at the tool boundary. A prompt that merely tells the agent not to do something is not sufficient enforcement.
- The defended configuration should block the same known case while at least one legitimate support task remains successful.
- Events, findings, configurations, and test results are persisted. Replay executes a case again in a reset environment and creates a new run; it must not simply show the old transcript and label it a replay.
- The dashboard derives all metrics and statuses from persisted results. No hardcoded “success” metrics or deceptive simulated progress.
- Deterministic/offline mode must work even without an API key. If the app uses this mode, it must label it honestly. If live model mode is available, show which run used which mode/provider/model configuration.
- Implement bounded attack-candidate generation and at least one feedback-informed mutation with parent-child lineage if feasible within the core schedule. LLM-assisted attack mutation is optional and must never control the verdict. Distinguish exact replay from adaptive re-attack.
- All seven official requirements (autonomous discovery, multi-stage analysis, permissions, replayable traces, defense validation, dashboard, regression testing) must map to tasks and evidence. Depth can differ by priority tier.

### Research-derived cautions that must affect the plan

- Adaptive agent red-teaming, trajectory audit and defense evaluation already have substantial prior art. Do not pitch generic adaptive attack generation or a dashboard as a novel research contribution.
- Static replay alone is weaker than re-attacking a defended agent with variants. Report them as separate test conditions.
- A suspicious response is not a confirmed exploit. An attempted tool call is not an executed call. A blocked action is not a successful exploit. An execution error is not a security block.
- “Regression passed” only means the selected suite passed; it does not prove no new vulnerability exists.
- A demo with synthetic mock tools demonstrates the implemented scenario under its test conditions, not production-agent security.
- Store raw numerators and denominators, test budgets, valid/error attempts, model/config versions if applicable, scenario and policy versions, and the evidence IDs supporting every confirmed finding.
- Do not overbuild persistent memory, vector databases, universal agent adapters, containers, real services, or extra attacks unless an official requirement truly depends on them.

---

## 5. Required analysis workflow before planning

Complete this analysis as a planning exercise before writing the implementation roadmap.

### Step 1 — Verify the input package

- Inventory every input and confirm all PRD documents are present.
- Inspect the repo-status assumption: plan for an existing but empty repository and include a non-destructive initial inspection.
- Confirm that the PRD ZIP manifest/file inventory agrees with the extracted directory.
- Verify the seven official features against the PDF and report any difference from the PRD/research wording.

### Step 2 — Build a source-to-plan traceability map

Create a matrix mapping:
- each official requirement A–G;
- every MUST/P0 requirement in the PRD;
- relevant architecture, API, schema, threat-model, UI, metric, test, and acceptance requirements;
- the implementation task that will satisfy it;
- the observable proof or test that will demonstrate completion;
- whether it is P0, P1, P2/stretch, or explicitly deferred.

Do not produce tasks that do not trace to a requirement, necessary engineering task, safety constraint, or explicit wow/demo need.

### Step 3 — Audit cross-document consistency

At minimum inspect and report consistency among:
- official A–G wording versus PRD requirements;
- the FR requirement IDs/priorities and the scope/priorities file;
- scenario tool signatures across product brief, scenario, architecture, API and data schema;
- the event vocabulary, outcome state machine, finding statuses, and trace completeness definitions;
- defense validation and regression endpoints versus actual MVP requirements;
- all metric formulas and their denominators;
- replay semantics versus persisted data/reset procedures;
- deterministic fallback versus model adapter expectations;
- the current preliminary implementation plan versus actual PRD priorities;
- the visual/wow goals versus schedule and safety requirements.

Produce a Conflict and Resolution Register. Do not spend hours polishing documentation contradictions that do not affect implementation, but any conflict in an API contract, schema, outcome enum, security policy, or acceptance test must be resolved before parallel coding begins.

### Step 4 — Critique and decide the stack

Critically evaluate the currently proposed React + TypeScript + Vite, FastAPI/Python, SQLite, Pydantic, pytest, and optional frontend tests. Evaluate no more than three realistic choices (including the current proposal) against:
- Antigravity/coding-agent implementation reliability;
- quality of a high-impact visual dashboard;
- time-to-first-working-end-to-end slice;
- integration and dependency risk;
- traceable tool-side-effect/oracle implementation;
- local setup and offline operation;
- ease of testing and replay;
- runtime API uncertainty;
- maintenance cost inside 24 hours.

Use a small weighted decision matrix, state the weights, and select **one** default stack. The scores are engineering judgement, not objective facts. Avoid prolonged stack debate. Include one fallback only if a concrete failure condition triggers it. Prefer small dependencies and a local-first application; no new database service, vector DB, message queue, or unnecessary agent framework.

### Step 5 — Identify the true critical path

Use dependency reasoning, not aesthetic preference. The expected critical path should prioritize:
1. repository/setup and shared contracts;
2. synthetic fixtures and mock tools;
3. policy enforcement and side-effect evidence;
4. exploit oracle and baseline case;
5. event/trace persistence;
6. defense plus benign utility;
7. API/UI integration;
8. replay/regression and metrics;
9. bounded mutation/model-assisted variation;
10. polish, test freeze, and rehearsal.

You may adjust the order if a better sequence is justified by the source documents, but explain why. The attack generator and polished dashboard must not be scheduled before the exploit oracle and end-to-end acceptance path are viable.

---

## 6. Required implementation principles

The plan must apply these principles throughout:

1. **Vertical slices over isolated layers.** Integrate a thin slice early and keep the application runnable at all times.
2. **Fail-safe mode selection.** Probe runtime API availability for no more than a few minutes at the start. Missing credentials, provider failure, or latency must not block the deterministic core.
3. **No deceptive fallback.** Label deterministic runs as deterministic. Never represent mock/deterministic target behavior as live LLM behavior.
4. **One canonical scenario first.** Do not expand the attack taxonomy until the attack–oracle–defense–utility loop passes.
5. **Contracts before parallel work.** Lock the tool schemas, outcome enums, event payload shape, database fields, API response models, and UI states before two work streams diverge.
6. **Tests in each task.** Every task specifies a test/verification command and expected observable result. Avoid a single “test everything” phase at the end.
7. **Real evidence throughout.** Every finding, metric, timeline entry, and UI status comes from backend events and recorded state.
8. **Bounded loops.** Attempt, time, request, output, and retry budgets are explicit. Model outputs never become shell commands, arbitrary URLs, or arbitrary Python callables.
9. **Safety by architecture.** Only registered mock tools and synthetic data; no real email, production API, arbitrary network tool, or secret in trace output.
10. **Feature cuts in order.** Cut stretch features and decoration before policy correctness, oracle evidence, benign utility, trace, or an end-to-end demo.
11. **No fake novelty.** Pitch the product as a carefully integrated, evidence-backed workflow; state limitations.
12. **A wow factor with a purpose.** Invest UI effort in a premium security-operations visual language, live event timeline, highlighted policy boundary, evidence-backed findings, and crisp A/B results—not ornamental charts over unverified numbers.

---

## 7. Required output: a detailed multi-file documentation pack

Create the plan in a new folder, for example:

```text
implementation-plan/
├── IMPLEMENTATION_PLAN.md              # Master entry point and execution control
├── 00_SOURCE_AUDIT_AND_DECISIONS.md     # Inputs, issues, assumptions, chosen decisions
├── 01_STACK_AND_REPOSITORY.md           # Stack verdict, setup, repo structure, commands
├── 02_ARCHITECTURE_AND_CONTRACTS.md     # Components, data flow, schemas and interfaces
├── 03_24_HOUR_EXECUTION_TIMELINE.md     # Critical path, timeline, parallel lanes and gates
├── 04_TESTING_AND_ACCEPTANCE.md         # Test matrix, verification commands, quality gates
├── 05_TEAM_AND_AI_CODING_WORKFLOW.md    # Antigravity prompt loop, ownership, Git process
├── 06_DEMO_RUNBOOK_AND_FALLBACKS.md     # Judge-facing demo, rehearsal, offline fallback
├── 07_RISK_REGISTER_AND_CUT_RULES.md   # Risks, triggers, mitigations and scope cut order
├── 08_REQUIREMENT_TRACEABILITY.md       # Official A–G and PRD requirement to evidence mapping
├── tasks/
│   ├── T00_REPO_AND_CONTRACT_FREEZE.md
│   ├── T01_BOOTSTRAP_AND_INTEGRATION_SEAM.md
│   ├── T02_SYNTHETIC_AGENT_AND_MOCK_TOOLS.md
│   ├── T03_POLICY_AND_EXPLOIT_ORACLE.md
│   ├── T04_BASELINE_ATTACK_AND_MUTATION.md
│   ├── T05_TRACE_AND_PERSISTENCE.md
│   ├── T06_DEFENSE_AND_BENIGN_UTILITY.md
│   ├── T07_API_AND_ORCHESTRATION.md
│   ├── T08_DASHBOARD_AND_TRACE_UI.md
│   ├── T09_REPLAY_REGRESSION_AND_METRICS.md
│   ├── T10_LIVE_MODEL_ADAPTER_OPTIONAL.md
│   └── T11_HARDENING_FREEZE_AND_DEMO.md
└── prompts/
    ├── P00_PLAN_AND_REPO_PREFLIGHT.md
    ├── P01_IMPLEMENT_VERTICAL_SLICE.md
    ├── P02_AGENT_TOOLS_AND_ORACLE.md
    ├── P03_DEFENSE_TRACES_AND_STORAGE.md
    ├── P04_API_UI_INTEGRATION.md
    ├── P05_REPLAY_TESTS_AND_POLISH.md
    └── P06_DEBUGGING_AND_CODE_REVIEW.md
```

You may adjust the filenames or split/merge a small number of files if it materially improves usability. Preserve the concepts and outputs above; do not over-fragment the plan into dozens of trivial files. All relative Markdown links must work. Include a concise root README if appropriate.

**Output-mode fallback:** If your current interface can create files/artifacts, create the complete folder and provide it as a downloadable ZIP plus the master Markdown. If it cannot write files, do not pretend it has created files. Instead, deliver the full contents as clearly labelled Markdown artifacts in manageable batches, using exact target paths as headings, beginning with the master file and manifest. Continue through every file until the pack is complete; do not collapse the deliverable to an outline because of response length. Make all cross-file links and references consistent.

### A. Master `IMPLEMENTATION_PLAN.md`

It must contain:
- concise executive decision summary;
- final product scope and what will actually be demonstrated;
- non-negotiable success definition;
- source and decision hierarchy;
- chosen architecture and technology stack, with why;
- the critical path and dependency diagram;
- a full 24-hour schedule with parallel work lanes;
- milestones, hard acceptance gates, and stop/go conditions;
- work ownership by teammate;
- a requirement-to-evidence overview;
- scope cut order;
- links to all detailed docs/task prompts;
- final go/no-go checklist.

Do not make the master plan a long generic essay. It should be the operational home page and link to the detailed specifications.

### B. Source audit and decisions

Include:
- exact source inventory and evidence that every PRD file was considered;
- official PDF cross-check results;
- cross-document conflicts and resolutions;
- stack decision matrix and final choice;
- assumptions, decisions and deadlines for validating them;
- known unknowns and which are non-blocking;
- decisions that must not change once parallel implementation starts.

### C. Architecture and contracts

Specify concrete contracts, not just boxes on a diagram:
- components and responsibility boundaries;
- call sequence for one attack attempt;
- the exact source of truth for exploit verdicts;
- run/attempt/finding/event lifecycle;
- canonical tool names and argument/result shapes;
- event names and required fields;
- outcome enums and meaning of each state;
- API method/path, request and response payloads, validation, error handling;
- persistence schema/relationships and reset strategy;
- deterministic and live-model adapter interfaces;
- cancellation and timeout policy if included;
- trace completeness and evidence references;
- which decisions are fixed versus configurable.

If the PRD already specifies a contract, preserve it unless the audit identifies an actual conflict. Record any chosen change. Do not invent incompatible parallel schemas for the plan and task prompts.

### D. Twenty-four-hour timeline

Use elapsed time `T+00:00` to `T+24:00`; do not use vague labels such as “morning” or pretend 24 hours of focused coding has zero fatigue or integration overhead.

For each time block show:
- start and end elapsed time;
- objective;
- task IDs and dependencies;
- owner / pairing mode;
- exact deliverable;
- test or evidence that proves completion;
- acceptance gate;
- likely failure mode;
- fallback/cut decision if the gate is missed.

Schedule setup and access checks, documentation/context loading for the coding models, coding, integration, tests, visual polish, rehearse, and buffer. Explicitly reserve meaningful time for stabilization and at least two consecutive end-to-end rehearsals. The schedule must total 24 hours and account for parallelism without double-counting a person's time. Mark the true critical path versus parallel tasks.

Provide:
- a compact Gantt-like table;
- predecessor/dependency list or DAG;
- the earliest credible end-to-end demo time;
- freeze time;
- the contingency plan if only 12–16 hours remain or a milestone slips.

### E. Every task file must be implementable

Each task spec must use this template:

1. **Task ID and title**
2. **Priority:** P0/MUST, P1/SHOULD, or P2/STRETCH
3. **Timebox and owner**
4. **Purpose and user-visible value**
5. **Prerequisites/dependencies**
6. **Requirements and source references**
7. **In scope / explicitly out of scope**
8. **Exact files to create or edit** (paths and responsibility; do not pretend files already exist)
9. **Detailed implementation steps in correct order**
10. **Interfaces and data contracts consumed/provided**
11. **Acceptance criteria** that are observable and binary where possible
12. **Tests to add/run**, with expected outputs and command(s) that will be finalized after stack selection
13. **Manual verification procedure**
14. **Failure modes and debugging steps**
15. **Fallback/cut rule**
16. **What the next task needs from this task**
17. **Completion evidence to commit**
18. **A task-specific copy-paste prompt** for the coding model in Antigravity.

Task prompts must tell the coding model to inspect the current repo before editing, read only relevant spec sections, modify only the named scope unless necessary, preserve existing contracts, write/update tests, run the stated checks, report changed files and actual command outputs, and never claim tests passed unless it actually ran them. They should forbid wide refactors and new dependencies without a reason. The coding model should stop and report a conflict rather than silently change shared API/event/data contracts.

### F. Antigravity and low-cost coding-model workflow

Design a practical task loop:
1. human selects a bounded task;
2. model reads that task file and relevant contracts;
3. model inspects repository status and current files;
4. model implements only the task scope;
5. model adds/runs tests and reports exact output;
6. human or validation owner reviews the diff and verifies behavior;
7. commit a working checkpoint;
8. update task status and move to the next dependency-ready task.

Provide:
- the context bundle to attach to each coding prompt;
- instructions on using repo-level guidance (`AGENTS.md` or the tool's supported project rules file) without assuming a file already exists;
- a standard prompt prefix and task prompt format;
- how to prevent context bloat;
- how to recover from a model-generated broken change;
- how to compare an implementation against the spec;
- when to use a stronger model for architecture/debugging/review;
- when the cheaper model is sufficient;
- how to avoid two coding agents editing the same files at once;
- Git checkpoint/rollback practices appropriate for a 24-hour project.

Do not assume an automation, plugin, API key, or model capability exists unless verified in the user-supplied environment. Provide manual equivalents.

### G. Model/API uncertainty and hybrid mode

Design a first-hour preflight that:
- checks whether a runtime model API key/provider configuration is already available, without printing or committing secrets;
- timeboxes this check (maximum 10 minutes unless the core is already finished);
- keeps the deterministic core independent of the provider;
- specifies the adapter interface and timeout/retry/token/attempt budgets;
- records model/provider/configuration when live mode is used;
- makes offline deterministic mode reliable and conspicuously labelled;
- does not turn model/API errors into confirmed blocks or successful defense outcomes;
- defines exactly when to disable live mode for the final demo.

Do not recommend buying services or spending time creating multiple provider integrations. One provider adapter is enough; zero is acceptable for the deterministic fallback.

### H. UI/UX and wow-factor specification

Translate the PRD's visual direction into implementable screens and states. Include:
- overview dashboard;
- run/assessment view;
- evidence-first event timeline;
- finding detail view;
- baseline versus defended comparison;
- benign utility and regression view;
- backend unavailable/loading/error/blocked/no-exploit/confirmed states;
- empty state and deterministic/live mode disclosure.

Prioritize a distinctive, polished security-lab look and a live narrative: untrusted source → attempted tool call → policy decision → observed side effect → verdict. Use motion only if it improves feedback and does not risk stability. Specify the visual hierarchy, layout components, responsive needs, accessibility basics, and the minimum screenshot-quality result. Do not use invented charts or hardcoded metrics. Every view must be backed by contract/API behavior.

### I. Test and evidence plan

Give a test plan that can be executed in the 24-hour window:
- unit tests for policy, oracle, outcome logic, metric calculations, mutation budget, trace completeness;
- API tests for core endpoints and error states;
- integration tests that verify actual mock side effects;
- tests that prove denied actions do not mutate state;
- baseline/defense A/B tests with reset state;
- benign utility tests;
- replay tests proving a new run is created and executed;
- regression tests for an attack case and a benign case;
- end-to-end happy path and provider-unavailable path;
- manual checklist for two successive demo rehearsals.

Define test layers by priority and estimated runtime. Tests must assert event/state evidence, not only status strings. Errors and incomplete traces must be explicit. Provide the minimum commands for backend tests, frontend tests, lint/build, start-up smoke tests, and the complete local demo after stack choice.

### J. Metric correctness

For every metric, define its unit, numerator, denominator, exclusions, and interpretation. At minimum address:
- attack attempts and confirmed exploits;
- ASR for a precisely defined test set;
- defense block rate on previously confirmed cases;
- benign task success and utility delta;
- regression types;
- replay consistency if multiple trials are implemented;
- trace completeness;
- attack budget consumed;
- model/API errors and incomplete runs separately.

Do not combine blocked attempts, no-exploit cases, and errors into a single “secure” outcome. If a metric cannot be validly computed within the available sample, display counts and explain the limitation rather than overstate a percentage.

### K. Demo and contingency plan

Specify:
- exact local start commands and preflight checks;
- seed/reset mechanism;
- click-by-click or command-by-command live demo;
- expected event sequence and result for every step;
- a short narration aligned with the technical evidence;
- response to likely judge questions about model dependence, oracle validity, scope, prior art, and production generalization;
- provider/API failure fallback;
- exploit fails to trigger fallback;
- defense does not block fallback;
- UI/backend failure fallback;
- metric mismatch fallback;
- a feature freeze rule and exact freeze time.

The fallback may use a deterministic target behavior if clearly disclosed and if the tool call, policy enforcement, side effect and oracle are still genuinely executed. It must not just play a prerecorded successful result.

---

## 8. Scope tiers and 24-hour protection

Classify every implementation item:

### P0 — Critical demo path
Must be implemented and verified:
- application runs locally;
- synthetic scenario and registered mock tools;
- explicit security policy and tool-boundary enforcement;
- baseline configuration demonstrates an actual prohibited side effect in mock state;
- deterministic side-effect oracle and linked finding evidence;
- ordered events/trace persisted;
- defended run blocks the side effect;
- at least one legitimate task succeeds with defense on;
- UI exposes real run and trace evidence;
- core API and data contracts tested;
- clear deterministic/live mode status;
- documented setup and repeated demo run.

### P1 — Strong supporting capabilities
Implement after P0 is stable:
- replay creates a new run from reset state;
- regression comparison across one attack and one benign case;
- bounded feedback-informed mutation with lineage;
- attempt/time budgets and cancellation or an explicit safe alternative;
- raw metrics with denominators;
- a second benign test or a few repeat trials;
- polished finding detail and defense comparison.

### P2 — Stretch / only with slack
- LLM-assisted attack mutation;
- more than one attack family;
- live event streaming/SSE;
- graph visualization in addition to timeline;
- JSON trace export or advanced filtering;
- additional provider adapters;
- broader agent-framework integration;
- new attack search against defenses beyond a bounded variation.

You can adjust a priority only with justification in the decision register. Do not silently remove any official A–G requirement: show its minimum interpretation, stretch implementation if any, and evidence planned for the judges.

### Scope cut order
When a gate slips, cut in this order unless evidence says otherwise:
1. extra attack families and repeated trials;
2. provider-specific model integration or LLM-assisted mutation;
3. graph visualizations, complex charts, streaming and extra animations;
4. advanced export/filtering and non-essential configuration controls;
5. optional third benign scenario and other P2 enhancements.

Do **not** cut:
- tool-boundary policy enforcement;
- actual side-effect-based oracle;
- evidence-backed finding/trace;
- defense A/B comparison;
- one legitimate utility case;
- explicit status/metric honesty;
- local deterministic fallback;
- critical integration and final rehearsal.

---

## 9. Required schedule and milestone gates

Produce one 24-hour schedule with overlapping tasks only when different people can actually perform them in parallel. Include start/end times, owners, dependencies, deliverables, tests, and fallback actions.

Use and refine the following gates as appropriate. Do not move difficult core engineering past the point where recovery time disappears:

- **G0, T+00:30:** official scope, PRD conflicts, task owners, event/API/schema contract and repo plan frozen.
- **G1, T+01:30:** backend starts; frontend reaches health/scenario endpoint; initial repo checkpoint committed.
- **G2, target by T+05:00:** baseline scenario produces an actual mock outbox side effect; test can repeat.
- **G3, target by T+07:00:** oracle verdict references the evidence event; trace persistence works.
- **G4, target by T+09:00:** defended version blocks the prohibited side effect and policy reason is recorded; benign case still succeeds.
- **G5, target by T+12:00:** complete core workflow is usable from the UI with real backend records.
- **G6, target by T+15:00:** replay/regression works at minimum level, or a clearly documented fallback is chosen without weakening P0.
- **G7, no later than T+18:00:** all P0 acceptance tests pass; no new P0 feature starts after this point.
- **G8, T+20:00:** feature freeze; only critical fixes, integration, reliability and visual finishing remain.
- **G9, T+22:00:** two consecutive rehearsals or an explicitly disclosed fallback have succeeded.
- **G10, T+24:00:** final local startup and judging build ready.

The gates are targets to validate, not permission to pretend incomplete work passed. If a gate fails, name the exact feature cuts and owners. Include a contingency version for only 12–16 productive hours.

---

## 10. Hard requirements for the task prompts

Every prompt intended for the coding model must be directly pasteable into Antigravity and include:
- project goal and task ID;
- key source docs/sections to read;
- exact scope and prohibited scope;
- prerequisites and assumed state of the repo;
- exact expected files/areas to inspect and edit;
- preserved API/schema/type contracts;
- implementation instructions in small steps;
- explicit acceptance tests and commands;
- expected outputs/observable UI or state changes;
- security constraints;
- test-and-report instructions;
- an instruction to ask the supervising human only if a blocking ambiguity cannot be resolved from the task pack; otherwise use recorded assumptions;
- no broad refactors, no unrelated dependency additions, no hardcoded “successful” data;
- requirement to report actual files changed, commands run, pass/fail results, unverified items, and commit recommendation.

Create a separate prompt for debugging/review that instructs the model to reproduce the bug first, identify the smallest root cause, add a regression test, change the smallest possible scope, and rerun relevant tests. Prevent the coding model from “fixing” a failure by weakening an assertion or hiding an error.

---

## 11. Output quality bar

The plan is not acceptable if it:
- paraphrases the PRD without adding execution detail;
- treats every feature as equally urgent;
- assumes runtime API access exists;
- asks the team to build every layer independently and integrate at the end;
- has tasks without prerequisites, files, tests, owners, or acceptance criteria;
- leaves a critical API/event/schema ambiguity unresolved;
- budgets no time for integration, failure recovery, or rehearsal;
- treats a suspicious model response as an exploit;
- treats one replay as proof of adaptive robustness;
- uses hardcoded or invented dashboard metrics;
- lets model errors count as successful defense outcomes;
- adds real-world tools/network actions or actual customer data;
- uses generic instructions such as “make it polished” without implementable UI detail;
- relies on an endless series of prompts that recreate the entire context on every task;
- opens broad web research or tries to finish the research foundation;
- starts implementation instead of writing the plan;
- claims a technology, API key, test, dependency or feature was verified when it was not.

The plan must be **high-resolution but bounded**: the critical path and each task should be unambiguous, while P2 enhancements remain optional and can be dropped without changing the core architecture.

---

## 12. Required final response from you

After inspecting all the sources and completing the analysis, generate the actual multi-file planning pack, not merely an outline. Use the folder structure from Section 7 and provide all cross-links.

At the end, include a brief **Execution Start Card** with:
1. exactly which files I should attach or open first in Antigravity;
2. the first three actions for the human team;
3. the first task prompt to paste into the coding model;
4. the first verification command and expected outcome;
5. the initial Go/No-Go decision;
6. the precise condition for moving from deterministic core to live-model mode;
7. the timebox for the first task and its exit gate.

Then provide a final audit checklist confirming:
- every required source file was actually read;
- official PDF requirements are represented;
- every official A–G feature maps to a plan task and evidence;
- stack is decided, not left open;
- API uncertainty and fallback are addressed;
- the 24-hour schedule sums correctly and includes stabilization/demo buffer;
- every P0 task has a test and acceptance gate;
- cross-task contracts are consistent;
- task prompts are paste-ready for Antigravity;
- no implementation was started and broad research was not reopened.

If any checklist item is incomplete, mark it as incomplete honestly and explain the consequence rather than pretending the pack is finished.

**Begin with source inventory and analysis. Do not write application code. Deliver the full implementation-plan documentation pack.**
