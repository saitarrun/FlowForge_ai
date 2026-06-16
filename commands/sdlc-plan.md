---
description: Phase 1 only — Requirements gathering with aggressive grill-me interview. Produces PRD, user stories, acceptance criteria, threat model, and GitHub issues.
argument-hint: <feature-description-or-gh-issue-url>
---

# Phase 1 — Planning & Requirements

**Interactive planning phase** with grill-me interview + 4-agent execution

## Process

### Step 1: Aggressive Grill-Me Interview (INTERACTIVE)

The product-manager agent invokes the `/grill-me` skill to interview you about your project:

**Questions asked (decision tree):**

1. **What problem are you solving?**
   - My take: Start with the user pain point, not the solution
   - Explores: Problem statement, target users, why now?

2. **Who are the users?**
   - My take: Define 2-3 user personas with specific pain points
   - Explores: User segments, roles, priorities

3. **What constraints exist?**
   - My take: Timeline, budget, technical, organizational
   - Explores: Hard deadlines, resource limits, existing tech debt

4. **What are success criteria?**
   - My take: Measurable, time-bound metrics (QUANTS framework)
   - Explores: Quality, attention, toil, time, satisfaction targets

Each question is asked one at a time. You provide answers, and the grill-me interview resolves the full decision tree before proceeding.

**Status**: `grill-complete` gate set when you confirm understanding is shared

### Step 2: Agent Execution (SEQUENTIAL)

Once grill-me completes:

2. **Product Manager** — Defines goals, success metrics, roadmap (informed by grill session)
3. **Business Analyst** — Decomposes into INVEST-compliant user stories with AC
4. **Software Architect** — Selects tech stack, produces ADR
5. **Security Architect** — STRIDE threat modeling, security controls

Each agent waits for its dependencies before spawning.

## Real-Time Monitoring

Dashboard at **http://127.0.0.1:4242** shows:
- ✓ Grill-me interview progress
- ✓ Agent spawn status (4 agents)
- ✓ Artifact generation
- ✓ Phase completion

## Outputs

**After grill-me interview:**
- `.sdlc/01-grill-summary.md` — Interview transcript, customer confirmation

**After agent execution:**
- `.sdlc/01-roadmap.md` — Product vision, QUANTS targets, roadmap
- `.sdlc/01-requirements.md` — User stories (INVEST), data flows
- `.sdlc/01-architecture.md` — Tech stack decision, ADR, component design
- `.sdlc/01-threat-model.md` — STRIDE analysis, security controls
- GitHub issues created for each user story

## Usage

**Option 1: Provide feature description directly**
```bash
/sdlc-plan "add OAuth login to our SaaS product"
```

Then product-manager grill-me interview will start interactively.

**Option 2: Interactive mode**
```bash
/sdlc-plan
```

You'll be asked "What feature or product are you planning?" and then grill-me starts.

**Option 3: From GitHub issue**
```bash
/sdlc-plan https://github.com/org/repo/issues/123
```

Issue description is parsed as initial context, then grill-me refines understanding.

## Example Interview Flow

```
🔥 GRILL-ME INTERVIEW

Q: What problem are you solving?
My take: The core user pain — not the solution. What's broken today?
> [User answers...]

Q: Who are the users?
My take: 2-3 personas with specific pain points. Avoid "everyone."
> [User answers...]

Q: What constraints exist?
My take: Timeline, budget, tech debt. Real world always has constraints.
> [User answers...]

Q: What are success criteria?
My take: QUANTS framework — measurable, time-bound outcomes.
> [User answers...]

✅ Understanding confirmed. Proceeding to agent execution...

▶️  Spawned: product-manager
  ✓ Roadmap synthesized from grill session
✅ Completed: product-manager

▶️  Spawned: business-analyst
  ✓ User stories decomposed (INVEST)
✅ Completed: business-analyst

▶️  Spawned: software-architect
  ✓ ADR produced, tech stack decided
✅ Completed: software-architect

▶️  Spawned: security-architect
  ✓ STRIDE threat model complete
✅ Completed: security-architect

✅ Phase 1 Complete!

Artifacts ready at: .sdlc/run-*/
Review and approve before Phase 2.
```

## How Grill-Me Works

1. **One question at a time** — Deep focus on one decision branch
2. **Recommended answer** — I suggest what I think is right (you can disagree)
3. **Dependency tree** — Only move to dependent questions once blockers cleared
4. **Shared understanding** — Stop when we agree or you signal done
5. **Exploration** — If answer is in code/docs, I read instead of asking

## Blocking Gate

The `grill-complete` gate is **MANDATORY**:
- Product Manager cannot proceed to roadmap until gate is marked
- Business Analyst cannot spawn until product-manager:grill-complete
- Prevents downstream work on unclear requirements

## Phase Gate (Before Phase 2)

Once Phase 1 completes, review these before `/sdlc-design`:

- [ ] Product Manager: Roadmap approved?
- [ ] Business Analyst: User stories approved?
- [ ] Software Architect: Architecture approved?
- [ ] Security Architect: Threat model approved?
- [ ] User: "Yes, understood and ready for Phase 2"

## Troubleshooting

**Q: Grill-me didn't ask about X?**
A: Only dependent questions are asked. If X isn't blocking other decisions, it's skipped.

**Q: Can I change an answer?**
A: Yes — say "actually, let me revise that" and re-answer. Grill-me re-explores if needed.

**Q: How long does this take?**
A: Grill-me: ~5-10 min (4 questions, deep answers)  
   Phase 1 agents: ~5 min (4 sequential agents)  
   Total: ~15 min for complete Phase 1

---

**Status**: Ready for interactive planning with grill-me interview  
**Phase Gates**: Yes (grill-complete, phase approval)  
**Artifact Output**: 5 documents (grill summary + 4 phase artifacts) + GitHub issues  
**Dependencies**: Orchestrator running, grill-me skill available
