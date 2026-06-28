# service-analytics — AGENTS.md

> Módulo 5: Analytics Engine
> Responsável: Emanuel

## Objetivo

Processar eventos de negócio (visualizações, avaliações, contatos) para gerar métricas e alimentar os dashboards do empreendedor e do curador. É um serviço orientado a eventos — **toda escrita é feita exclusivamente por consumo de eventos do RabbitMQ**. A leitura é exposta via REST para o frontend.

**Domínio:** Evento de negócio, Idempotência, Agregado diário, Dashboard do empreendedor, Painel do curador, Métrica, KPI.
**Glossário completo:** `CONTEXT.md`

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | NestJS 10 (app híbrida HTTP + microserviço RMQ) |
| Linguagem | TypeScript 5.7 |
| ODM | Mongoose 8 |
| Banco | MongoDB (`db_analytics`) |
| Mensageria | RabbitMQ (`@nestjs/microservices`, `amqplib`) |
| Validação | `class-validator` + `class-transformer` |
| Documentação | Swagger/OpenAPI |

## Porta

**3005** — porta fixa e exclusiva. Nenhum outro serviço pode usar esta porta.

> **IMPORTANTE:** O analytics é uma aplicação híbrida — serve HTTP na porta 3005 **e** simultaneamente consome eventos do RabbitMQ. O `main.ts` usa `NestFactory.create` + `connectMicroservice` + `startAllMicroservices`. Não use `NestFactory.createMicroservice` puro — isso desabilita o servidor HTTP e quebra os dashboards.

## Como rodar

### Local (desenvolvimento)

```bash
cd service-analytics
npm install
npm run start:dev
```

O serviço sobe em `http://localhost:3005`. Swagger em `http://localhost:3005/api`.

> Requer MongoDB e RabbitMQ rodando. Sem MongoDB, o consumo de eventos falha.

### Docker

```bash
docker compose up --build service-analytics
```

O Dockerfile do analytics **não** tem `entrypoint.sh` com Prisma (usa MongoDB, não PostgreSQL). Inicia direto com `node dist/main`.

## Eventos que consome

| Evento | Handler | Ação |
|---|---|---|
| `profile.viewed.v1` | `handleProfileViewed` | Incrementa contador de visualização do perfil |
| `review.submitted.v1` | (a implementar) | Incrementa contador de avaliação, recalcula média |
| `contact.clicked.v1` | (a implementar) | Incrementa contador de intenção de contato |

**Fila:** `analytics_queue` (durável, binding: `praieira.events` exchange, tipo `topic`)

## Endpoints REST de leitura (a implementar)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/analytics/workers/:id/metrics` | `WORKER` (dono) | Métricas do perfil (visualizações, contatos, avaliações) |
| `GET` | `/analytics/curation/stats` | `CURATOR` | Indicadores agregados de curadoria |
| `GET` | `/health` | público | Saúde do serviço |

## Regras críticas

1. **Idempotência por `eventId`.** Cada evento tem um identificador único. Antes de processar, verificar se já foi consumido. Evento duplicado não pode gerar métrica duplicada.
2. **Confirmação manual (manual ack).** Só confirmar a mensagem no RabbitMQ **após** persistir no MongoDB com sucesso. Se falhar, `nack` com requeue.
3. **Tolerância a falhas.** Se o analytics cair, os eventos acumulam na fila durável. Quando voltar, processa tudo. A falha do analytics **não pode** impedir busca, cadastro ou avaliações.
4. **DLQ após N tentativas.** Se um evento falhar repetidamente, mover para `analytics.dlq` para inspeção manual.
5. **Escrita somente por eventos.** Nenhum endpoint REST escreve dados. Toda mutação de estado vem do RabbitMQ.
6. **Leitura protegida.** Empreendedor só consulta métricas do próprio perfil. Curador consulta métricas agregadas.
7. **Aviso de intenção.** Todo endpoint que retornar "contatos" deve incluir a ressalva de que são intenções, não vendas confirmadas.
