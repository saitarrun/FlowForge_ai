# SDLC Workflow Plugin

A multi-agent SDLC orchestration system: 20 agents × 6 phases → planning, design, development, testing, deployment, operations.

## Project

- **Type**: Claude Code plugin
- **Version**: 1.0.0
- **Repo**: github.com/saitarrun/sdlc-workflow

## Repository Map

- `agents/` — 20 role-specific agents (product-manager, frontend-engineer, security-architect, etc.)
- `skills/` — 13 knowledge skills (skill-architecture, skill-testing, skill-code-review, etc.)
- `commands/` — 9 orchestrator commands (/sdlc, /sdlc-plan, /sdlc-dev, /sdlc-test, etc.)
- `scripts/` — CLI, install, uninstall, validation helpers
- `README.md` — User documentation and feature overview
- `AGENT_DEVELOPMENT_GUIDE.md` — How to extend agents/skills/commands
- `AGENT_COLLABORATION.md` — Parallel agent execution and shared context

## Commands

- Install: `npm run install-local` or `make install-local`
- Validate: `make validate`
- Uninstall: `make uninstall`

## Agent Conventions

**Frontmatter required**: `name`, `description`, `tools` (comma-separated), `model` (haiku/sonnet/opus)

**Model tiers**: Haiku (templated), Sonnet (development), Opus (architecture/security decisions)

**Tools**: Include only what the agent uses — Read, Write, Edit, Bash, Glob, Grep, WebFetch

Embed book principles (QUANTS/INVEST/Testing Pyramid, Architecture: ADR/fitness functions, Pragmatic Programmer DRY/ETC, Clean Code naming/SOLID) in agent bodies.

## Skill Conventions

**Structure**: `skills/skill-name/SKILL.md` (no tools, no model — pure knowledge)

**Frontmatter**: `name`, `description`, `version`

**Content**: Methodology, checklists, reference patterns. Load on-demand, not always-on.

## Agent-Skill Auto-Wiring

**All 20 agents are auto-wired to phase-specific skills.** When an agent is invoked:
1. Agent frontmatter declares `skills: [skill-a, skill-b, ...]`
2. Command loads all phase skills into agent context (pure methodology, not tools)
3. Agent system prompt says: "You have access to these skills: X, Y, Z. Apply them."
4. Agent applies skill principles → polished industry-standard outputs

See **AGENT_SKILLS_MANIFEST.md** for complete mapping.

## Extending

**New agent**: 
1. Create agent file with frontmatter `skills: [...]` 
2. See AGENT_DEVELOPMENT_GUIDE.md for anatomy
3. Wire into command or `/sdlc` orchestrator

**New skill**: 
1. Create `skills/skill-name/SKILL.md` with frontmatter + methodology
2. Add to agent `skills:` field where relevant
3. Update AGENT_SKILLS_MANIFEST.md mapping

**New command**: 
1. Edit `/commands/sdlc.md` or create `/commands/sdlc-phase-name.md`
2. Command injects all phase skills before spawning agents

**New phase**: 
1. Add 3–5 agents with `skills:` field 
2. Create phase skill with output standards
3. Create command `/sdlc-phase-name.md`
4. Wire into `/sdlc` orchestrator and AGENT_SKILLS_MANIFEST.md

## Troubleshooting

- **Plugin not loading**: Validate frontmatter (name/description/tools/model required), run `make validate`, restart session
- **Agent not invoked**: Check command references, verify description matches trigger, review tools field
- **Permission prompts**: Add patterns to `~/.claude/settings.local.json` under `permissions.allow`

## References

Read only when relevant:
- `README.md` — Feature overview, usage examples
- `AGENT_DEVELOPMENT_GUIDE.md` — Anatomy, extending, testing
- `AGENT_COLLABORATION.md` — Parallel execution, shared context
- `INSTALLATION.md` — Setup and distribution

---

**Maintained By**: saitarrun  
**Last Updated**: 2026-06-16
