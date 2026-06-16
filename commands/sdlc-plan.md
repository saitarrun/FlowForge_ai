---
description: Phase 1 only — Requirements gathering. Produces PRD, user stories, acceptance criteria, threat model, and GitHub issues.
argument-hint: <feature-description-or-gh-issue-url>
---

# Phase 1 — Planning & Requirements

Spawns agents: product-manager → business-analyst → software-architect → security-architect

**Dashboard**: Automatically starts orchestrator and opens dashboard. All agents report status in real-time.

Outputs:
- `.sdlc/01-roadmap.md` — Product vision, QUANTS targets, roadmap
- `.sdlc/01-requirements.md` — User stories (INVEST), data flows
- `.sdlc/01-architecture.md` — Tech stack decision, ADR, component design
- `.sdlc/01-threat-model.md` — STRIDE analysis, security controls
- GitHub issues created for each user story

## Process

### MANDATORY FIRST: Aggressive Grill-Me Interview (BLOCKING GATE)

1. **Product Manager — GRILL PHASE (BLOCKING)**:
   - **Invoke `/grill-me` skill FIRST** — Do NOT skip this step
   - Relentlessly interview customer about their product/feature
   - Walk the complete decision tree aggressively:
     * What problem are they solving? (challenge every answer)
     * Who are the users? (personas, pain points, priorities)
     * What constraints exist? (timeline, budget, technical, organizational)
     * What are success criteria? (measurable, time-bound)
     * What are hidden assumptions? (test each one)
   - **Continue until FULLY SATISFIED** — Shared understanding reached
   - **GATE: MUST CONFIRM** "Product vision is clear and assumptions validated before proceeding"
   - If customer is unclear on any point, keep drilling until clarity achieved

### Then Proceed to Planning

2. Product Manager: Define goals, success metrics, roadmap (informed by aggressive grill session)
3. Business Analyst: Decompose into INVEST-compliant user stories with AC
4. Software Architect: Select tech stack, produce ADR
5. Security Architect: Threat model (STRIDE), security requirements
6. **GATE**: User approves all artifacts before proceeding to Phase 2

## Blocking Gate Behavior

**The grill-me phase is MANDATORY and BLOCKING.** The process will NOT proceed to business-analyst until:
1. Product manager completes all four grill phases (Problem, Users, Constraints, Success)
2. Customer confirms understanding is shared (explicit sign-off)
3. `.sdlc/01-grill-summary.md` is written with all four phases documented
4. Product manager marks the `grill-complete` gate in collaboration-log.json

**Business analyst will automatically unlock** once the gate is marked. This prevents downstream work from starting on unclear requirements.

## Artifacts Generated

**Blocking Artifact (Must Complete Before Phase Advances):**
- `.sdlc/01-grill-summary.md` — Complete interview transcript, customer confirmation, all 4 grill phases resolved

**Follow-Up Artifacts (After Grill Gate Passes):**
- `.sdlc/01-roadmap.md` — Product vision, QUANTS targets, roadmap
- `.sdlc/01-requirements.md` — User stories (INVEST), data flows
- `.sdlc/01-architecture.md` — Tech stack decision, ADR, component design
- `.sdlc/01-threat-model.md` — STRIDE analysis, security controls
- GitHub issues created for each user story

## Usage

```bash
/sdlc-plan "add OAuth login to our SaaS product"
/sdlc-plan https://github.com/org/repo/issues/123  # Parse GitHub issue

# Monitor the dashboard at http://127.0.0.1:4242
# Product Manager will start with aggressive grill-me interview
# Downstream agents (Business Analyst, Architect, etc.) will wait for grill gate
```
