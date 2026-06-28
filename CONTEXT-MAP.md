# Praieira App — Mapa de Contextos

> Mapa de domínios do projeto. Cada contexto possui seu próprio `CONTEXT.md` com o glossário de termos daquele domínio.
> O `CONTEXT-COMPOSE.md` na raiz consolida o vocabulário transversal a todos os contextos.

## Contextos

| Contexto | Diretório | Escopo |
|---|---|---|
| Auth & Profile | `service-auth/` | Identidade, autenticação, papéis e perfil pessoal do usuário |
| Catalog & Geo | `service-catalog/` | Perfil comercial, serviços, geolocalização e busca |
| Interaction & Review | `service-reviews/` | Avaliações, contato e interações turista-empreendedor |
| Analytics Engine | `service-analytics/` | Métricas, agregados e consumo de eventos |
| Curation & Notification | `service-curation/` | Curadoria, aprovação, moderação e notificações |
| Frontend | `frontend/` | Interface do turista, empreendedor e curador |

## Decisões transversais

Decisões que afetam mais de um contexto estão registradas em `docs/adr/` na raiz.

## Como usar este mapa

1. Para entender um domínio específico, leia o `CONTEXT.md` do contexto correspondente.
2. Para entender os termos compartilhados entre contextos, leia o `CONTEXT-COMPOSE.md`.
3. Antes de implementar uma funcionalidade, verifique se o termo que você vai usar já está definido no glossário do contexto.
