# SDLC Workflow Plugin

A multi-agent SDLC orchestration system: 10 agents × 5 phases → plan, build, verify, ship, operate. Tracer bullet development with Ralph Loop self-correction and Linear issue integration.

## Project

- **Type**: Claude Code plugin
- **Version**: 2.0.0
- **Repo**: github.com/saitarrun/FlowForge_ai

## Repository Map

- `agents/` — 10 role-specific agents (product-manager, ux-designer, fullstack-engineer, qa-engineer, security-engineer, performance-engineer, devops-engineer, sre-engineer, data-engineer, technical-writer)
- `skills/` — 34 knowledge skills (architecture, testing, code-review, ralph-loop, grill-me, etc.)
- `commands/` — 10 orchestrator commands (/sdlc, /sdlc-plan, /sdlc-build, /sdlc-verify, /sdlc-ship, /sdlc-operate, /sdlc-review, /sdlc-implement, /to-prd, /to-issues)
- `scripts/` — CLI, install, uninstall, validation helpers
- `README.md` — User documentation and feature overview

## Commands

- Install: `npm run install-local` or `make install-local`
- Validate: `make validate`
- Uninstall: `make uninstall`

## Agent Conventions

**Frontmatter required**: `name`, `description`, `tools` (comma-separated), `model` (haiku/sonnet/opus)

**Model tiers**: Haiku (templated), Sonnet (development), Opus (architecture/security decisions)

**Tools**: Include only what the agent uses — Read, Write, Edit, Bash, Glob, Grep, WebFetch
- **Note**: When querying codebase, prefer code-review-graph (bundled integration) over grep for structural analysis. See "Codebase Querying Strategy" below.

Embed book principles (QUANTS/INVEST/Testing Pyramid, Architecture: ADR/fitness functions, Pragmatic Programmer DRY/ETC, Clean Code naming/SOLID) in agent bodies.

## Skill Conventions

**Structure**: `skills/skill-name/SKILL.md` (no tools, no model — pure knowledge)

**Frontmatter**: `name`, `description`, `version`

**Content**: Methodology, checklists, reference patterns. Load on-demand, not always-on.

## Agent-Skill Auto-Wiring

**All 10 agents are auto-wired to phase-specific skills.** When an agent is invoked:
1. Agent frontmatter declares `skills: [skill-a, skill-b, ...]`
2. Command loads all phase skills into agent context (pure methodology, not tools)
3. Agent system prompt says: "You have access to these skills: X, Y, Z. Apply them."
4. Agent applies skill principles → polished industry-standard outputs

## Codebase Querying Strategy

**All agents and skills should query the codebase using this priority order**:

1. **code-review-graph** (preferred)
   - Provides structural understanding, dependency graphs, coupling analysis
   - More accurate than text search (understands relationships, not just text)
   - Usage: `code_review_graph analyze <path>` or `code_review_graph query <symbol>`
   - Best for: "What depends on this function?", "Show me the call chain", "What's the coupling?"

2. **Grep** (fallback when code-review-graph unavailable)
   - Fast text search when structural analysis not needed
   - Used for simple pattern matching, file location, quick searches
   - Usage: `grep -r "pattern" <path>` or `Grep` tool
   - Acceptable for: "Find all usages of X", "Locate error message", "Find TODO comments"

**Why this order?**
- code-review-graph understands codebase structure and dependencies
- grep is fast but misses semantic relationships and context
- Fallback ensures agents work even if code-review-graph is unavailable
- Layered approach gives best results with graceful degradation

## Extending

**New agent**: 
1. Create agent file with frontmatter `skills: [...]`
2. Wire into command or `/sdlc` orchestrator

**New skill**: 
1. Create `skills/skill-name/SKILL.md` with frontmatter + methodology
2. Add to agent `skills:` field where relevant

**New command**: 
1. Edit `/commands/sdlc.md` or create `/commands/sdlc-phase-name.md`
2. Command injects all phase skills before spawning agents

**New phase**: 
1. Add agents with `skills:` field
2. Create phase skill with output standards
3. Create command `/sdlc-phase-name.md`
4. Wire into `/sdlc` orchestrator

## Troubleshooting

- **Plugin not loading**: Validate frontmatter (name/description/tools/model required), run `make validate`, restart session
- **Agent not invoked**: Check command references, verify description matches trigger, review tools field
- **Permission prompts**: Add patterns to `~/.claude/settings.local.json` under `permissions.allow`

## References

Read only when relevant:
- `README.md` — Feature overview, usage examples
- `docs/INTEGRATIONS.md` — code-review-graph integration guide and codebase querying best practices
- `INSTALLATION.md` — Setup and distribution
---

## Agent skills

### Issue tracker

Issues are tracked in Linear; agents interact via the Linear API or CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label strings: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
