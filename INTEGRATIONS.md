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
