# Analytics Engine — Glossário de Domínio

> Contexto responsável pelo processamento de métricas, agregações e dashboards a partir de eventos de negócio.
> **Diretório:** `service-analytics/`

---

## Evento de negócio (Business Event)

Mensagem publicada de forma assíncrona via RabbitMQ quando algo relevante acontece na plataforma. O Analytics consome seis tipos de evento:

| Evento | Significado |
|---|---|
| **Visualização de perfil** | Um turista acessou a página de detalhes de um perfil comercial |
| **Avaliação publicada** | Um turista publicou uma avaliação com nota e comentário |
| **Avaliação atualizada** | Um turista editou sua avaliação (nota e/ou comentário) |
| **Avaliação removida** | Um turista removeu sua própria avaliação |
| **Avaliação moderada** | Um curador ocultou ou removeu uma avaliação |
| **Contato acionado** | Um turista clicou no botão de WhatsApp ou telefone de um perfil |

O Analytics **nunca escreve dados por API REST**. Toda escrita é feita exclusivamente pelo consumo de eventos.

## Campos de eventos

Os eventos de avaliação carregam metadados para correção temporal e idempotência:

| Campo | Descrição |
|---|---|
| `originalSubmittedAt` | Data ISO da criação original da avaliação; usada para agregar a métrica no dia correto mesmo quando a edição/remoção/moderação ocorre depois |
| `previousRating` | Nota anterior da avaliação (presente em `review.updated.v1`) |
| `previousStatus` | Status anterior antes da transição |
| `status` | Status atual após a transição |

## Idempotência (Idempotency)

Propriedade que garante que um mesmo evento, se recebido mais de uma vez, não gere métricas duplicadas. Cada evento possui um identificador único (`eventId`), usado para detectar e ignorar duplicatas. O incremento é atômico via pipeline do MongoDB que verifica `appliedEventIds` antes de aplicar deltas.

## Retry e DLQ

Eventos com falha de processamento passam por uma retry queue com TTL antes de retornarem à fila principal. Após esgotar as tentativas máximas (`MAX_RETRY_ATTEMPTS`, default 3), o evento é publicado na DLQ para inspeção manual.

| Recurso | Nome default |
|---|---|
| Retry queue | `analytics.events.retry` |
| DLQ | `analytics.events.dlq` |
| Exchange de retry | `praieira.retry` |
| DLX | `praieira.dlx` |

## Variáveis de Ambiente

| Variável | Default | Descrição |
|---|---|---|
| `MAX_RETRY_ATTEMPTS` | `3` | Número máximo de tentativas de reprocessamento antes da DLQ |
| `RETRY_DELAY_MS` | `2000` | TTL da retry queue em milissegundos |
| `OUTBOX_LEASE_TIMEOUT_MS` | `30000` | Tempo máximo em ms que um worker pode reter um evento da outbox antes de outro worker poder retomá-lo |

## Agregado diário (Daily Aggregate)

Consolidação de métricas por dia, perfil e praia. Permite consultar, por exemplo: "quantas visualizações o perfil X teve no dia Y". Os agregados são a base para os dashboards.

## Dashboard do empreendedor

Painel onde o empreendedor consulta as métricas do seu próprio perfil comercial: visualizações, contatos, avaliações e taxa de conversão de interesse. O empreendedor **só vê métricas do seu próprio perfil**, nunca de terceiros.

## Painel do curador (Curator Dashboard)

Painel onde o curador consulta métricas agregadas da plataforma: cobertura territorial, tempo médio de curadoria, perfis pendentes, taxa de aprovação e indicadores de qualidade.

## Métrica (Metric)

Valor quantitativo extraído dos eventos de negócio. As métricas principais incluem:

- **Visualizações:** total de acessos à página de detalhes
- **Intenções de contato:** total de cliques em canais externos
- **Avaliações:** total e média de avaliações
- **Taxa de conversão de interesse:** contatos divididos por visualizações

## Indicador (KPI)

Métrica utilizada para avaliar o sucesso da plataforma. Os KPIs são definidos no documento de requisitos e incluem cobertura territorial, retenção de empreendedores, tempo de curadoria e satisfação do usuário.
