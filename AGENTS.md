# Praieira App — AGENTS.md

> Hub territorial de turismo litorâneo de Pernambuco. Plataforma digital que conecta turistas a empreendedores locais nas praias de Gaibu, Porto de Galinhas, Praia dos Carneiros e Boa Viagem.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Backend Framework | NestJS 10 |
| Language | TypeScript 5.7+ |
| ORM/ODM | Prisma 5 (PostgreSQL services), Mongoose 8 (MongoDB analytics) |
| Databases | PostgreSQL 15 + PostGIS 3.3, MongoDB 7.0 |
| Message Broker | RabbitMQ 3 (topic exchange) |
| Frontend | Angular 18+ |
| Auth | JWT + Passport |
| Container | Docker + Docker Compose |

## Architecture

**Event-Driven Architecture (EDA)** with RabbitMQ as the message bus. Each bounded domain is a separate microservice:

| Service | Port | Database | Purpose |
|---|---|---|---|
| `service-auth` | 3001 | PostgreSQL (db_auth) | Identity, auth, roles, personal profile |
| `service-catalog` | 3002 | PostgreSQL + PostGIS (db_catalog) | Worker profiles, services, geolocation, search |
| `service-reviews` | 3003 | PostgreSQL (db_reviews) | Reviews, contact, tourist-worker interactions |
| `service-curation` | 3004 | PostgreSQL (db_curation) | Curation, approval, moderation, notifications |
| `service-analytics` | 3005 | MongoDB (db_analytics) | Metrics, aggregates, event consumption |
| `frontend` | 4200 | — | Angular SPA |

All services communicate through the `praieira.events` RabbitMQ topic exchange. Each service validates JWT tokens independently using the same secret and payload structure `{ sub, role, email }`.

Per-service details (endpoints, events, business rules) are in each service's own `AGENTS.md`.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues at `emanuelrodrigues2005/praieira-app`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage labels use default names: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context monorepo — each service has its own `CONTEXT.md` glossary. Cross-context terms are consolidated in `CONTEXT-COMPOSE.md`. See `docs/agents/domain.md`.
