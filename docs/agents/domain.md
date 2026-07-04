# Domain Documentation

## Layout — Multi-Context

This is a **multi-context** monorepo. Each bounded context lives in its own directory with its own `CONTEXT.md` glossary and `AGENTS.md` agent instructions.

### Index

| Context | Directory | Scope |
|---|---|---|
| Auth & Profile | `service-auth/` | Identity, authentication, roles, personal profile |
| Catalog & Geo | `service-catalog/` | Worker profiles, services, geolocation, search |
| Interaction & Review | `service-reviews/` | Reviews, contact, tourist-worker interactions |
| Analytics Engine | `service-analytics/` | Metrics, aggregates, event consumption |
| Curation & Notification | `service-curation/` | Curation, approval, moderation, notifications |
| Frontend | `frontend/` | Tourist, worker, and curator interfaces |

### Cross-Context Glossary

- `CONTEXT-COMPOSE.md` at the repo root consolidates terms shared across multiple contexts.
- `CONTEXT-MAP.md` at the repo root provides the canonical map of contexts to directories.

### Consumer Rules

1. Before implementing a feature in a given service, read its `CONTEXT.md` to understand domain terms.
2. Before referencing a term from another context, check `CONTEXT-COMPOSE.md` for the canonical definition.
3. If a term is not yet defined, add it to the relevant `CONTEXT.md` and update `CONTEXT-COMPOSE.md` if it spans contexts.
4. Past architectural decisions should be recorded as ADRs in `docs/adr/` — create this directory when the first ADR is needed.
