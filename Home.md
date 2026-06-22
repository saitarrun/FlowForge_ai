# DevForge AI Wiki

> **Transform Ideas into Shipped, Operated Software** — An AI-powered SDLC workflow system for Claude Code with role-specific agents, tracer bullet delivery, and structured feedback loops.

---

## 🚀 Quick Start

### Installation

```bash
# Install from npm
sudo npm install -g devforge-ai

# Install into Claude Code
devforge-ai install

# Restart Claude Code, then try it
/sdlc "build a login page"
```

[**Full Installation Guide**](./Installation) · [Install from Source](./Installation#install-from-source)

---

## 🎯 What Is DevForge AI?

DevForge AI is **not** a one-shot code generator. It's a **delivery workflow** that orchestrates 10 specialized agents across 5 SDLC phases:

1. **Plan** — Product manager breaks down requirements
2. **Build** — Engineers implement thin vertical slices
3. **Verify** — Security and performance checks
4. **Ship** — DevOps builds CI/CD and infrastructure
5. **Operate** — SREs define SLOs and runbooks

Each phase produces **handoff documents** so context survives phase transitions. Each build step uses the **Ralph Loop** — a self-correcting feedback loop that retries when verification fails, then stops at a circuit breaker.

### Why DevForge AI?

| Problem | DevForge Solution |
|---------|-------------------|
| **Agents build the wrong thing** | `/sdlc-plan` runs structured interviews → requirements first |
| **Work gets too big to trust** | Tracer bullet slices → thin vertical cuts through the full stack |
| **Code doesn't work** | Ralph Loop retries with bounded context → self-correction |
| **Process loses context** | Handoff documents at phase gates → survivable decisions |
| **Shipping isn't the end** | Verify, Ship, Operate phases → SLOs and runbooks before release |

[Read the Full Motivation](./Why-DevForge-AI-Exists) →

---

## 📋 How It Works

### The Five Phases

```
/sdlc-plan ──→ /sdlc-build ──→ /sdlc-verify ──→ /sdlc-ship ──→ /sdlc-operate
    ↓               ↓               ↓               ↓               ↓
   PRD          Code & Tests    Security,      Docker,            SLOs,
 Scope.json      Designs       Performance     CI/CD              Runbooks
  Issues      Implementation                Infrastructure      Monitoring
```

Or run the **full pipeline** at once:

```bash
/sdlc "build a login page"
```

### Phase Reference

| Phase | Command | Primary Agents | Key Outputs | Read Next |
|-------|---------|---|---|---|
| **Plan** | `/sdlc-plan` | Product Manager | `scope.json`, PRD, issues | [Planning Guide](./Commands/sdlc-plan) |
| **Build** | `/sdlc-build` | UX Designer, Fullstack Engineer, QA Engineer | Code, tests, `implementation-log.md` | [Build Guide](./Commands/sdlc-build) |
| **Verify** | `/sdlc-verify` | Security Engineer, Performance Engineer | Security report, performance metrics | [Verify Guide](./Commands/sdlc-verify) |
| **Ship** | `/sdlc-ship` | DevOps Engineer | Docker, Kubernetes, Terraform, CI/CD | [Ship Guide](./Commands/sdlc-ship) |
| **Operate** | `/sdlc-operate` | SRE Engineer, Data Engineer | SLOs, runbooks, monitoring, data pipelines | [Operate Guide](./Commands/sdlc-operate) |

### Agents & Roles

DevForge AI includes **10 specialized agents**:

- **Product Manager** — Planning, interviews, scope decomposition
- **UX Designer** — Wireframes, design tokens, interaction specs
- **Fullstack Engineer** — Slice implementation across stack
- **QA Engineer** — E2E and cross-slice testing
- **Security Engineer** — SAST, OWASP, vulnerability scanning
- **Performance Engineer** — Profiling, optimization, budgets
- **DevOps Engineer** — CI/CD, containers, infrastructure
- **SRE Engineer** — SLOs, dashboards, runbooks
- **Data Engineer** — ETL/ELT pipelines, analytics schemas
- **Technical Writer** — Docs, guides, API references

[View All Agents](./Agents) →

---

## 📦 What You Get

Every SDLC run writes into a **project folder** with structured deliverables:

```
./projects/<feature-name>/
├── grill-summary.md              # Interview notes
├── scope.json                    # Slice breakdown + flags
├── docs/
│   ├── 01-prd.md                # Product requirements
│   ├── ux-design.md             # Design specs
│   ├── implementation-log.md     # Slice-by-slice log
│   ├── security-report.md       # Security findings
│   ├── performance-report.md    # Performance data
│   └── 06-slo.md                # SLOs and monitoring
├── handoffs/
│   ├── plan-handoff.md          # Context → Build phase
│   ├── build-handoff.md         # Context → Verify phase
│   ├── verify-handoff.md        # Context → Ship phase
│   └── ship-handoff.md          # Context → Operate phase
└── code/                        # Implementation
```

Each handoff is **bounded context** — no unnecessary history, decisions preserved.

---

## 🔑 Key Concepts

### Tracer Bullet Slices

Instead of building the whole feature at once, DevForge breaks work into **thin vertical slices**:

```json
{
  "slices": [
    {
      "id": "slice-0",
      "name": "Project scaffold + health check",
      "type": "prefactor",
      "layers": ["schema", "api", "tests"]
    },
    {
      "id": "slice-1",
      "name": "User can log in",
      "type": "feature",
      "layers": ["schema", "api", "ui", "tests"]
    }
  ]
}
```

Each slice cuts through **all layers** (schema, API, UI, tests), so every increment is testable.

### The Ralph Loop

DevForge's self-correction pattern:

1. **Implement** one slice
2. **Run** type checks and tests
3. **Retry** with fresh context if verification fails
4. **Stop** at circuit breaker (don't loop silently)
5. **QA** cross-slice after feature slices complete

[Ralph Loop Skill](./Skills/ralph-loop) →

### Handoff-Bounded Context

Long SDLC sessions drown the model in stale history. DevForge uses **handoff documents** at phase gates:

- `plan-handoff.md` → `/sdlc-build`
- `build-handoff.md` → `/sdlc-verify`
- `verify-handoff.md` → `/sdlc-ship`
- `ship-handoff.md` → `/sdlc-operate`

Each phase reads the handoff first, then works with **bounded context**. Decisions survive, unnecessary chat does not.

---

## 📚 Navigation

### Getting Started
- [Installation](./Installation) — npm, source, symlink, uninstall
- [Quickstart](./Quickstart) — First SDLC run
- [Examples](./Examples) — Common feature workflows

### Commands Reference
- [`/sdlc`](./Commands/sdlc) — Full pipeline orchestrator
- [`/sdlc-plan`](./Commands/sdlc-plan) — Planning and requirements
- [`/sdlc-build`](./Commands/sdlc-build) — Implementation
- [`/sdlc-verify`](./Commands/sdlc-verify) — Security & performance
- [`/sdlc-ship`](./Commands/sdlc-ship) — Deployment
- [`/sdlc-operate`](./Commands/sdlc-operate) — Operations
- [`/sdlc-implement`](./Commands/sdlc-implement) — Standalone implementation
- [`/sdlc-review`](./Commands/sdlc-review) — PR review with agents

### Agents & Roles
- [All Agents](./Agents) — 10 specialized roles
- [Agent Architecture](./Agents/Architecture) — How agents coordinate
- [Custom Agents](./Agents/Custom-Agents) — Extend DevForge

### Skills & Disciplines
- [Core Skills](./Skills) — Planning, building, testing
- [Engineering Skills](./Skills/Engineering) — Architecture, design, quality
- [Operations Skills](./Skills/Operations) — Security, deployment, SRE
- [Write Custom Skills](./Skills/write-skill) — Add new disciplines

### Deep Dives
- [Why DevForge AI Exists](./Why-DevForge-AI-Exists) — Problem statement
- [SDLC Phases Explained](./Concepts/SDLC-Phases) — Each phase in detail
- [Scope Decomposition](./Concepts/Scope-Decomposition) — Breaking down features
- [Context Management](./Concepts/Context-Management) — Handoffs and circuit breakers

### Integration & Customization
- [Integrations](./Integrations) — Code review tools, CI/CD, etc.
- [Configuration](./Configuration) — Project setup, environment
- [Troubleshooting](./Troubleshooting) — Common issues
- [FAQ](./FAQ) — Frequent questions

---

## 💡 Common Workflows

### "I have a fuzzy idea"

```bash
/sdlc-plan "add two-factor authentication"
```

Runs the structured interview, produces scope and PRD. Read the requirements before building.

[Planning Guide](./Commands/sdlc-plan) →

### "I have a well-scoped issue"

```bash
/sdlc-implement /path/to/issue
```

Implements the issue with Ralph Loop retries, no planning phase needed.

[Implementation Guide](./Commands/sdlc-implement) →

### "I want the full workflow"

```bash
/sdlc "build a checkout flow"
```

Runs all 5 phases: Plan → Build → Verify → Ship → Operate. Full delivery.

[Full Workflow Guide](./Commands/sdlc) →

### "I need to review a pull request"

```bash
/sdlc-review
```

Runs 4 parallel reviewer agents: security, performance, design, architecture. Get comprehensive feedback.

[PR Review Guide](./Commands/sdlc-review) →

---

## 🛠️ Development

### Validate & Install Locally

```bash
npm run validate              # Check plugin structure
npm run install-local        # Install while developing
npm run install-local --dev  # Install with symlink
```

### Check Package Contents

```bash
npm pack --dry-run
```

### Uninstall

```bash
npm run uninstall
```

[Development Setup](./Development) →

---

## 📖 Built On

DevForge AI combines proven software engineering practices:

- **Tracer Bullet Development** — Thin vertical slices deliver incrementally
- **Red-Green-Refactor** — Test-driven feedback loops
- **Product-First** — Requirements before implementation
- **Security & Performance** — Verification before shipping
- **SLO-Driven Ops** — Observability after release
- **Bounded Context** — Handoff documents survive phase transitions

---

## 🔗 Links

- **NPM Package** — [@saitarrunpitta/devforge-ai](https://www.npmjs.com/package/@saitarrunpitta/devforge-ai)
- **GitHub Repo** — [saitarrun/devforge-ai](https://github.com/saitarrun/devforge-ai)
- **License** — MIT
- **Node.js** — >=18.0.0

---

## 📞 Support & Feedback

- 💬 **Issues & Ideas** — [GitHub Issues](https://github.com/saitarrun/devforge-ai/issues)
- 🐛 **Bug Reports** — [Open an Issue](https://github.com/saitarrun/devforge-ai/issues/new)
- 💡 **Feature Requests** — [Discussions](https://github.com/saitarrun/devforge-ai/discussions)

---

## 🎓 Next Steps

1. **[Install](./Installation)** — Get DevForge AI running
2. **[Quickstart](./Quickstart)** — Run your first SDLC workflow
3. **[Pick a command](./Commands)** — Plan, Build, Verify, Ship, or Operate
4. **[Explore skills](./Skills)** — Learn the disciplines agents use
5. **[Read examples](./Examples)** — See real workflows in action

---

*DevForge AI: From Idea to Operated Software.*
