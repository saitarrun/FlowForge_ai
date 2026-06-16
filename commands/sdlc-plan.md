---
description: Phase 1 only — Requirements gathering. Produces PRD, user stories, acceptance criteria, threat model, and GitHub issues.
argument-hint: <feature-description-or-gh-issue-url>
---

# Phase 1 — Planning & Requirements

**Spawns agents in sequence**: product-manager → business-analyst → software-architect → security-architect

Dashboard automatically starts and displays all agents in real-time at http://127.0.0.1:4242

## Process

1. **Product Manager** — Grill interview + roadmap definition
2. **Business Analyst** — INVEST user stories with acceptance criteria
3. **Software Architect** — Tech stack selection and ADR
4. **Security Architect** — STRIDE threat modeling and security controls

## Outputs

- `.sdlc/01-roadmap.md` — Product vision, QUANTS targets, roadmap
- `.sdlc/01-requirements.md` — User stories (INVEST), data flows
- `.sdlc/01-architecture.md` — Tech stack decision, ADR, component design
- `.sdlc/01-threat-model.md` — STRIDE analysis, security controls
- GitHub issues created for each user story

## Usage

```bash
/sdlc-plan "add OAuth login to our SaaS product"
/sdlc-plan https://github.com/org/repo/issues/123
```

---

# Implementation

This command orchestrates Phase 1 agents with dependency management and real-time monitoring.

## Agent Execution Flow

```
User provides feature description
        ↓
Initialize orchestrator & run directory
        ↓
Spawn: product-manager (entry point)
  ├─ Grill customer aggressively
  ├─ Define vision + roadmap
  └─ Mark grill-complete gate
        ↓
Spawn: business-analyst (depends on product-manager:grill-complete)
  ├─ Create INVEST user stories
  ├─ Define acceptance criteria
  └─ Create GitHub issues
        ↓
Spawn: software-architect (depends on business-analyst)
  ├─ Select technology stack
  ├─ Produce ADR document
  └─ Design system architecture
        ↓
Spawn: security-architect (depends on software-architect)
  ├─ Perform STRIDE analysis
  ├─ Identify threats & controls
  └─ Define security requirements
        ↓
Phase 1 Complete ✓
        ↓
Display dashboard at http://127.0.0.1:4242
Display approval gate for Phase 2
```

## Real-Time Monitoring

The dashboard automatically shows:
- ✓ All 4 Phase 1 agents
- ✓ Current status (waiting → working → complete)
- ✓ Duration per agent
- ✓ Live metrics (queued, running, completed)
- ✓ Dependency resolution
- ✓ Artifact generation progress

## Phase Gate

**Before proceeding to Phase 2 (Design)**:
- [ ] Product Manager: Roadmap approved
- [ ] Business Analyst: User stories approved
- [ ] Software Architect: Architecture approved
- [ ] Security Architect: Threat model approved
- [ ] User confirmation: All planning artifacts reviewed

Once approved, `/sdlc-design` will spawn Phase 2 agents.

## Failure Handling

If any agent blocks:
- ✗ Dependent agents will not spawn
- ✗ Phase gate will show blocker
- Dashboard will highlight failure point
- Review logs at `.sdlc/run-*/collaboration-log.json`

## Notes

- Agents are spawned sequentially to respect dependencies
- Parallel execution is possible within the same phase
- Each agent writes artifacts to `.sdlc/run-*/`
- Shared context enables knowledge transfer between agents
- Real-time SSE updates push status to dashboard every second

---

**Status**: Ready for Phase 1 execution
**Phase Gates**: Yes (grill-complete, phase approval)
**Artifact Output**: 4 documents + GitHub issues
**Dependencies**: Orchestrator running on port 4242
