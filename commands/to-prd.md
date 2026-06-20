---
description: Synthesize a PRD from an existing grill-summary.md + scope.json. Run standalone when you already have Plan phase artifacts and want to (re)generate the PRD without rerunning the full interview.
argument-hint: <feature-name>
tools: Read, Write
model: sonnet
---

# /to-prd — Synthesize PRD from grill-summary + scope.json

Reads `./projects/<feature-name>/grill-summary.md` and `./projects/<feature-name>/scope.json` and writes `./projects/<feature-name>/docs/01-prd.md`.

## Usage

```
/to-prd "login-page"
/to-prd "reporting-dashboard"
```

The `<feature-name>` must match the directory under `./projects/`.

---

## EXECUTION

### STEP 1: Read artifacts

1. Read `./projects/<feature-name>/grill-summary.md`
2. Read `./projects/<feature-name>/scope.json`

If either file is missing, halt and tell the user:
```
❌ Missing required files:
  - grill-summary.md: [found/not found]
  - scope.json: [found/not found]

Run /sdlc-plan first to generate these files, or provide them manually.
```

---

### STEP 2: Synthesize PRD

Create `./projects/<feature-name>/docs/01-prd.md`:

```markdown
# PRD — [Feature Name]

**Date**: [today's date]
**Status**: Draft

## Problem Statement

[From grill-summary: what problem is being solved, why it matters now, prior attempts, underlying assumption]

## Users & Personas

[From grill-summary: each persona with their role, pain point, current workaround, success metric]

## Constraints

### Timeline
[From grill-summary: target ship date, why that date, realism assessment]

### Budget & Team
[From grill-summary: engineering capacity, estimated effort, trade-offs if over budget]

### Technical Constraints
[From grill-summary: must-integrate systems, prohibited tech, preferred stack]

### Compliance & Security
[From grill-summary: regulatory requirements, security concerns]

## Success Criteria (QUANTS)

| Dimension | Target |
|-----------|--------|
| Quality | [uptime %, error rate, bug tolerance] |
| Attention | [eng time allocation] |
| Toil | [manual work eliminated] |
| Time | [deployment frequency, lead time] |
| Satisfaction | [NPS/CSAT target, adoption %] |

## Capability Flags

| Flag | Value |
|------|-------|
| has_ui | [true/false] |
| has_auth | [true/false] |
| has_mobile | [true/false] |
| needs_pentest | [true/false] |
| has_data_pipeline | [true/false] |
| needs_performance_audit | [true/false] |

## Slices

| ID | Name | Type | Layers |
|----|------|------|--------|
[one row per slice from scope.json]

## Decisions Made

[From grill-summary: key decisions reached during interview]

## Open Questions

[From grill-summary: anything still unresolved]
```

Ensure every section is populated from `grill-summary.md`. Do not invent information not present in the grill answers.

---

### STEP 3: Confirm completion

```
✅ PRD written to ./projects/<feature-name>/docs/01-prd.md

Sections generated:
  ✓ Problem Statement
  ✓ Users & Personas ([N] personas)
  ✓ Constraints (timeline, budget, technical, compliance)
  ✓ Success Criteria (QUANTS)
  ✓ Capability Flags ([N] flags)
  ✓ Slices ([N] slices)

Next: run /to-issues <feature-name> to create Linear issues per slice,
      or /sdlc-plan to run the full Plan phase.
```

---

## CRITICAL RULES

✅ Never fabricate content not present in grill-summary.md
✅ Capability flags must come from scope.json exactly as-is — do not infer
✅ Slice table must match scope.json slices array exactly
✅ docs/ directory is created if it doesn't exist
✅ Existing 01-prd.md is overwritten — no merge, no append
