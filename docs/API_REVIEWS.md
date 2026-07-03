# Interaction & Review Service — API Reference

> **Porta:** 3003 | **Swagger:** http://localhost:3003/api

## Autenticação

Todas as rotas protegidas exigem header `Authorization: Bearer <JWT>`.
O JWT deve ser compatível com `service-auth` — algoritmo HS256, payload com `{ sub, role, email }`.

## Endpoints

### Health
```http
GET /health
```
**Acesso:** público

**Resposta (200):**
```json
{
  "status": "ok",
  "service": "service-reviews",
  "dependencies": {
    "database": "up",
    "rabbitmq": "up"
  }
}
```
Status `degraded` quando RabbitMQ indisponível.

---

### Criar Avaliação
```http
POST /reviews
Authorization: Bearer <JWT>
Content-Type: application/json
```
**Acesso:** `TOURIST`

**Body:**
```json
{
  "workerProfileId": "uuid-v4",
  "rating": 5,
  "comment": "Atendimento excelente."
}
```
- `rating`: inteiro 1-5 (obrigatório)
- `comment`: string, opcional, máx. 1000 caracteres, não pode ser apenas espaços

**Resposta (201):**
```json
{
  "data": {
    "id": "uuid",
    "workerProfileId": "uuid",
    "touristUserId": "uuid",
    "rating": 5,
    "comment": "Atendimento excelente.",
    "status": "PUBLISHED",
    "createdAt": "2026-06-29T00:00:00.000Z",
    "updatedAt": "2026-06-29T00:00:00.000Z"
  },
  "meta": { "requestId": "uuid" }
}
```

**Erros:** 400 (validação), 401 (sem JWT), 403 (não é TOURIST), 404 (perfil não encontrado), 409 (avaliação duplicada), 422 (perfil indisponível)

---

### Listar Avaliações
```http
GET /reviews/worker/:workerProfileId?page=1&limit=20
```
**Acesso:** público

**Resposta (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "workerProfileId": "uuid",
      "rating": 5,
      "comment": "Excelente!",
      "status": "PUBLISHED",
      "createdAt": "2026-06-29T00:00:00.000Z",
      "updatedAt": "2026-06-29T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "requestId": "uuid"
  }
}
```
**Nota:** `touristUserId` não é exposto publicamente.

---

### Resumo de Avaliações
```http
GET /reviews/worker/:workerProfileId/summary
```
**Acesso:** público

**Resposta (200):**
```json
{
  "data": {
    "workerProfileId": "uuid",
    "averageRating": 4.4,
    "totalReviews": 120,
    "distribution": { "1": 2, "2": 4, "3": 10, "4": 30, "5": 74 }
  },
  "meta": { "requestId": "uuid" }
}
```
Perfil sem avaliações retorna `averageRating: 0`, `totalReviews: 0`, distribuição zerada.

---

### Editar Avaliação
```http
PATCH /reviews/:id
Authorization: Bearer <JWT>
Content-Type: application/json
```
**Acesso:** `TOURIST` autor da avaliação

**Body (campos opcionais):**
```json
{
  "rating": 4,
  "comment": "Atualizando minha experiência."
}
```

**Resposta (200):** Review atualizada.

**Erros:** 400, 401, 403 (não é o autor), 404, 409 (janela de edição expirada — configurável via `REVIEW_EDIT_WINDOW_HOURS`)

---

### Remover Avaliação (Soft Delete)
```http
DELETE /reviews/:id
Authorization: Bearer <JWT>
```
**Acesso:** `TOURIST` autor da avaliação

**Resposta (200):** Review com `status: "REMOVED"` e `deletedAt` preenchido.

Avaliações removidas não aparecem na listagem nem no resumo.

---

### Moderar Avaliação
```http
PATCH /reviews/:id/moderation
Authorization: Bearer <JWT>
Content-Type: application/json
```
**Acesso:** `CURATOR`

**Body:**
```json
{
  "action": "HIDDEN",
  "reason": "Conteúdo abusivo"
}
```
- `action`: `"HIDDEN"` ou `"REMOVED"`
- `reason`: obrigatório, máx. 500 caracteres

**Resposta (200):** Review moderada com `moderatedByUserId`, `moderatedAt`, `moderationReason`.

---

### Denunciar Avaliação
```http
POST /reviews/:id/reports
Authorization: Bearer <JWT>
Content-Type: application/json
```
**Acesso:** `TOURIST` ou `WORKER`

**Body:**
```json
{
  "reason": "SPAM",
  "details": "Este perfil está promovendo links fraudulentos."
}
```
- `reason`: `ABUSIVE_CONTENT`, `SPAM`, `FALSE_INFORMATION`, ou `OTHER`

**Resposta (201):**
```json
{
  "data": {
    "id": "uuid",
    "reviewId": "uuid",
    "userId": "uuid",
    "reason": "SPAM",
    "status": "PENDING",
    "createdAt": "2026-06-29T00:00:00.000Z"
  },
  "meta": { "requestId": "uuid" }
}
```

**Erros:** 404, 409 (já denunciou esta avaliação)

---

### Registrar Contato
```http
POST /interactions/contact/:workerProfileId
[Authorization: Bearer <JWT>]  (opcional)
Content-Type: application/json
```
**Acesso:** público (autenticação opcional)

**Body:**
```json
{
  "channel": "WHATSAPP",
  "source": "PROFILE_DETAIL"
}
```
- `channel`: `WHATSAPP` ou `PHONE`
- `source`: `PROFILE_DETAIL`, `MAP`, ou `SEARCH_RESULT` (opcional)

**Resposta (201):**
```json
{
  "data": {
    "interactionId": "uuid",
    "workerProfileId": "uuid",
    "channel": "WHATSAPP",
    "contactUrl": "https://wa.me/5581999999999",
    "disclaimer": "Esta ação registra uma intenção de contato e não representa venda ou transação confirmada.",
    "createdAt": "2026-06-29T00:00:00.000Z"
  },
  "meta": { "requestId": "uuid" }
}
```

**Importante:** O contato é registrado como **intenção**, não como venda. A `contactUrl` é obtida/validada via serviço de catálogo.

---

## Eventos Publicados

| Evento | Routing Key | Quando |
|---|---|---|
| `review.submitted.v1` | `review.submitted.v1` | Nova avaliação |
| `review.updated.v1` | `review.updated.v1` | Avaliação editada (nota e/ou comentário) |
| `review.removed.v1` | `review.removed.v1` | Avaliação removida pelo autor |
| `review.moderated.v1` | `review.moderated.v1` | Curador modera (oculta ou remove) |
| `review.reported.v1` | `review.reported.v1` | Usuário denuncia |
| `contact.clicked.v1` | `contact.clicked.v1` | Clique em canal de contato |

### Campos de Eventos de Avaliação

Eventos de atualização, remoção e moderação incluem `originalSubmittedAt` (timestamp ISO da criação original da avaliação), `previousStatus` (status anterior), e `previousRating` (nota anterior quando aplicável), para permitir que o Analytics corrija a métrica no dia correto.

Exchange: `praieira.events` (topic, durable)

---

## Exemplos cURL

### Criar avaliação
```bash
curl -X POST http://localhost:3003/reviews \
  -H "Authorization: Bearer <TOURIST_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"workerProfileId": "10000000-0000-4000-8000-000000000001", "rating": 5, "comment": "Excelente!"}'
```

### Registrar contato
```bash
curl -X POST http://localhost:3003/interactions/contact/10000000-0000-4000-8000-000000000001 \
  -H "Content-Type: application/json" \
  -d '{"channel": "WHATSAPP", "source": "PROFILE_DETAIL"}'
```

### Listar avaliações
```bash
curl http://localhost:3003/reviews/worker/10000000-0000-4000-8000-000000000001?page=1&limit=20
```

### Resumo
```bash
curl http://localhost:3003/reviews/worker/10000000-0000-4000-8000-000000000001/summary
```
