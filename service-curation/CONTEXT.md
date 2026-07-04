# Curation & Notification — Glossário de Domínio

> Contexto responsável pela curadoria de perfis, moderação de conteúdo, notificações internas e trilha de auditoria.
> **Diretório:** `service-curation/`

---

## Curadoria (Curation)

Processo de análise e validação de perfis comerciais submetidos pelos empreendedores. A curadoria garante que apenas informações verificadas e confiáveis apareçam publicamente na plataforma. Inclui também a moderação de avaliações e o tratamento de denúncias.

## Solicitação de curadoria (Curation Request)

Registro criado automaticamente quando um empreendedor submete seu perfil comercial. Cada solicitação está vinculada a um único perfil e passa por um ciclo de decisão.

**Status da solicitação:**

| Status | Significado |
|---|---|
| **Pendente (Pending)** | Aguardando decisão do curador |
| **Aprovada (Approved)** | Perfil validado; o catálogo é notificado para torná-lo público |
| **Rejeitada (Rejected)** | Perfil recusado; o empreendedor recebe a justificativa e pode corrigir |
| **Cancelada (Cancelled)** | Solicitação encerrada sem decisão (ex.: perfil retirado pelo empreendedor) |

## Decisão (Decision)

Ato do curador de aprovar ou rejeitar uma solicitação pendente. Toda decisão é **irreversível** e fica registrada no histórico de auditoria com identificação do curador, data e justificativa.

## Justificativa (Reason Code / Notes)

Motivo registrado pelo curador ao aprovar ou, principalmente, ao rejeitar um perfil. A rejeição **exige** um código de motivo e notas explicativas para que o empreendedor saiba o que corrigir.

## Histórico de curadoria (Curation History)

Trilha de auditoria que registra cada mudança de status de uma solicitação: quem decidiu, quando, de qual status para qual, e com qual justificativa. O histórico é imutável e consultável.

## Alerta de moderação (Moderation Alert)

Sinalização automática gerada quando um evento requer atenção do curador. Os alertas podem ser disparados por:

- Avaliação com nota ≤ 2 estrelas;
- Denúncia de conteúdo;
- Comportamento suspeito.

Cada alerta tem severidade e status (aberto/resolvido). No MVP, alertas de nota baixa **não suspendem automaticamente** o perfil.

## Notificação (Notification)

Mensagem enviada a um usuário específico sobre um evento relevante para ele — por exemplo: perfil aprovado, perfil rejeitado, nova avaliação recebida. As notificações do MVP são exclusivamente do tipo **in-app** (exibidas dentro da plataforma).

## Canal de notificação (Notification Channel)

Meio pelo qual a notificação é entregue. No MVP, o único canal implementado é **IN_APP**. Canais como email, SMS e push são evoluções futuras.

## Fila de pendências (Pending Queue)

Lista de solicitações de curadoria aguardando decisão, ordenada por data de submissão. O curador acessa esta fila para priorizar e executar as análises.

## Suspensão (Suspension)

Ato de tornar um perfil comercial temporariamente indisponível. Diferente da rejeição (que é uma decisão de curadoria sobre um perfil novo), a suspensão é uma ação de moderação sobre um perfil que já estava aprovado e ativo.
