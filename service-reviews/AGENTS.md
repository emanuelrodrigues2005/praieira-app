# service-reviews — AGENTS.md

> Módulo 4: Interaction & Review Service
> Responsável: Emanuel

## Objetivo

Gerenciar avaliações (nota + comentário) e interações de contato entre turistas e empreendedores. Toda nota publicada, todo clique em WhatsApp e toda intenção de contato passam por este serviço.

**Domínio:** Avaliação (Review), Nota (Rating), Comentário, Média, Contato, Intenção de contato, Interação, Denúncia, Moderação.
**Glossário completo:** `CONTEXT.md`

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | NestJS 10 |
| Linguagem | TypeScript 5.7 |
| ORM | Prisma 5 |
| Banco | PostgreSQL 15 (`db_reviews`) |
| Mensageria | RabbitMQ (`@nestjs/microservices`, `amqplib`) |
| Validação | `class-validator` + `class-transformer` |
| Documentação | Swagger/OpenAPI |

## Porta

**3003** — porta fixa e exclusiva. Nenhum outro serviço pode usar esta porta.

## Como rodar

### Local (desenvolvimento)

```bash
cd service-reviews
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

O serviço sobe em `http://localhost:3003`. Swagger em `http://localhost:3003/api`.

### Docker

```bash
docker compose up --build service-reviews
```

## Contratos principais

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/reviews` | `TOURIST` | Publica avaliação (1-5 estrelas + comentário opcional) |
| `GET` | `/reviews/worker/:id` | qualquer | Lista avaliações de um perfil |
| `GET` | `/reviews/worker/:id/summary` | qualquer | Resumo agregado (média, total, distribuição) |
| `PATCH` | `/reviews/:id` | `TOURIST` (autor) | Edita avaliação (dentro da janela permitida) |
| `DELETE` | `/reviews/:id` | `TOURIST` (autor) ou `CURATOR` | Remove avaliação |
| `POST` | `/interactions/contact/:workerId` | qualquer | Registra clique de WhatsApp/telefone |
| `GET` | `/health` | público | Saúde do serviço |

## Eventos que publica

| Evento | Quando |
|---|---|
| `review.submitted.v1` | Turista publica avaliação |
| `contact.clicked.v1` | Turista clica em canal de contato |

## Regras críticas

1. **Avaliação exige autenticação.** Apenas `TOURIST` avalia. O `sub` do JWT é o `touristId`.
2. **Nota entre 1 e 5.** Validar no DTO — `@Min(1) @Max(5)`.
3. **Unicidade: um turista, uma avaliação por perfil.** Antes de criar, verificar se já existe. Retornar `409 Conflict` se duplicado.
4. **Contato NÃO é venda.** O evento `contact.clicked.v1` registra intenção, não transação financeira. Expor isso claramente nos dados retornados ao dashboard.
5. **Média é recalculada a cada nova avaliação ou edição.** Deve refletir apenas avaliações ativas (não removidas).
6. **Evento é publicado após persistência bem-sucedida.** Se a publicação do evento falhar, a transação local continua válida (consistência eventual com retry).
