# service-curation — AGENTS.md

> Módulo 6: Curation & Notification Service
> Responsável: Gustavo

## Objetivo

Gerenciar o fluxo de curadoria (aprovação/rejeição de perfis comerciais), moderação de conteúdo e notificações internas. É o guardião da confiabilidade — nenhum perfil aparece publicamente sem passar por este serviço.

**Domínio:** Curadoria, Solicitação, Decisão, Justificativa, Histórico de auditoria, Alerta de moderação, Notificação, Canal, Fila de pendências, Suspensão.
**Glossário completo:** `CONTEXT.md`

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | NestJS 10 |
| Linguagem | TypeScript 5.7 |
| ORM | Prisma 5 |
| Banco | PostgreSQL 15 (`db_curation`) |
| Mensageria | RabbitMQ (`@nestjs/microservices`, `amqplib`) |
| Validação | `class-validator` + `class-transformer` |
| Documentação | Swagger/OpenAPI |

## Porta

**3004** — porta fixa e exclusiva. Nenhum outro serviço pode usar esta porta.

## Como rodar

### Local (desenvolvimento)

```bash
cd service-curation
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

O serviço sobe em `http://localhost:3004`. Swagger em `http://localhost:3004/api`.

### Docker

```bash
docker compose up --build service-curation
```

## Contratos principais

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/curation/pending` | `CURATOR` | Lista pendências (paginação + filtros) |
| `GET` | `/curation/requests/:id` | `CURATOR` | Detalhes da solicitação + histórico |
| `POST` | `/curation/requests/:id/approve` | `CURATOR` | Aprova perfil |
| `POST` | `/curation/requests/:id/reject` | `CURATOR` | Rejeita com justificativa |
| `GET` | `/curation/history` | `CURATOR` | Pesquisa decisões passadas |
| `GET` | `/curation/alerts` | `CURATOR` | Lista alertas de moderação |
| `PATCH` | `/curation/alerts/:id/resolve` | `CURATOR` | Encerra alerta |
| `GET` | `/notifications/me` | autenticado | Notificações do usuário logado |
| `PATCH` | `/notifications/:id/read` | destinatário | Marca notificação como lida |
| `GET` | `/health` | público | Saúde do serviço |

## Eventos que consome

| Evento | Ação |
|---|---|
| `worker.profile.submitted.v1` | Cria solicitação de curadoria (`PENDING`) |
| `review.submitted.v1` | Se `rating <= 2`, cria alerta de moderação |
| `notification.requested.v1` | Persiste e entrega notificação in-app |

## Eventos que publica

| Evento | Quando |
|---|---|
| `worker.profile.approved.v1` | Curador aprova perfil |
| `worker.profile.rejected.v1` | Curador rejeita perfil |
| `notification.requested.v1` | Qualquer notificação a ser entregue |

## Regras críticas

1. **Apenas `CURATOR` decide.** Nenhum outro papel pode aprovar ou rejeitar. Verificar `role` do JWT.
2. **Decisão é irreversível e auditável.** Toda transição de status é registrada no histórico com `actorUserId`, `fromStatus`, `toStatus`, `notes` e `createdAt`.
3. **Aprovação exige transação atômica:** atualizar status → registrar histórico → publicar evento de aprovação → criar notificação.
4. **Rejeição exige `reasonCode` e `notes`.** O empreendedor precisa saber o que corrigir. Sem justificativa, a rejeição é inválida.
5. **Idempotência por `sourceEventId` (submissão).** Se o mesmo `worker.profile.submitted.v1` chegar duas vezes, não criar solicitação duplicada.
6. **Não decidir duas vezes.** Validar que a solicitação está `PENDING` antes de aprovar ou rejeitar. Retornar `409 Conflict` se já decidida.
7. **Alerta de nota baixa NÃO suspende automaticamente no MVP.** Apenas cria o alerta para revisão humana.
8. **Notificações são in-app.** Canal `IN_APP` no MVP. Email/SMS/Push são evoluções futuras.
