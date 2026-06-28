# Interaction & Review — Glossário de Domínio

> Contexto responsável pelas avaliações, contato e interações entre turistas e empreendedores.
> **Diretório:** `service-reviews/`

---

## Avaliação (Review)

Nota e comentário que um turista autenticado publica sobre um perfil comercial após utilizá-lo. Cada avaliação contém uma nota de 1 a 5 estrelas e um comentário textual opcional.

**Regra de unicidade:** Um turista só pode publicar uma única avaliação por perfil comercial. A regra definitiva aguarda validação da equipe, mas o MVP adota uma-avaliação-por-turista-por-perfil.

## Nota (Rating)

Valor numérico de 1 a 5 atribuído pelo turista na avaliação. 1 representa a pior experiência; 5 representa a melhor.

## Comentário (Comment)

Texto opcional que acompanha a nota na avaliação. Permite que o turista descreva sua experiência qualitativamente.

## Média de avaliações (Average Rating)

Soma das notas válidas dividida pelo total de avaliações de um perfil comercial. Exibida publicamente na página de detalhes. Atualizada a cada nova avaliação.

## Contato (Contact)

Ação do turista de acionar um canal externo de comunicação com o empreendedor — tipicamente WhatsApp ou telefone. O contato é registrado como uma **intenção**, não como uma venda confirmada.

**Distinção importante:** O sistema registra **intenção de contato** (clique no botão de WhatsApp/telefone), e nunca afirma que houve venda, transação financeira ou acordo comercial entre as partes.

## Intenção de contato (Contact Intention)

Métrica que contabiliza cada clique válido em canal de contato externo. É usada como indicador de interesse, mas **não** equivale a venda realizada. O painel do empreendedor e os dashboards devem exibir este dado com a ressalva explícita de que se trata de intenção, não de conversão financeira.

## Interação (Interaction)

Registro de uma ação do turista sobre um perfil comercial, como clique em WhatsApp. Diferente da avaliação, a interação não implica julgamento de qualidade — apenas sinaliza interesse.

## Denúncia (Report)

Notificação enviada por um usuário sobre conteúdo que viola as regras da plataforma — como avaliação abusiva, perfil falso ou informação enganosa. As denúncias são analisadas pelo curador.

## Moderação de avaliação (Review Moderation)

Ação do curador de analisar e, se necessário, remover ou ocultar uma avaliação que viole as regras. Avaliações com nota muito baixa (≤ 2) geram automaticamente um alerta de moderação para o time de curadoria.
