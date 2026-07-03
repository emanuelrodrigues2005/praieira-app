# Triage Labels

The five canonical triage roles, mapped to GitHub labels:

| Role | Label | Description |
|---|---|---|
| Needs evaluation | `needs-triage` | Maintainer needs to evaluate the issue |
| Needs info | `needs-info` | Waiting on reporter for more information |
| Ready for agent | `ready-for-agent` | Fully specified — an AI agent can pick it up with no human context |
| Ready for human | `ready-for-human` | Needs human implementation |
| Won't fix | `wontfix` | Will not be actioned |

These labels use the default names — no custom mapping is configured.

## Lifecycle

```
[new issue]
    │
    ▼
needs-triage ──► needs-info ◄──► ready-for-human
    │                                 │
    │                                 ▼
    └──────────► ready-for-agent ──► (closed)
    │
    └──────────► wontfix ──► (closed)
```
