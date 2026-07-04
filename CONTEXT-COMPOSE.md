# Praieira App — Glossário Transversal (CONTEXT-COMPOSE)

> Este documento consolida os termos que atravessam múltiplos contextos de domínio. Cada termo possui uma definição canônica e indica em quais contextos ele é utilizado.
>
> Para os glossários específicos de cada domínio, consulte o `CONTEXT.md` do contexto correspondente. O mapa completo está em `CONTEXT-MAP.md`.

---

## Atores da plataforma

### Empreendedor (Worker)

Prestador ou comerciante local que oferece produtos, serviços ou experiências aos turistas. Inclui barraqueiros, ambulantes, bugueiros, operadores de passeios, donos de bares e restaurantes, artesãos, lojistas, quiosques e prestadores de serviços auxiliares ao turismo.

- **Contextos que o definem:** Auth & Profile
- **Contextos que o referenciam:** Catalog & Geo, Interaction & Review, Analytics Engine, Curation & Notification, Frontend
- **Identificador no código:** `WORKER`

### Turista (Tourist)

Pessoa que visita ou circula pelas orlas atendidas e utiliza a plataforma para descobrir serviços, estabelecimentos e experiências próximas.

- **Contextos que o definem:** Auth & Profile
- **Contextos que o referenciam:** Catalog & Geo, Interaction & Review, Analytics Engine, Frontend
- **Identificador no código:** `TOURIST`

### Curador (Curator)

Usuário autorizado a validar perfis comerciais, moderar conteúdo, analisar denúncias e manter a confiabilidade da plataforma.

- **Contextos que o definem:** Auth & Profile
- **Contextos que o referenciam:** Curation & Notification, Analytics Engine, Frontend
- **Identificador no código:** `CURATOR`

### Administrador (Admin)

Usuário responsável pela operação técnica e configuração global da plataforma. No MVP acadêmico, pode ser provisionado por seed sem interface completa.

- **Contextos que o definem:** Auth & Profile
- **Identificador no código:** `ADMIN`

---

## Território

### Praia (Beach)

Unidade territorial utilizada para busca e classificação de perfis. As praias iniciais do MVP são: **Gaibu**, **Porto de Galinhas**, **Praia dos Carneiros** e **Boa Viagem**. A arquitetura permite expansão para novas praias por configuração de dados.

- **Contextos que a definem:** Catalog & Geo
- **Contextos que a referenciam:** Analytics Engine, Frontend

### Orla

Termo usado como sinônimo de Praia em alguns documentos. Refere-se à área territorial litorânea cadastrada na plataforma.

- **Contextos que a referenciam:** Catalog & Geo

---

## Entidades centrais

### Perfil comercial (Worker Profile)

Página pública que representa um empreendedor na plataforma. Passa por um ciclo de vida: Rascunho → Pendente (submetido à curadoria) → Aprovado (visível publicamente) ou Rejeitado (correção necessária). Pode ser Suspenso por moderação.

- **Contextos que o definem:** Catalog & Geo
- **Contextos que o referenciam:** Interaction & Review, Analytics Engine, Curation & Notification, Frontend

### Serviço (Service Item)

Oferta individual vinculada a um perfil comercial. Inclui título, descrição, preço, categoria e localização própria.

- **Contextos que o definem:** Catalog & Geo
- **Contextos que o referenciam:** Frontend

### Categoria (Category)

Classificação de perfis comerciais e serviços. As categorias iniciais cobrem os principais tipos de empreendedores do arranjo produtivo local do turismo litorâneo.

- **Contextos que a definem:** Catalog & Geo
- **Contextos que a referenciam:** todos os contextos

---

## Interações

### Avaliação (Review)

Nota de 1 a 5 estrelas e comentário opcional publicados por um turista autenticado sobre um perfil comercial. Cada turista pode publicar uma única avaliação por perfil. Avaliações com nota ≤ 2 geram alerta de moderação.

- **Contextos que a definem:** Interaction & Review
- **Contextos que a consomem:** Analytics Engine (métricas), Curation & Notification (alertas)
- **Contextos que a exibem:** Catalog & Geo (média), Frontend

### Contato / Intenção de contato (Contact Intention)

Clique do turista em canal externo de comunicação (WhatsApp ou telefone) a partir de um perfil comercial. O sistema registra a **intenção**, não a venda. O dado deve ser exibido com a ressalva de que não representa transação financeira confirmada.

- **Contextos que a definem:** Interaction & Review
- **Contextos que a consomem:** Analytics Engine (métrica de conversão)
- **Contextos que a exibem:** Frontend (painel do empreendedor)

### Visualização (View)

Acesso à página de detalhes de um perfil comercial aprovado.

- **Contextos que a definem:** Catalog & Geo
- **Contextos que a consomem:** Analytics Engine (métrica)

---

## Processos

### Curadoria (Curation)

Processo de análise, validação e decisão sobre perfis comerciais submetidos. Inclui aprovação, rejeição com justificativa, histórico de auditoria e moderação de conteúdo.

- **Contextos que a definem:** Curation & Notification
- **Contextos que a referenciam:** Catalog & Geo (publicação de submissão, consumo de decisão), Analytics Engine (métricas de tempo)

### Notificação (Notification)

Mensagem in-app enviada a um usuário sobre evento relevante: perfil aprovado, perfil rejeitado, nova avaliação, alerta de moderação.

- **Contextos que a definem:** Curation & Notification
- **Contextos que a exibem:** Frontend

---

## Comunicação assíncrona

### Evento de negócio (Domain Event)

Mensagem imutável publicada via RabbitMQ quando algo relevante acontece. Transporta a informação entre contextos sem acoplamento direto entre serviços. Cada evento possui `eventId` único para idempotência.

- **Contextos que publicam:** Catalog & Geo, Interaction & Review, Curation & Notification
- **Contextos que consomem:** Analytics Engine, Curation & Notification, Catalog & Geo

### Idempotência (Idempotency)

Garantia de que o processamento de um mesmo evento mais de uma vez não produza efeitos duplicados. Implementada por verificação do `eventId`.

- **Contextos que a implementam:** Analytics Engine, Curation & Notification

---

## Projeto

### MVP (Minimum Viable Product)

Produto mínimo viável — a primeira entrega funcional da plataforma, contendo cadastro, perfis, catálogo, busca, mapa, curadoria, avaliações, contato, analytics e dashboards. O escopo exato está definido nos documentos de requisitos e arquitetura.

### Praieira App

Nome do produto: hub territorial de turismo litorâneo de Pernambuco. Plataforma digital que conecta turistas a empreendedores locais nas praias de Gaibu, Porto de Galinhas, Praia dos Carneiros e Boa Viagem.
