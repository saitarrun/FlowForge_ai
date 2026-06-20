# Issue Tracker

Issues for this repo are tracked in **Linear**.

## How skills interact with Linear

- Skills that create issues (e.g. `to-issues`, `qa`) should use the Linear API or the `linear` CLI to create issues in the appropriate team/project.
- Skills that read issues (e.g. `triage`, `to-prd`) should query Linear for the relevant issue list rather than reading local files.
- When referencing an issue, use Linear's issue identifier format (e.g. `ENG-123`).

## Notes

- There is no GitHub/GitLab PR triage surface — all work intake happens through Linear.
- If the Linear CLI (`linear`) is unavailable, fall back to the Linear REST API or MCP integration if present in the session.
