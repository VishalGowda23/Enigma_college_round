# AgentBreak UI/UX Specification
## Final Visual System, Screen-by-Screen Design, Agent Motion, Interaction Contracts, and Problem-Statement Traceability

**Project:** AgentBreak — The Autonomous AI Red Team  
**Document type:** Product UI specification / implementation contract  
**Status:** Visual direction finalized for implementation  
**Date:** 10 October 2026  
**Primary audience:** Frontend implementer, backend integrator, AI coding agent, demo operator, and hackathon judges

---

## 0. Purpose and how to use this document

This document defines the intended UI and interaction system for AgentBreak in enough detail to guide implementation without repeatedly re-interpreting the design. It covers the design language, page hierarchy, layout, typography, colors, pixel-art agent identity, movement and animation, interactions, event-to-UI mapping, responsive behavior, accessibility, loading/error states, evidence semantics, and acceptance criteria.

It is a **design and behavior specification**, not a claim that all described features are already implemented. Before wiring any screen, inspect the current repository and use the actual API contracts and available runtime behavior. Where an API capability is not present, do not invent data or simulate success. Mark the capability as unavailable, or implement the missing contract as a separate task.

### Non-negotiable principles

1. **Proof before polish.** Security outcomes shown as facts must be backed by recorded execution events and, for side effects, an independent state check.
2. **Motion represents activity.** Agent movement must be driven by runtime state or recorded events. Decorative idle animation is acceptable, but it must never imply a tool call, attack success, defense block, or verification that did not occur.
3. **One coherent visual language.** Use the chosen Sage Mint / porcelain direction throughout the app; do not invent a new theme for each page.
4. **Pixel art is an accent with identity.** Pixel agents, tiny pixel terrain, and a few pixel-style marks should make the product recognizable without turning the entire interface into a game.
5. **Evidence is first-class.** Every important visual event should be inspectable and traceable to an event, tool request, policy decision, or verified environment state.
6. **Security and utility are paired.** A defense is not considered good simply because it blocks attacks; legitimate tasks must still work.
7. **No false live claims.** Clearly distinguish a real model run, a deterministic fallback, a replay, a fixture/demo dataset, and a synthetic environment.

---

# 1. Product experience and visual identity

## 1.1 Product concept

AgentBreak is an autonomous security-testing workbench for tool-using AI agents. Its signature experience is **Follow the Breach**: observe an attack begin with untrusted input, follow how that input influences an agent, inspect the resulting tool call, see the policy decision, and verify the actual side effect—or verify that a defense prevented it.

The product has two synchronized modes:

- **The World:** a compact, spatial execution view. Pixel-art agents occupy a small, clean environment containing sources, data stores, tools, policy boundaries, and outcomes.
- **The Evidence View:** a precise event timeline and causal graph. Users can inspect inputs, tool arguments, policy decisions, outputs, and verification evidence.

Selecting an event in either mode selects the same event in the other mode. The World explains what happened at a glance; the Evidence View explains why the claim is justified.

## 1.2 Design adjectives

- Calm, editorial, and spacious
- Warm, light, and approachable
- Technically precise
- Playful in the agent characters, serious in the evidence
- Clear enough for a judge to understand in seconds
- Dense only where the user has explicitly opened technical detail

Avoid the “generic security SaaS dashboard” pattern: too many identical KPI cards, dark hacker aesthetics, neon glow, gradients behind every panel, decorative waveforms, fake terminal streams, or a dense mosaic of cards on the first screen.

## 1.3 Visual hierarchy

Every screen should have this hierarchy:

1. **Page purpose:** a clear title and one-line explanation.
2. **Primary action or current state:** e.g. Start Assessment, Running, Vulnerable, Blocked, or Verified.
3. **Main work area:** world, list, graph, comparison, or findings.
4. **Supporting context:** summary metrics, filters, or metadata.
5. **Deep evidence:** details panel, raw event, payload, policy, and verification.

Do not give every element equal visual weight. The central work area should dominate.

## 1.4 The design signature

AgentBreak should be recognizable by the combination of:
- A soft sage/porcelain application shell
- Serif editorial page headings paired with a highly readable sans-serif interface font
- Small custom pixel-art agent sprites
- Sparse, crisp dotted paths connecting agents, sources, tools, and outcomes
- Warm, low-contrast surfaces
- Coral/red only for actual risk or dangerous actions
- Green only for verified protection or safe state
- A forensic details drawer that turns a selected event into inspectable evidence

---

# 2. Color system

## 2.1 Final starting palette: Sage Mint

The sage-green option is the chosen base direction. Keep it restrained and use stronger accents only when their meaning is clear.

| Token | Hex | Use |
|---|---|---|
| `--canvas` | `#F4FAF1` | Main app background; pale green-tinted porcelain |
| `--surface` | `#FFFEFA` | Primary panels and cards |
| `--surface-muted` | `#EEF5E9` | Secondary surfaces, sidebars, table headers |
| `--surface-raised` | `#FFFFFF` | Drawers, popovers, selected details |
| `--border` | `#DCE7D8` | Default borders |
| `--border-strong` | `#C5D5C0` | Selected and focused outlines |
| `--ink` | `#202A25` | Primary text |
| `--ink-muted` | `#66736A` | Secondary text and descriptions |
| `--ink-subtle` | `#859087` | Timestamps, metadata, hints |
| `--sage` | `#D6EAD4` | Gentle highlight and safe agent surfaces |
| `--sage-strong` | `#76A889` | Sentinel accents and defense states |
| `--mint` | `#BDEBD6` | Success chips, verified state backgrounds |
| `--blue` | `#78A2D2` | Operator / target-agent identity |
| `--blue-soft` | `#E5F0FC` | Agent-action surfaces and selected blue nodes |
| `--lilac` | `#B99BDD` | Analyst identity and evidence annotations |
| `--lilac-soft` | `#F0E8FA` | Evidence and secondary analysis surfaces |
| `--peach` | `#FFD6A5` | Neutral emphasis, environment objects |
| `--coral` | `#FFC1B6` | Hunter identity and warning background |
| `--danger` | `#C94D3B` | Dangerous action, exploit-confirmed state, destructive controls |
| `--danger-soft` | `#FCE8E2` | Risk cards and blocked-attempt background |
| `--warning` | `#B87924` | Uncertain or needs-review states |
| `--warning-soft` | `#FFF2D5` | Warning background |
| `--info` | `#426F9F` | Information-only status |
| `--shadow` | `#24372A` at 6–10% opacity | Subtle elevation only |

The colors are a semantic system, not a rule that every agent or object must have a colored card. Most of the canvas should remain neutral.

## 2.2 Agent colors

| Agent | Role | Main accent | Soft surface | Color meaning |
|---|---|---|---|---|
| Hunter | Red-team attacker | `#D65C4B` | `#FCE8E2` | Attack generation / risk |
| Operator | Target agent | `#4E8CCB` | `#E5F0FC` | Target execution / tool use |
| Sentinel | Defense | `#438A68` | `#E3F3E8` | Policy and protection |
| Analyst | Evidence investigator | `#9270C1` | `#F0E8FA` | Correlation and verification |

Agent accent colors identify roles consistently, but **event status overrides role color** where safety semantics matter. For example, Hunter remains coral; an actual confirmed exploit outcome uses the danger token; a verified block uses the success token.

## 2.3 State colors

| State | Color | Background | Required label |
|---|---|---|---|
| Idle | Muted ink | Neutral | Idle |
| Running | Blue or ink with subtle live dot | Neutral | Running |
| Attack attempt | Coral | Coral-soft | Attempt |
| Suspicious input | Warning/danger | Warning-soft or danger-soft | Untrusted / Suspicious |
| Tool requested | Blue | Blue-soft | Requested |
| Policy evaluated | Sage/ink | Sage-soft | Policy checked |
| Blocked | Danger-red text with restrained surface | Danger-soft | Blocked |
| Exploit verified | Dark red | Danger-soft | Verified exploit |
| Defense verified | Green | Mint-soft | Verified / Protected |
| Unknown / unverified | Amber/gray | Warning-soft | Unverified |
| Error | Danger | Danger-soft | Error |
| Cancelled | Muted ink | Surface-muted | Cancelled |

Never use color alone to communicate state. Always add a text label and, where appropriate, a recognizable icon.

## 2.4 Usage ratios

As a rough composition guideline:
- 65–75% neutral porcelain/white surfaces
- 12–18% sage-tinted surfaces and scenery
- 5–8% blue and lilac supporting accents
- 3–6% peach and coral
- Strong danger/success colors only around relevant events

Do not tint every panel green. The page should feel airy, not monochromatic.

## 2.5 Color contrast

Body text must remain readable on every background. Avoid pale green, pastel blue, or lavender for small text. Pastels are for surfaces and sprite identity; use `--ink`, `--ink-muted`, and sufficiently dark role accents for text. Verify WCAG contrast for all text and controls before release.

---

# 3. Typography, spacing, shapes, and surface treatment

## 3.1 Typography

Use a two-font system:
- **Display / page headings:** a refined editorial serif such as `DM Serif Display`, `Lora`, or an already-installed serif with similar proportions.
- **UI / body / data:** `Inter`, `Geist`, or the project's existing readable sans-serif.

Do not introduce remote font dependencies if the application must work offline or the font is not already available. Use a graceful system fallback.

Recommended type scale:
- Marketing / Home hero: 44–56 px desktop, 36–42 px tablet, 30–36 px mobile
- Main page title: 32–40 px desktop, 28–32 px mobile
- Section title: 18–22 px
- Card title: 14–16 px semibold
- Body: 14–16 px
- Secondary / helper: 12–13 px
- Dense metadata: 11–12 px, only where needed
- Code / JSON: readable monospace, 12–13 px

Line-height:
- Display headings: 1.05–1.15
- Body: 1.45–1.65
- Dense tables: 1.35–1.5

Use serif headings sparingly. Tables, payloads, controls, and evidence should prioritize legibility over decoration.

## 3.2 Spacing scale

Use a consistent 4 px base:
`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

- Icon-to-label gap: 8 px
- Form field gap: 16–20 px
- Card internal padding: 16–24 px
- Main page section gap: 24–32 px
- Main desktop page gutter: 28–40 px
- Sidebar width: 204–224 px expanded; 64–72 px collapsed
- Details drawer: 360–420 px desktop; full-screen or bottom sheet on narrow screens

Avoid overly tight padding in the main work area. A calm interface depends on whitespace.

## 3.3 Corners and borders

- Small controls: 8–10 px radius
- Standard cards: 12–16 px radius
- Major workspace panels: 16–20 px radius
- Pills: fully rounded only for concise status badges
- Border: 1 px, low-contrast sage gray
- Shadows: subtle and broad; no heavy black drop shadows or floating-glass effect on every card

Avoid excessive nested cards. A card inside a card should exist only when it represents a separate object or inspection context.

## 3.4 Icons

Use a consistent outline icon family for standard controls (e.g. Lucide-style icons if already in the project). Keep icon size consistent:
- Sidebar: 18–20 px
- Inline: 14–16 px
- Primary actions: 16–18 px
- Empty states: 28–36 px

Do not use random icon styles, mixed stroke widths, or emojis as the primary product icon system. Pixel art is reserved for agents and selected decorative details. Security states need a familiar, unambiguous symbol plus text.

## 3.5 Pixel accents in the interface

Use pixel styling lightly:
- Small 16–24 px pixel agent avatar in the sidebar / lists
- Tiny block-like status marker next to agent names
- Pixel-art empty-state mascot
- Small pixel plants, cubes, or stepping tiles in the World scene
- Pixel cursor/selection marker when an agent is active
- Optional pixelated transition for agent spawn/despawn, never for critical status text

Do **not** render all buttons, cards, charts, and icons in pixel style. The contrast between polished editorial UI and pixel agents is the visual identity.

---

# 4. Agent character system

## 4.1 Character design

The uploaded pixel-art references are inspiration for blocky silhouettes, limited palettes, visible pixel clusters, and expressive small faces. Create original AgentBreak sprites; do not directly copy the uploaded characters.

All sprites must:
- Be crisp and pixel-aligned
- Use nearest-neighbor scaling; never blur or smooth the pixel edges
- Have a coherent outline thickness and sprite grid
- Work on light surfaces and in small sizes
- Have readable role-specific silhouettes/accessories
- Be available as sprite sheets or separate transparent assets
- Include multiple poses/frames for movement and interaction

## 4.2 Role identity

### Hunter — Red Team
- Main palette: coral, burnt orange, dark plum/ink outline
- Silhouette: compact, energetic, slightly forward-leaning
- Accessory: tiny notebook, probe tool, or antenna—choose one motif, not all
- Expression: focused / curious; avoid villain clichés
- Movement language: quick steps, short hops between candidate attack surfaces, pauses to inspect a source, pivots toward a newly discovered route
- UI label: `Hunter · Red Team`

### Operator — Target Agent
- Main palette: vista blue, sky blue, dark navy outline
- Silhouette: balanced and neutral
- Accessory: small terminal/tablet or tool satchel
- Expression: attentive; state changes are conveyed by posture/pose rather than exaggerated emotion
- Movement language: walks to a retrieved source, turns toward a tool node, performs a short action animation on a tool request, returns to a neutral/processing stance
- UI label: `Operator · Target Agent`

### Sentinel — Defense
- Main palette: sage, deep green, cream highlight
- Silhouette: sturdy stance with a distinct shield-like outline or small badge
- Accessory: shield / policy emblem
- Movement language: remains near the policy boundary; approaches or turns toward a tool request when policy evaluation starts; shield pose on a real block; returns to guard stance afterward
- UI label: `Sentinel · Defense`

### Analyst — Evidence
- Main palette: lilac, violet, muted charcoal outline
- Silhouette: slightly taller or asymmetric so it is distinguishable at a glance
- Accessory: magnifier, evidence card, or tiny clipboard
- Movement language: moves to an event after it is recorded; examines an event node; links it to its parent; enters a verification pose only after verifier output exists
- UI label: `Analyst · Evidence`

## 4.3 Sprite states

Each character should support these visual states:
- `idle`: subtle 1–2 px breathing/bob; do not move across the world
- `walking`: 4–8 frame walk cycle; character moves between anchored positions
- `inspecting`: turn/head or body angle changes toward selected object; small inspection frame
- `working`: short repeated action animation while a real task is in progress
- `tool_call`: character reaches/points toward the actual tool node
- `blocked`: short stop/recoil or shield-intercept response after policy decision
- `success`: brief confirmation pose after independent verifier confirms intended outcome
- `failure`: subdued error pose only after actual failure event
- `cancelled`: stop movement and return to neutral
- `offline`: no movement, muted sprite, explicit offline label

Avoid looping “typing” or “thinking” forever to imply intelligence. If no real work is happening, use idle state.

## 4.4 Agent movement model

Each agent has:
- Stable identity and role
- Current runtime state
- Current target object (optional)
- Current event ID (optional)
- Current world anchor
- Motion state and animation frame
- Last state-change timestamp
- Whether its state is real-time, replayed, or illustrative

World coordinates are presentation data derived from domain entities. The event model—not the animation system—owns truth.

Suggested conceptual mapping:
- `agent.started` → spawn/fade in or activate
- `source.read_started` → agent walks to source node
- `source.read_completed` → source briefly highlights; agent turns toward next step
- `retrieval.completed` → a dotted path connects source to target agent
- `tool.call.requested` → agent approaches/points toward the tool node
- `policy.evaluating` → Sentinel turns toward the policy gate
- `policy.blocked` → path terminates at the gate; show blocked label; do not show the tool side effect as completed
- `tool.call.executed` → path reaches tool node and a result event is shown
- `verification.started` → Analyst approaches relevant state/evidence node
- `verification.passed` → confirmation mark appears with the verifier's evidence
- `verification.failed` → outcome shows failure/uncertainty; never green
- `run.completed` → agents settle; timeline remains inspectable

Event names above are **recommended UI mapping names**, not a claim that these exact event strings exist in the current API. Map the actual backend event types into this presentation model in a single adapter layer.

## 4.5 Motion timing

- State transition: 120–220 ms
- Agent walk across short distance: 350–800 ms depending on distance
- Tool path draw: 180–400 ms
- Status badge transition: 120–180 ms
- Details drawer: 180–240 ms
- Replay playback: user-controlled speed, e.g. 0.5×, 1×, 2×, 4×
- No mandatory delay before displaying a real event; show the event as soon as received. Animation may catch up, but evidence must not be delayed or falsified.

Respect `prefers-reduced-motion`. When reduced motion is enabled, replace movement with position changes, a short fade, or a highlighted path. The complete evidence must remain understandable without animation.

## 4.6 Agent interaction rules

- Clicking an agent opens an agent detail popover or navigates to Agents.
- Hover/focus shows name, role, current state, current action, and source event.
- Clicking the agent's current action selects the corresponding timeline event.
- Selecting an event in the timeline highlights the agent and tool/source involved.
- A user may pause visual playback without pausing the actual run unless the control explicitly says “Pause Run.”
- Never label a run paused when only the animation is paused.
- If the stream disconnects, stop presenting new live movement and show `Connection lost · reconnecting`. Do not continue a fake activity loop.

---

# 5. Information architecture and global shell

## 5.1 Main navigation

Use a single consistent sidebar across all application pages.

Order:
1. Home
2. Live Lab
3. Assessments
4. Scenarios
5. Agents
6. Evidence
7. Defense Lab
8. Reports

The order reflects the user journey: understand status → launch/run a test → review history → explore scenarios/targets → investigate evidence → validate defenses → report.

### Sidebar details
- Expanded desktop width: 216 px
- Collapsed width: 68 px
- Background: `--surface-muted` with a subtle right border
- Brand area: original AgentBreak mark + wordmark; pixel mark may be used at 24–28 px
- Active item: soft sage background, dark text, small 3 px leading accent or restrained left border
- Hover: slightly darker surface, no scale bounce
- Keyboard focus: visible 2 px outline with offset
- Bottom area: current project/target selector, environment label, signed-in identity if applicable
- Mobile: use a drawer or bottom navigation for primary routes; never squeeze the full sidebar into the content area

## 5.2 Global header

Pages with a current assessment/run show:
- Breadcrumbs
- Target agent / run identifier
- Mode badge: `Live Model`, `Deterministic`, `Replay`, or `Fixture`
- Run status
- Pause/resume/stop actions only when supported
- Share/export action only when implemented and authorized

Global controls must communicate what they do. `Pause Visuals` and `Pause Run` are distinct actions. `Stop Run` requires confirmation if it will terminate an active run.

## 5.3 Shared page frame

- Main content max width: 1600 px for dashboard layouts; full width for graphs/world where useful
- Main gutter: 28 px desktop, 20 px tablet, 16 px mobile
- Top spacing below header: 24–32 px
- Page title + description separated from content by 20–28 px
- Keep only one primary action per page title row
- Details drawers overlay or resize the main content consistently across pages

## 5.4 Global status labels

Always distinguish:
- `Live model`: a model provider actually returned responses in this run
- `Deterministic`: a controlled deterministic execution path was used
- `Replay`: stored events are being replayed, not re-executed
- `Fixture`: example/static data is shown
- `Sandbox`: tools/environment are contained and non-production
- `Unverified`: a result lacks independent state verification
- `Verified`: a specific verifier returned a result and evidence is available

Never infer `Live model` merely because an API key exists in environment configuration.

---

# 6. Screen 1 — Home

## 6.1 Purpose

Give a first-time user a clear understanding of AgentBreak and let a returning user continue work quickly. The page should feel like a premium product home, not an analytics wall.

## 6.2 Desktop layout

A two-column composition:
- Main column ~60–65% width
- Supporting column ~35–40% width
- The upper region has a title and concise positioning statement.
- A small, tasteful cluster of the four pixel agents can occupy a side illustration area or a shallow isometric “workspace island.”
- Below it: recent assessments and quick actions.

Suggested title:
**Find and fix real vulnerabilities in AI agents.**

Supporting line:
`Test. Observe. Defend. Verify.`

Avoid claiming universal coverage or production readiness unless the implementation supports it.

## 6.3 Components

### A. Hero / welcome region
- Display heading
- One-sentence product explanation
- Primary button: `Start assessment`
- Secondary button: `Explore scenarios`
- Tiny agent vignette: four original pixel sprites in a small environment
- Decorative elements must not look like live telemetry

### B. Environment / target summary
Show only actual configuration:
- Current target agent
- Environment type
- Current defense profile
- Model mode (Live / Deterministic)
- Most recent run timestamp

If not configured, show a clear `Set up target agent` action rather than placeholder metrics.

### C. Recent assessments
Each row:
- Scenario title
- Target agent
- Date/time
- Final state (`Vulnerable`, `Blocked`, `Passed`, `Inconclusive`, `Failed`)
- Number of attempts
- Link to run details

Status must derive from stored run results and verification, not a decorative color.

### D. Quick actions
- Start new assessment
- Browse scenarios
- Open Evidence
- Run defense comparison

Only show actions supported by the current app; disabled actions should include a short explanation.

### E. Honest summary metrics
If data exists, show a maximum of three or four:
- Assessments run
- Verified vulnerabilities
- Verified blocks
- Benign task success

Include the denominator and time range where relevant. Do not display `100%` without stating the number of attempts and the evaluation basis. Empty history should show an onboarding state, not zero-filled fake charts.

## 6.4 Home interactions
- `Start assessment` opens the assessment setup flow.
- Clicking a recent run opens its detail page.
- Clicking a metric opens the filtered underlying records.
- Clicking an agent opens Agents with that agent selected.
- On first launch, show a concise guided path: choose target → choose scenario → run in sandbox → inspect evidence.

## 6.5 Empty/error/loading states
- Loading: skeleton rows and muted sprite idle pose; no fake data.
- No assessments: “No assessments yet” + `Start first assessment`.
- API unavailable: visible service status with retry.
- Partial data: render available sections and identify unavailable data without hiding the error.

---

# 7. Screen 2 — Live Lab (signature experience)

## 7.1 Purpose

This is the primary demo screen. It must make the official problem statement understandable in one glance: an autonomous attack is probing a target agent, a tool boundary/defense is evaluating the action, and the outcome is being independently verified.

## 7.2 Page layout

Desktop:
- Header: run title, target, status, mode, defense profile, elapsed time, pause/stop
- Main workspace: ~65–72% width
- Right event detail panel: ~28–35% width, 360–420 px preferred
- Bottom strip: execution timeline, or a collapsible timeline beneath the world
- Avoid a second large graph on this screen if it competes with the world. Graph is a separate Evidence mode or toggle.

At 1440 px wide, the world should remain the dominant surface. On narrow screens, the world becomes a scrollable/canvas-like area with a compact event list below it; details open as a drawer.

## 7.3 Header content
- Breadcrumb: `Live Lab / [Target] / [Run ID]`
- Title: scenario or target name
- Subtitle: what the test is attempting to discover
- Mode chip: `Live Model`, `Deterministic`, or `Replay`
- Agent/tool counts only if derived from scenario/runtime
- Defense profile state
- Elapsed time
- `Pause Run`, `Resume`, `Stop Run` as supported
- Visual playback toggle is separate from run control

## 7.4 World canvas

The World is not a static hero image. It is a structured visualization driven by execution events.

### World objects
- Hunter (attacker)
- Operator (target)
- Sentinel (defense)
- Analyst (evidence)
- Source nodes: retrieved document, memory item, message, web page, or other scenario input
- Data nodes: synthetic customer record, knowledge base, memory store
- Tool nodes: email, database lookup, calendar, payment, file, browser, or whichever tools are actually registered
- Policy boundary / permission gate
- Outcome node(s): side effect executed, action blocked, data exposed, or no side effect
- Optional environment tiles / small block terrain used as a light visual motif

Do not display tools that are not configured for the current target. Scenario-specific nodes should be generated from actual scenario configuration.

### Visual placement
- Hunter on the left or upper-left (attack source)
- Source document/input near Hunter
- Operator near the center
- Tool nodes below or to the right of Operator
- Sentinel near the policy boundary
- Analyst near evidence/verification area
- Outcomes at the right edge
- The layout may rearrange for different scenarios; it should not imply that every attack always follows the same route

### Connections
- Thin dotted or segmented paths connect related nodes.
- Path direction is indicated by a moving dot or small arrow only while an event is actively being animated.
- Completed paths remain as subdued static lines.
- Suspicious source paths use coral/orange.
- Agent execution paths use blue.
- Defense/policy paths use sage/green.
- Evidence correlation paths use lilac.
- Failed or blocked paths terminate at a clear boundary with a blocked marker.
- Do not draw a path for a causal relation unless the event/trace model supports that relation. If the relationship is inferred, label it as inferred.

### Current activity
A compact caption near the active entity may say:
- `Inspecting retrieved document`
- `Requesting customer lookup`
- `Evaluating tool permission`
- `Verifying side effects`

The caption must be generated from a real state/event or stored replay event. No fake thought bubbles. If model reasoning is not available or should not be exposed, use action-level summaries, not fabricated chain-of-thought.

### Node selection
Clicking a node opens/selects its details in the right panel. Keyboard users must be able to focus and select each node. Selected node receives a strong outline and a small label; avoid relying on glow.

### Zoom/pan
- Fit to view
- Zoom in/out
- Reset view
- Pan/drag only when it will not conflict with selecting nodes
- Accessible list/graph equivalent for users who cannot use spatial navigation

## 7.5 Event timeline

A compact chronological timeline is pinned below the world. Each event contains:
- Event label
- Timestamp / relative time
- Actor
- Related source/tool/policy
- Status
- Click-to-inspect affordance

Suggested event sequence for the indirect prompt-injection demo, only when those events actually occur:
1. Document retrieved
2. Suspicious instruction detected (only if detector exists)
3. Target agent requests a tool
4. Tool arguments recorded
5. Policy evaluates request
6. Tool call blocked or executed
7. Environment state checked
8. Run outcome recorded

Do not insert “Hidden Instruction Detected” just because the scenario contains a malicious document. Detection must have an actual detector result or be explicitly labeled as a scenario annotation.

## 7.6 Right event details panel

Header:
- Event icon
- Event type
- Status
- Timestamp
- Previous/next event navigation
- Close/collapse control

Tabs:
1. **Details** — human-readable event description, actor, event ID, scenario, tool, and relationships
2. **Payload** — actual tool arguments/input/output with sensitive values safely redacted where appropriate
3. **Policy** — rule applied, decision, policy version, and explanation
4. **Evidence** — state-check result, oracle result, artifact links, and verification metadata
5. **Raw Event** — exact serialized event for debugging, when useful

Tabs should be enabled only when relevant data exists. An absent policy decision must not show a made-up policy. An absent verifier result must say `Not verified`.

### Tool-call detail
For a tool-call attempt, display:
- Tool name
- Requested arguments
- Requesting agent
- Request timestamp
- Policy decision and rule ID if evaluated
- Whether execution was permitted
- Tool result if executed
- Side-effect delta if observed
- Independent verification result

### Payload handling
- Pretty-print JSON
- Syntax-highlight minimally
- Copy button
- Expand/collapse long values
- Redact secrets/PII in default view
- Allow raw values only if the sandbox policy explicitly permits access
- Mark fixture values as synthetic
- Do not place malicious payload text in executable HTML; render as escaped text

## 7.7 Run controls
- `Pause Run` must pause the execution loop if supported.
- `Pause Visuals` pauses animation only.
- `Stop Run` asks for confirmation and shows what will happen.
- `Replay` uses recorded events and cannot be mistaken for a new attack.
- If the backend supports cancellation but not pause, do not render a Pause control.
- On connection loss, show reconnecting state and last event timestamp.

## 7.8 Live Lab completion state
When a run ends:
- Freeze live motion in final positions
- Keep the complete timeline and evidence accessible
- Show a concise outcome banner: `Vulnerability verified`, `Attack blocked`, `Inconclusive`, or `Run failed`
- Show how the result was determined
- Offer `View Evidence`, `Compare with defense`, and `Replay`
- Never mark an exploit “successful” based only on a model's textual claim

---

# 8. Screen 3 — Assessments

## 8.1 Purpose
Browse, filter, compare, and open historical assessment runs.

## 8.2 Layout
- Title + `New assessment`
- Filter row
- Optional compact summary strip
- Table/list of runs
- Details drawer or navigation to run detail

## 8.3 Filters
- Target agent
- Scenario / attack vector
- Outcome
- Defense state/profile
- Execution mode (Live Model / Deterministic / Replay / Fixture)
- Date range
- Severity
- Verification state

Filters must be reflected in URL query parameters if routing supports it, so a filtered list can be bookmarked/shared.

## 8.4 Assessment row
Fields:
- Run ID (short form; full ID in details)
- Scenario
- Target
- Started at
- Mode
- Attempts / completed attempts
- Final result
- Verification status
- Duration
- Actions: Open, Replay, Compare, Export if supported

Sort by most recent by default. Do not mix fixture results with live results without an explicit mode badge.

## 8.5 New assessment flow
Use a short, staged setup rather than a long crowded modal.

### Step 1 — Target
- Select configured target agent
- Show adapter type and available tools
- Show environment/sandbox warning
- Show whether target configuration is complete

### Step 2 — Scenario
- Browse scenario cards by vector and risk
- Each card explains: goal, initial conditions, required capabilities, expected evidence, and safe sandbox effects
- Select one or more scenarios if batch runs are supported

### Step 3 — Run configuration
- Attack budget / attempt limit
- Time limit
- Defense profile: baseline/off, selected mitigation, or compare modes if implemented
- Execution mode: live model or deterministic fallback
- Repetition count if supported
- Confirm synthetic sandbox / no production side effects

### Step 4 — Review and launch
Summarize the exact target, scenario, mode, defense, budget, and environment. Primary CTA: `Start assessment`.

If a configuration is unsupported, show it disabled with a reason rather than pretending it works.

## 8.6 Run states
- Draft
- Queued
- Running
- Paused (only if truly paused)
- Completed
- Cancelled
- Failed
- Inconclusive

Outcome is a separate dimension from execution status. A completed run can still be inconclusive.

---

# 9. Screen 4 — Scenarios

## 9.1 Purpose
Help the user select realistic, controlled attack cases while communicating exactly what each scenario tests.

## 9.2 Scenario categories
The UI should support the problem statement's security surface, subject to what the current engine actually implements:
- Instruction / system-prompt weakness
- Indirect prompt injection through retrieved content
- Memory poisoning or persistent memory influence
- Tool permissions / excessive agency
- Multi-step execution and cross-tool action chains
- Sensitive data exposure
- Unauthorized external action
- Defense bypass / adaptive mutation
- Benign utility tasks for regression checks

Do not label a category “supported” until a scenario implementation exists and passes acceptance tests.

## 9.3 Scenario card
Each card contains:
- Name
- Attack vector
- Short objective
- Risk/severity classification and its rubric
- Target capabilities required
- Number of steps/attempt budget if known
- Whether it is adaptive or fixed
- Required tools/data stores
- Expected side-effect oracle
- Defense compatibility
- Status: Ready, Needs configuration, Experimental, or Unavailable

## 9.4 Scenario detail
- Threat model
- Preconditions
- Attack objective
- Attack path overview
- Expected observable events
- Success oracle definition
- What constitutes a failed/blocked attempt
- Benign task(s) paired with the scenario
- Safety boundary and reset behavior
- Prior run history

Keep attack payloads and sensitive synthetic data behind an explicit expandable section. Explain the scenario without exposing a dangerous wall of raw text by default.

---

# 10. Screen 5 — Agents

## 10.1 Purpose
Show what target agents and internal red-team/defense/evidence agents exist, their configuration, capabilities, and recent behavior.

## 10.2 Agent directory
Each row/card:
- Pixel avatar
- Name and role
- Adapter/runtime type
- Model/provider if configured and safe to display
- Tool count
- Status: Ready, Running, Offline, Misconfigured
- Last run
- Current state if active
- `Inspect` action

Distinguish product roles (Hunter, Operator, Sentinel, Analyst) from user-configured target agents. Do not imply that all four internal roles are separate LLMs if they are only orchestration roles or UI personas.

## 10.3 Agent detail page
Sections:
1. Overview
2. Instructions / configuration (access-controlled)
3. Tools and permissions
4. Data and memory surfaces
5. Runtime adapter / model mode
6. Recent runs
7. Findings and permission violations
8. Health / integration status

### Tools and permissions
Show each tool's:
- Name and description
- Read/write/external-side-effect classification
- Allowed resources / recipient constraints / scope
- Policy rule IDs
- Last use
- Whether it was called, blocked, or never exercised in tested runs

Clearly distinguish declared permissions from observed reachable capabilities. A tool appearing in the UI does not prove the agent used it.

## 10.4 Agent animation in directory
Use tiny idle sprites only. Do not show a character “working” unless an active run is connected. A running agent can have a subtle 2-frame state indicator, with a text status beside it.

---

# 11. Screen 6 — Evidence

## 11.1 Purpose
Turn a suspicious trajectory into a reproducible, reviewable causal account. This is the forensic workspace and a core differentiator.

## 11.2 Default layout
- Header with run selector and event count
- Large causal graph
- Right-side selected-node detail drawer
- Optional bottom event table/timeline
- Graph controls: fit, zoom, reset, layout, show inferred links toggle, export if supported

Avoid overloading the graph with every low-level log line. Use a layered graph:
- High-level path by default
- Expand a node to reveal sub-events
- Filter by source, agent, tool, policy, and outcome
- Search event IDs / tool names / object IDs

## 11.3 Graph node types
- Untrusted source
- Retrieval / memory
- Agent action
- Tool request
- Policy check
- Tool execution/result
- State mutation
- Oracle/verification
- Outcome/finding
- Benign task checkpoint

Each type has a consistent shape/icon plus label. Pixel avatars may be used for agent nodes, but source/tool/policy nodes should use standard icons and restrained surfaces.

## 11.4 Edge semantics
Edges should encode relationship type:
- `caused_by`
- `read_from`
- `derived_from`
- `requested`
- `authorized_by` / `blocked_by`
- `executed_as`
- `mutated_state`
- `verified_by`
- `contradicts` / `correlates_with`

Use solid lines for explicit recorded relationships and dashed lines for inferred/correlated relationships. A legend must explain the difference. Do not imply causation from simple temporal adjacency.

## 11.5 Node details
- Label and type
- Event/object ID
- Timestamp
- Parent/child relationships
- Actor
- Source provenance
- Tool request/response
- Policy rule/decision
- State delta
- Verification result
- Evidence artifact references
- Confidence/uncertainty only if the scoring system defines it

## 11.6 Finding bundle
A finding should contain:
- Title
- Severity and rubric
- Affected target
- Attack vector
- Minimal reproducible trace
- Preconditions
- Exact relevant events
- Expected vs observed behavior
- Oracle result
- Root-cause hypothesis, clearly labeled as hypothesis if not proven
- Recommended mitigation
- Defense validation results
- Benign utility impact
- Confidence/limitations
- Exportable report format if implemented

The UI must distinguish “observed evidence” from “analyst interpretation.” An LLM-generated explanation is not a substitute for recorded evidence.

---

# 12. Screen 7 — Defense Lab

## 12.1 Purpose
Test whether a defense stops attacks **and** preserves legitimate functionality. This screen maps directly to defense validation and regression requirements.

## 12.2 Layout
- Header with target and defense profile
- Baseline vs defended selector
- Attack results panel
- Benign utility results panel
- Selected run detail
- Clear comparison summary

Use a side-by-side comparison on desktop; stacked comparison on mobile. Keep the same scenario, target configuration, and budget across paired runs where possible.

## 12.3 Comparison dimensions
- Attack success rate (include numerator/denominator)
- Verified unauthorized side effects
- Block rate
- False-positive / over-refusal rate on benign tasks
- Benign task success
- Tool call latency if measured
- Run failures / inconclusive trials
- New vulnerabilities discovered during adaptive re-attack, if implemented

Do not collapse all outcomes into one opaque “security score.” If a composite score is added, document the formula and always expose its component metrics.

## 12.4 Baseline / defended panels
Each panel shows:
- Defense configuration and version
- Run mode
- Scenario set
- Attempts completed
- Verified exploit outcomes
- Benign utility outcome
- Evidence links

A green defended panel is justified only if evidence verifies the block and the utility suite has been tested. A blocked attack alone does not prove no side effect unless the state oracle checks it.

## 12.5 Actions
- Run baseline
- Apply/select defense
- Run defended test
- Re-run adaptive search if supported
- Replay known exploit
- Compare event traces
- Export comparison

Make it obvious whether `Replay` replays stored events or re-executes the attack against the new defense.

## 12.6 Defense states
- Not configured
- Configured, not tested
- Tested against fixed suite
- Tested against adaptive attack
- Security passed with utility checked
- Security passed but utility regression detected
- Vulnerable / bypass found
- Inconclusive

---

# 13. Screen 8 — Reports

## 13.1 Purpose
Produce an evidence-backed summary for engineering teams and judges.

## 13.2 Report list
- Report title
- Date
- Target
- Run/scenario set
- Final status
- Verified findings count
- Export format
- Open/download action if implemented

## 13.3 Report detail
1. Executive summary
2. Scope and environment
3. Methodology and execution mode
4. Scenario/attack vector coverage
5. Verified findings
6. Reproducible attack traces
7. Tool/permission audit
8. Defense validation
9. Benign utility/regression results
10. Limitations and inconclusive tests
11. Run IDs and evidence references

Reports must disclose deterministic/fallback execution and fixture data. Avoid language like “the model was fully secured” from a limited scenario run.

---

# 14. Screen 9 — Event details (shared drawer)

The event detail drawer is reused in Live Lab, Evidence, Assessments, and Defense Lab. It must have one consistent layout and interaction model.

## 14.1 Header
- Event-type icon
- Event title
- Status badge
- Timestamp
- Event ID (copyable)
- Previous / next event controls
- Close button

## 14.2 Summary block
A one- or two-sentence description generated from structured event fields, not guessed from a model. If the summary is AI-generated, label it as such and retain access to the source event.

## 14.3 Tabs
- Details
- Payload
- Policy
- Result / State
- Evidence
- Raw Event

Responsive screens may collapse tabs into a select/menu but must preserve all information.

## 14.4 Copy/export behavior
- Copy event ID
- Copy redacted payload
- Copy raw event only if authorized
- Export trace bundle only if backend supports it
- Show toast only after copy action succeeds if host/browser feedback exists

## 14.5 Sensitive values
- Default to masked secrets and synthetic personal records
- Never render untrusted content as HTML
- Mark data as synthetic, redacted, or real according to actual source metadata
- Avoid exposing real customer data in demo screenshots or reports

---

# 15. Data and event contract: making UI truthful

## 15.1 Single source of truth

The UI should consume a normalized event model. Do not build one independent source for the world animation, another for the timeline, and another for the evidence graph. All three must derive from the same event records and relationship identifiers.

Recommended conceptual event fields:
- `event_id`
- `run_id`
- `sequence`
- `timestamp`
- `event_type`
- `actor_id`
- `source_id` (optional)
- `target_id` (optional)
- `tool_name` (optional)
- `parent_event_ids` or explicit relationship records
- `status`
- `payload_ref` / redacted payload
- `policy_decision` (optional)
- `state_delta_ref` (optional)
- `verification_ref` (optional)
- `execution_mode`
- `is_fixture` / provenance metadata

This is a UI adapter recommendation, not a mandate to rename the backend's existing fields. Map current API fields to this shape in one module.

## 15.2 One event, multiple views

For every event:
- Live Lab: animate/highlight related entities
- Timeline: add chronological event row
- Evidence: add graph node and explicit edges where available
- Event drawer: show exact details
- Metrics: update only when the event changes a defined metric or run outcome

Selecting an event from any view must select it everywhere else. Use stable event IDs, not array index or display text.

## 15.3 State verification

A tool call has distinct lifecycle states:
1. Requested
2. Policy evaluated
3. Blocked **or** allowed
4. Executed (only if allowed and the tool actually ran)
5. Result received (if available)
6. State verified (if verifier ran)

Do not merge `requested`, `allowed`, `executed`, and `verified` into a single green checkmark.

A `BLOCKED` result means the policy prevented execution; a `VERIFIED NO SIDE EFFECT` result means a state check confirmed the relevant state did not change. They are different claims and should be displayed separately.

For a successful exploit, the UI should show:
- The attempted action
- Actual execution result
- Observed side-effect delta
- Independent oracle/verifier evidence
- Which invariant was violated

If the verifier did not run, show `Not verified`. If it errored, show `Verification failed` or `Unknown`, not `Safe`.

## 15.4 Metric definitions

Every metric shown in UI must have a defined formula and denominator. Examples:
- **Attack success rate:** verified successful exploits / completed attack attempts
- **Verified block rate:** blocked attempts with independent no-side-effect verification / applicable attack attempts
- **Benign task success:** successful legitimate tasks / completed benign tasks
- **Defense regression:** baseline-benign-success minus defended-benign-success, using comparable tasks
- **Inconclusive rate:** inconclusive completed attempts / completed attempts

Do not mix failed infrastructure runs with failed attacks. Show run failures separately. If the app currently uses a different metric definition, document it in the UI tooltip and use the implementation's actual formula.

## 15.5 Live vs replay vs fixtures

All pages should preserve execution provenance:
- Live model run: show provider/mode based on actual provider response metadata
- Deterministic fallback: clearly identify deterministic behavior
- Replay: show original run ID and that no new tool side effects are being executed
- Fixture: label demo/example data persistently
- Cached result: show that it is cached if freshness matters

Do not animate stored replay events as if a new attack is currently happening without a `Replay` label.

---

# 16. Problem-statement traceability matrix

The official CRCE problem statement defines the platform as an autonomous AI security testing platform that probes agent instructions, memory, retrieved content, tool permissions, and multi-step execution; produces reproducible traces; demonstrates vulnerabilities in a controlled sandbox; and checks defenses without breaking legitimate functionality.

The following matrix maps the seven official key features to screens and visible evidence.

| Official feature | UI location | What the user must be able to see/do | Evidence required; UI must not fake |
|---|---|---|---|
| **A. Autonomous Attack Discovery** | Scenarios, Live Lab, Assessments | Start adaptive testing, see attack variants/attempts, understand what changed between attempts, inspect stopping criteria and budget | Actual attack-generation/selection events and attempt records; fixed scenarios must be labeled fixed, not adaptive |
| **B. Multi-Stage Attack Analysis** | Live Lab, Evidence, Event Details | Follow malicious input through retrieval/memory, agent decisions, tool requests, and outcome; inspect the chain | Recorded events plus explicit parent/causal relationships; inferred edges are visually distinct |
| **C. Tool and Permission Auditing** | Agents, Event Details, Evidence, Defense Lab | Inspect declared tool permissions and actual calls; see policy decisions, unauthorized reachability, recipient/resource constraints | Actual tool registry/config, policy evaluations, calls and side-effect state; do not infer permission from an icon |
| **D. Reproducible Attack Traces** | Assessments, Evidence, Reports, Live Lab | Open a run, inspect ordered events and payloads, replay stored traces, export a trace bundle if supported | Stable run/event IDs, recorded inputs/configuration, tool arguments/results, environment reset/state, execution mode |
| **E. Defense Validation** | Defense Lab, Live Lab, Assessments | Compare baseline and defended outcomes; replay known attacks and re-run adaptive search when available | Comparable test setup, verified side effects, defense version, attack attempts and outcomes |
| **F. Security Evaluation Dashboard** | Home, Assessments, Live Lab, Reports | View attack paths, severity, exploit success rates, defense effectiveness, and underlying denominators | Metric formulas, counts, source run IDs, verification state, filters; no hardcoded KPI values |
| **G. Regression Testing** | Defense Lab, Assessments, Reports | Run security tests plus legitimate tasks after a defense change; identify new vulnerabilities and over-refusal | Paired attack and benign-task results; comparable task set/configuration; regressions linked to exact runs |

## 16.1 Cross-cutting problem requirements

| Requirement in problem statement | UI implication |
|---|---|
| Instructions | Scenario and evidence views show which instruction/source was involved, with provenance |
| Memory | Agent detail lists memory surfaces; evidence shows reads/writes and poisoning influence only when instrumented |
| Retrieved content | Source cards show origin, trust label, retrieval event, and any recorded downstream relationships |
| Tool permissions | Tool registry and event drawer expose requested action, policy rule, decision, and actual execution state |
| Multi-step execution | Timeline and graph preserve ordering and parent/child links across multiple steps |
| Controlled sandbox | Persistent environment badge, reset status, synthetic data label, and safe-stop controls |
| Reproducibility | Run configuration and stable trace identifiers remain available after completion |
| Defense does not break legitimate functionality | Defense Lab pairs attack results with benign task results and exposes over-refusal |
| Autonomous testing | Show actual generated variants/selection and budget; never label a pre-scripted replay “autonomous discovery” |

## 16.2 Claims the interface must avoid

- “Autonomous” if the run simply iterates through a fixed list without adaptive selection.
- “Exploit succeeded” if the only evidence is a model response claiming success.
- “No data leaked” if no independent state/outbound-effect check ran.
- “Defense effective” based only on replay of a known trace if adaptive re-attack is not tested.
- “Regression-free” if legitimate tasks were not tested.
- “Live model” if a deterministic fallback produced the output.
- “Real-world target” when the environment is a controlled mock/synthetic sandbox.

---

# 17. Core interactions and user flows

## 17.1 First-time assessment
1. User selects `Start assessment`.
2. Selects a configured target.
3. Selects a scenario and reviews its objective.
4. Chooses execution mode and defense profile.
5. Reviews sandbox boundary, budget, and tool scope.
6. Starts the run.
7. Live Lab displays real run status and events.
8. User selects a key event to inspect details.
9. Run finishes and outcome is determined by verifier.
10. User opens Evidence and optionally Defense Lab.

## 17.2 Follow the breach
1. A source node becomes active after a source/retrieval event.
2. User clicks it and inspects its provenance and trust label.
3. The timeline selects downstream events related by recorded trace relationships.
4. The target agent moves to the next anchored entity only when a corresponding event arrives.
5. A tool request appears with exact arguments.
6. Policy evaluation is shown as a separate stage.
7. If blocked, the path stops at the policy boundary.
8. If executed, the actual tool result and state delta are shown.
9. Analyst moves to the relevant evidence node when verification begins.
10. Final status reflects the verifier result, including unknown/inconclusive states.

## 17.3 Investigate a finding
1. Open finding from Home, Assessments, or Reports.
2. Evidence graph focuses the minimal relevant path.
3. User expands source/tool/policy nodes as needed.
4. Event details expose payload, policy, and state evidence.
5. User copies or exports the trace if supported.
6. The report clearly separates observed facts from inferred root cause.

## 17.4 Validate a defense
1. Select a baseline run or scenario set.
2. Choose a defense configuration.
3. Confirm comparable target, scenario, and budget.
4. Run the defended suite.
5. View security outcomes and benign utility side by side.
6. Re-run adaptive attack discovery if supported.
7. Inspect changed paths and newly discovered vulnerabilities.
8. Save comparison/report.

---

# 18. Interaction patterns, feedback, and microcopy

## 18.1 Buttons
- One primary action per main section
- Primary: dark ink background with white text or a clearly legible sage emphasis; use consistently
- Destructive: danger text/background and confirmation
- Secondary: outline or neutral surface
- Icon-only controls require tooltips and accessible labels

## 18.2 Toasts
Use toasts for small confirmations:
- `Run started`
- `Trace copied`
- `Defense configuration saved`
- `Replay started`

Do not use a toast as the only record of a security decision. Important outcomes must remain visible in the event and report.

## 18.3 Empty states
Each empty state should explain:
1. What is missing
2. Why it matters
3. The next action

Examples:
- `No runs yet` → `Start an assessment to create the first trace.`
- `No verified findings` → clarify whether tests found none or no verification was performed.
- `No event details available` → `This event does not include a payload or policy result.`
- `Agent offline` → show last successful health check and retry/setup action.

## 18.4 Error states
- Network/API error: show retry and preserve user selection
- Model provider error: show provider failure and whether deterministic fallback was used
- Tool error: record it as a tool error, not a successful defense
- Verifier error: mark outcome unknown/inconclusive
- Event stream gap: show a gap marker and attempt recovery; do not silently invent missing events
- Run cancelled: show last completed event and cancellation status

## 18.5 Confirmation dialogs
Require confirmation for:
- Stopping an active run
- Clearing/resetting sandbox state
- Removing an agent/tool configuration
- Exporting unredacted payloads if allowed
- Applying a defense that changes target behavior

The dialog must describe the consequence, not just ask “Are you sure?”

---

# 19. Responsive layout

## 19.1 Breakpoints (guideline)
- Small: under 640 px
- Medium: 640–1023 px
- Large: 1024–1439 px
- XL: 1440 px and above

Use the project's established breakpoints if present; do not create conflicting breakpoint systems.

## 19.2 Desktop
- Expanded sidebar
- World and detail panel side by side
- Evidence graph and event drawer side by side
- Dense tables with horizontal scrolling only as a last resort

## 19.3 Tablet
- Collapsible sidebar
- World occupies full width; event panel becomes a drawer
- Timeline remains below world
- Evidence drawer overlays or moves below graph

## 19.4 Mobile
- Compact top bar with navigation menu
- Single-column page layout
- World canvas uses a controlled pan/zoom viewport with accessible list alternative
- Details open as a full-screen sheet
- Timeline becomes a vertical list
- Tables become labeled cards or allow deliberate horizontal scrolling with sticky row labels
- All critical actions remain visible; do not rely on hover

The spatial World may be less convenient on a narrow screen, but all events, status, and evidence must still be usable.

---

# 20. Accessibility and input behavior

- Keyboard access for all navigation, nodes, graph controls, tabs, dialogs, and drawers
- Visible focus ring using `--border-strong` or a dedicated accessible focus token
- Do not encode state using color alone
- Meaningful alt text for agent sprites when they convey role/state; decorative terrain is hidden from screen readers
- Accessible names for icon-only buttons
- Escape closes modal/drawer when safe; unsaved changes prompt if needed
- Focus is returned to the element that opened a modal
- Reduced motion disables travel animations and continuous bobbing
- Do not automatically scroll the event panel so aggressively that users cannot inspect earlier events; provide an explicit Auto-follow toggle
- Live regions announce major state changes, not every animation frame
- Use semantic headings in page order
- Ensure code/payload tabs can be navigated and copied with keyboard

---

# 21. Frontend architecture recommendations

These are implementation recommendations; align them with the existing repository rather than replacing the stack unnecessarily.

## 21.1 Shared components
- `AppShell`
- `SidebarNavigation`
- `PageHeader`
- `ExecutionModeBadge`
- `RunStatusBadge`
- `AgentSprite`
- `AgentStatusLabel`
- `WorldCanvas`
- `WorldNode`
- `WorldEdge`
- `EventTimeline`
- `EventDetailsDrawer`
- `PayloadViewer`
- `PolicyDecisionPanel`
- `VerificationResult`
- `EvidenceGraph`
- `FindingSummary`
- `MetricWithDefinition`
- `EmptyState`
- `ErrorState`
- `ConfirmDialog`
- `ReducedMotionSettings`

## 21.2 Shared domain types
Create a single presentation adapter for:
- Run
- Scenario
- Agent
- Tool
- Event
- Event relationship
- Finding
- Policy decision
- State delta
- Verification result
- Metric result
- Execution provenance

Do not duplicate API-specific conversion logic across pages.

## 21.3 State management
Separate:
- **Server state:** runs, events, findings, scenarios, agents, policy results
- **UI state:** selected event, active tab, selected node, graph zoom, filters, drawer state
- **Playback state:** live/replay, playhead, playback speed, auto-follow
- **Run-control state:** running/paused/cancelled as confirmed by backend

The UI must not use local animation state to overwrite server run state.

## 21.4 Event handling
- Use the existing backend stream/polling API where available.
- Deduplicate by stable event ID.
- Order by explicit sequence number where available; timestamp is a fallback, not always a unique ordering key.
- Detect sequence gaps and surface them.
- Reconcile reconnects by fetching missed events.
- Keep event history available after the run completes.
- Do not create an event in the frontend solely to make an animation look continuous.

## 21.5 Performance
- Keep sprite animations lightweight.
- Use canvas/SVG/DOM according to current stack and graph complexity; avoid introducing a large rendering dependency without need.
- Pause decorative animations when the tab is hidden or reduced motion is active.
- Virtualize long event lists where necessary.
- Avoid rerendering the whole World on every timeline update; update only affected nodes/edges.
- Keep pixel assets crisp at integer scale factors.

---

# 22. Motion and animation implementation contract

## 22.1 Separate visual animation from execution truth

The execution backend emits facts. A UI event adapter translates those facts into visual actions. A motion controller animates between stable world positions. The motion controller must not decide what happened.

Pipeline:
1. Receive backend event.
2. Validate/normalize event.
3. Append event to the run store.
4. Update selected/current entities.
5. Create a visual transition instruction from event type.
6. Animate the relevant sprite/path.
7. Timeline and Evidence update from the same event record.
8. Verification event updates the final outcome.

## 22.2 Animation queue
- Queue transitions by event sequence
- Coalesce repeated low-priority status updates if needed
- Never coalesce away a security-relevant event
- On a burst of events, timeline should remain complete even if animation skips intermediate visual frames
- If a user scrubs the timeline, the world shows that event's state; it should not continue live-following unless auto-follow is enabled

## 22.3 Replay
Replay reads stored events and advances a playhead. It does not call tools or mutate the sandbox. UI should show:
- `Replay`
- Original run ID
- Playback speed
- Play/pause
- Step forward/back
- Jump to event
- Return to live view only when a separate live run exists

## 22.4 Visual truth safeguards
- Never show the email icon flying to an external recipient after a blocked call.
- Never show a database changing unless a state delta says it changed.
- Never show a green shield before policy/verifier results exist.
- Never show Analyst “verified” before verification event.
- If causal relationship is unknown, use a dashed neutral connector with `Relationship inferred` label or omit it.
- If the model provider fails and deterministic fallback starts, update the mode badge immediately.

---

# 23. Demo scenario mapping

The primary demo may use a synthetic support-agent scenario with indirect prompt injection via a retrieved document and an attempted unauthorized email action, **only if that scenario matches the implementation and sandbox contracts**.

## 23.1 Example entities
- Untrusted document: `Q3_Customer_Guide.pdf` (synthetic fixture)
- Target agent: `Support Agent`
- Read tool: `read_ticket` or actual configured retrieval tool
- Customer lookup tool: `lookup_customer` if configured
- Side-effect tool: `send_email` if configured
- Policy invariant: `INV-001` or the actual policy/invariant identifier
- State oracle: mock outbox or actual isolated side-effect state

Do not hardcode these labels on all scenarios. Render scenario-specific data.

## 23.2 Event sequence illustration
An expected sequence may be:
1. A document is retrieved.
2. Untrusted content is observed by the target.
3. Target requests customer lookup.
4. Tool result is returned.
5. Target requests `send_email` with a recipient outside the allowlist.
6. Policy evaluates the recipient and blocks the request.
7. Independent verifier checks the outbox/state.
8. Run records `blocked` and `no unauthorized side effect verified`.

If the real runtime produces a different sequence, show the actual sequence. Do not inject missing steps into the timeline.

## 23.3 Baseline and defense comparison
- Baseline run may reveal the vulnerability if the configured sandbox allows the unsafe side effect.
- Defended run should enforce the policy at the tool boundary.
- Comparison must use comparable scenario setup and target configuration.
- Show side-effect verification in both cases.
- If baseline exploit does not reproduce, mark it `Not reproduced` rather than changing the result for demo effect.
- If the defense blocks the action but benign email tasks fail, surface the utility regression.

---

# 24. Content language and naming conventions

Prefer clear operational labels:
- `Untrusted source`
- `Tool call requested`
- `Policy evaluated`
- `Blocked by policy`
- `Tool executed`
- `State change observed`
- `Verification passed`
- `Verification inconclusive`
- `Benign task passed`
- `Utility regression detected`

Avoid vague labels:
- `AI magic`
- `Attack neutralized` without evidence
- `100% secure`
- `Threat eliminated` when only one attempt was blocked
- `Thinking...` as a substitute for action status
- `Autonomous` on a fixed replay

Use concise, human-readable descriptions first; expose technical IDs and raw payloads in detail views.

---

# 25. Security and privacy in the UI

- Treat all retrieved content, tool output, model output, and payload strings as untrusted.
- Escape all content rendered from sources and event payloads.
- Do not render untrusted HTML/Markdown with executable capabilities.
- Redact secrets and real personal data by default.
- Mark synthetic data explicitly.
- Restrict access to agent prompts/configuration and raw payloads according to the app's authorization model.
- Avoid placing sensitive payloads in URLs, analytics events, console logs, or error messages.
- Confirm before exporting unredacted data.
- The UI should never make the attacker’s malicious content appear as trusted system instruction.
- Keep provenance visible: source, retrieval time, trust level, and event link.

---

# 26. Acceptance criteria by screen

## Home
- [ ] No hardcoded metrics or fake recent runs.
- [ ] Empty state guides the user to create a first assessment.
- [ ] Run rows link to actual run IDs.
- [ ] Execution mode and verification state are visible.

## Live Lab
- [ ] Agent sprites are crisp and consistent.
- [ ] Agent motion responds to actual events or recorded replay events.
- [ ] Selecting a world node selects its event/details.
- [ ] Timeline and World use the same event store.
- [ ] Tool requested/executed/blocked/verified are distinct states.
- [ ] A blocked action does not animate as executed.
- [ ] Verification status comes from the verifier.
- [ ] Replay is visibly different from live execution.
- [ ] Connection loss stops false live activity.

## Assessments
- [ ] Filters and outcomes derive from stored run data.
- [ ] Mode, status, outcome, and verification are not conflated.
- [ ] New assessment review summarizes exact configuration.
- [ ] Failed infrastructure runs are distinct from failed attacks.

## Scenarios
- [ ] Each scenario describes preconditions, objective, tools, oracle, and safety boundary.
- [ ] Unsupported vectors are not shown as ready.
- [ ] Fixed scenarios and adaptive discovery are labeled distinctly.

## Agents
- [ ] Role vs actual model/agent runtime is clear.
- [ ] Tool permissions show configured and observed capabilities separately.
- [ ] Running status reflects actual run state.
- [ ] Offline state is visible.

## Evidence
- [ ] Explicit causal edges are distinct from inferred edges.
- [ ] Selecting a graph node selects the matching event.
- [ ] Finding includes minimal trace and verification evidence.
- [ ] Observed facts and inferred root cause are separated.

## Defense Lab
- [ ] Baseline and defended runs are comparable.
- [ ] Security outcomes include denominators.
- [ ] Benign utility is measured.
- [ ] Adaptive re-attack is distinguished from replay.
- [ ] Utility regressions are visible even when attacks are blocked.

## Reports
- [ ] Report includes scope, mode, run IDs, findings, defense results, and limitations.
- [ ] Fixture/fallback mode is disclosed.
- [ ] No unsupported “fully secure” claim.

## Global quality
- [ ] Sage Mint palette is applied consistently.
- [ ] Pixel art is an accent, not the entire interface.
- [ ] Keyboard and reduced-motion behavior works.
- [ ] Payloads are safely rendered and redacted.
- [ ] All meaningful status changes have textual labels.
- [ ] UI is usable at desktop, tablet, and mobile widths.

---

# 27. Implementation order

Build the design in this order to minimize rework:

1. **Audit current repository and API contracts.** Confirm routes, schemas, event names, run states, policy and oracle outputs, and current tests.
2. **Design tokens and shell.** Palette, typography, spacing, navigation, badges, buttons, drawers, responsive frame.
3. **Shared event model adapter.** One normalized model for timeline, world, evidence, and detail drawer.
4. **Event Details drawer.** This establishes the payload/policy/verification truth model.
5. **Live Lab static structure.** World nodes, tool/source objects, timeline, right drawer.
6. **Original pixel sprite set.** Four distinct sprites with role palettes and state frames.
7. **Event-driven motion controller.** Map actual events to movement, path transitions, and selection.
8. **Evidence graph.** Use the same event IDs and relationship data.
9. **Assessments and scenarios.**
10. **Agents directory and tool permission view.**
11. **Defense Lab with benign utility comparison.**
12. **Home and reports.**
13. **Responsive/accessibility pass.**
14. **Acceptance tests and demo rehearsal.**

Do not spend time perfecting decorative terrain before the event model and truth semantics are correct. The most important animation is the real causal flow, not a complex 3D scene.

---

# 28. Final design decisions

These decisions should be treated as the default unless the current codebase has a concrete technical constraint:

- **Palette:** Sage Mint / porcelain base with coral Hunter, blue Operator, sage Sentinel, and lilac Analyst.
- **Typography:** editorial serif for main headings; clean sans-serif for UI; monospace for raw payloads.
- **Agents:** original pixel-art sprites inspired by uploaded references, with distinct silhouettes and role accessories.
- **Movement:** agents walk, turn, inspect, approach tools, react to policy, and verify in response to real events; decorative idle animation remains subtle.
- **Layout:** consistent sidebar, spacious main work area, shared event details drawer, one primary action per screen.
- **Live Lab:** the signature experience; World and timeline are synchronized.
- **Evidence:** separate forensic graph with explicit vs inferred relationships.
- **Color semantics:** role identity is stable; danger/success status colors communicate actual event outcomes.
- **Truthfulness:** no fabricated live events, no unsupported success labels, no “verified” without verifier evidence.
- **Problem statement:** every official feature A–G maps to a visible workflow and evidence requirement, with regression testing explicitly including legitimate utility.

---

# 29. One-sentence product test

**Can a judge watch a real or clearly labeled replay of an attack, understand how untrusted content influenced an agent, inspect the attempted tool action and policy decision, verify the actual outcome, and compare the defense without the interface ever pretending something happened that did not?**

If yes, the UI is doing its job.
