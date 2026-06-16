# Plugin Integrations

This document outlines integrated tools and plugins bundled with the SDLC Workflow.

## code-review-graph

**Repository**: https://github.com/tirth8205/code-review-graph  
**Status**: Bundled as git submodule in `integrations/code-review-graph/`  
**Access**: Automatically available to all users of this plugin

### What is code-review-graph?

A specialized code review analysis tool that provides:
- Visual dependency and coupling analysis
- Code review pattern detection
- Change impact assessment
- Codebase structure visualization

### How to Use

The code-review-graph is automatically included. Access it via:

```bash
# From the sdlc-workflow directory
cd integrations/code-review-graph

# Or directly reference from plugin
/sdlc-review --with-graph --pr <number>
```

### Integration Points

1. **Code Review Command** (`/sdlc-review`)
   - Automatically includes graph analysis
   - Produces visual coupling reports
   - Ranks review findings by impact

2. **Architecture Phase** (`/sdlc-dev`)
   - Generates architecture dependency graphs
   - Validates coupling constraints
   - Suggests refactoring opportunities

3. **Refactoring Workflows**
   - Safe refactoring analysis
   - Impact assessment before changes
   - Dependency visualization

### Codebase Querying Strategy (Agent & Skill Usage)

**Agents and skills use this priority order for codebase analysis**:

#### 1. code-review-graph (PRIMARY)

Use for structural, dependency-based queries:

```bash
# Understand dependencies and coupling
code_review_graph analyze <path>

# Find related code and call chains
code_review_graph query --symbol <function_name>

# Impact analysis: what breaks if I change this?
code_review_graph impact <file_path>
```

**Best for**:
- "What modules depend on this service?"
- "Show me the call chain for this function"
- "What's the coupling between these components?"
- "Safe refactoring: what will break?"
- "Architecture validation: are there circular dependencies?"

**Advantages**:
- Understands code semantics and relationships
- Provides coupling/cohesion metrics
- Identifies architectural issues (circular deps, tight coupling)
- More accurate than text search

#### 2. grep (FALLBACK)

Use only when code-review-graph is unavailable or for simple text matching:

```bash
# Quick text search
grep -r "pattern" <path>

# Find specific files
grep -l "import.*module" src/

# Locate error messages or TODOs
grep -r "TODO:" .
```

**Best for**:
- "Find all usages of this variable name"
- "Locate a specific error message"
- "What files import this module?"
- "Quick pattern matching"

**Limitations**:
- Text-based only (no semantic understanding)
- Misses dependencies and relationships
- Can have false positives

#### Fallback Logic

Agents should implement this pattern:

```
IF code-review-graph available:
  query = code_review_graph.analyze(codebase)
  return structural analysis
ELSE IF grep available:
  query = grep -r pattern path
  return text search results
ELSE:
  use Read tool on known files
```

### For Plugin Users

No additional installation required. When you install `sdlc-workflow`, code-review-graph comes pre-integrated:

```bash
# One-step install includes both
npm install -g sdlc-workflow
# ✓ SDLC Workflow plugin installed
# ✓ code-review-graph integration enabled
```

### For Contributors

To update the submodule:

```bash
# Fetch latest code-review-graph changes
git submodule update --remote

# Or clone with submodules
git clone https://github.com/saitarrun/sdlc-workflow.git
cd sdlc-workflow
git submodule update --init --recursive
```

---

**Last Updated**: 2026-06-16
