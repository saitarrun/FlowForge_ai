---
description: Create one Linear issue per slice from an existing scope.json. Run standalone to (re)create issues without rerunning the full Plan phase. Falls back to docs/issues.md if Linear MCP is unavailable.
argument-hint: <feature-name>
tools: Read, Write
model: sonnet
---

# /to-issues — Create issues from scope.json slices

Reads `./projects/<feature-name>/scope.json` (and optionally `docs/01-prd.md`) and creates one Linear issue per slice. Updates `scope.json` with `linear_id` on each slice after creation.

## Usage

```
/to-issues "login-page"
/to-issues "reporting-dashboard"
```

The `<feature-name>` must match the directory under `./projects/`.

---

## EXECUTION

### STEP 1: Read artifacts

1. Read `./projects/<feature-name>/scope.json`
2. Read `./projects/<feature-name>/docs/01-prd.md` if it exists (used for issue descriptions)
3. Read `./projects/<feature-name>/grill-summary.md` if it exists (used for acceptance criteria)

If `scope.json` is missing, halt:
```
❌ scope.json not found at ./projects/<feature-name>/scope.json

Run /sdlc-plan or /to-prd first to generate scope.json.
```

If slices already have `linear_id` set, warn the user:
```
⚠️  Some slices already have linear_id set:
  slice-0 → SAI-XX
  slice-1 → SAI-XX

Proceeding will create NEW issues for all slices and overwrite linear_id.
Reply "yes" to continue or "no" to abort.
```

---

### STEP 2: Create issues

**If Linear MCP is available:**

For each slice in `scope.json`:

1. Create a Linear issue with:
   - **Title**: slice `name`
   - **Labels**: `prefactor` (if type = prefactor) or `feature` (if type = feature)
   - **Description** (Markdown):
     ```markdown
     ## Slice: [slice id] — [slice name]

     **Type**: [prefactor | feature]
     **Layers**: [comma-separated layers]

     ## Context

     [Summary from grill-summary.md or 01-prd.md scoped to this slice — what the user should be able to do when this slice is complete]

     ## Acceptance Criteria

     - [ ] [layer: schema] Database schema migrated and seeded
     - [ ] [layer: api] Endpoint(s) implemented and returning correct responses
     - [ ] [layer: ui] UI component(s) implemented matching ux-design.md specs
     - [ ] [layer: tests] Unit + integration tests written with >80% coverage
     - [ ] typecheck passes
     - [ ] slice tests pass

     (Only include rows for layers listed in this slice's layers array)
     ```

2. After all issues are created, rewrite `scope.json` — add `"linear_id": "SAI-XX"` to each slice entry.

Display progress as issues are created:
```
Creating Linear issues...
  ✓ slice-0: Project scaffold + health check → SAI-XX
  ✓ slice-1: User can log in → SAI-XX
  ...
```

**If Linear MCP is unavailable:**

Write `./projects/<feature-name>/docs/issues.md`:

```markdown
# Issues — [Feature Name]

Generated: [date]

| id | name | type | layers | status |
|----|------|------|--------|--------|
| slice-0 | Project scaffold + health check | prefactor | schema, api, tests | todo |
| slice-1 | [name] | feature | [layers] | todo |
```

Rewrite `scope.json` — add `"issue_ref": "docs/issues.md#slice-N"` to each slice entry.

---

### STEP 3: Confirm completion

**Linear mode:**
```
✅ [N] Linear issues created

  slice-0 → SAI-XX (prefactor)
  slice-1 → SAI-XX (feature)
  ...

scope.json updated with linear_id on each slice.

Next: run /sdlc-build <feature-name> to start the Build phase.
```

**Fallback mode:**
```
✅ Issues written to ./projects/<feature-name>/docs/issues.md

Linear MCP was unavailable — issues are tracked locally.
scope.json updated with issue_ref on each slice.

Next: run /sdlc-build <feature-name> to start the Build phase.
```

---

## CRITICAL RULES

✅ One issue per slice — no merging, no splitting
✅ Acceptance criteria rows match the slice's layers array exactly
✅ scope.json is rewritten after issue creation — never left with stale ids
✅ If Linear MCP fails mid-run, write all remaining slices to issues.md fallback
✅ Do not create issues for slices that already have a valid linear_id (unless user confirms overwrite)
