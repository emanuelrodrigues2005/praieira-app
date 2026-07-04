# service-catalog — AGENTS.md

> Módulo 3: Catalog & Geo Service
> Responsável: João Ricardo

## Objetivo

Manter o catálogo de perfis comerciais e serviços, com busca georreferenciada por raio, praia e categoria. É o coração da descoberta turística — tudo que aparece no mapa e na lista de exploração vem deste serviço.

**Domínio:** Perfil comercial (Worker Profile), Serviço (Service Item), Praia, Categoria, Georreferenciamento, Catálogo, Submissão, Visualização.
**Glossário completo:** `CONTEXT.md`

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | NestJS 10 |
| Linguagem | TypeScript 5.7 |
| ORM | Prisma 5 |
| Banco | PostgreSQL 15 + PostGIS 3.3 (`db_catalog`) |
| Mensageria | RabbitMQ (`@nestjs/microservices`, `amqplib`) |
| Validação | `class-validator` + `class-transformer` |
| Documentação | Swagger/OpenAPI |

## Porta

**3002** — porta fixa e exclusiva. Nenhum outro serviço pode usar esta porta.

## Como rodar

### Local (desenvolvimento)

```bash
cd service-catalog
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

O serviço sobe em `http://localhost:3002`. Swagger em `http://localhost:3002/api`.

### Docker

```bash
docker compose up --build service-catalog
```

## Contratos principais

### Perfil comercial

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/catalog/workers` | `WORKER` | Cria perfil comercial (rascunho) |
| `GET` | `/catalog/workers/me` | `WORKER` | Lista perfis do empreendedor |
| `GET` | `/catalog/workers/:id` | autenticado | Detalhes de um perfil |
| `PATCH` | `/catalog/workers/:id` | `WORKER` (dono) | Edita perfil |
| `POST` | `/catalog/workers/me/submit` | `WORKER` | Submete à curadoria |
| `DELETE` | `/catalog/workers/:id` | `WORKER` (dono) | Remove perfil |

### Serviços

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/catalog/workers/:id/services` | `WORKER` (dono) | Adiciona serviço |
| `PATCH` | `/catalog/services/:id` | `WORKER` (dono) | Edita serviço |
| `DELETE` | `/catalog/services/:id` | `WORKER` (dono) | Remove serviço |

### Busca pública

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/catalog/search` | qualquer | Busca com filtros (texto, praia, categoria, raio) |
| `GET` | `/health` | público | Saúde do serviço |

## Eventos que publica

| Evento | Quando |
|---|---|
| `worker.profile.submitted.v1` | Empreendedor submete perfil à curadoria |
| `profile.viewed.v1` | Turista acessa página de detalhes de perfil aprovado |

## Eventos que consome

| Evento | Efeito |
|---|---|
| `worker.profile.approved.v1` | Atualiza status do perfil para `APPROVED` |
| `worker.profile.rejected.v1` | Atualiza status do perfil para `REJECTED` |

## Regras críticas

1. **Apenas perfis aprovados (`APPROVED`) aparecem na busca pública e no mapa.**
2. **Perfil em rascunho (`DRAFT`) ou pendente (`PENDING`) não é visível ao turista.**
3. **Empreendedor só gerencia o próprio perfil.** Verificar `ownerUserId` contra o `sub` do JWT.
4. **Coordenadas devem ser validadas:** latitude entre -90 e 90, longitude entre -180 e 180.
5. **PostGIS deve estar funcional** para busca por raio. Testar com `ST_DWithin`.
6. **Evento de visualização não pode bloquear a resposta ao turista.** Publicar de forma assíncrona, sem esperar confirmação.
