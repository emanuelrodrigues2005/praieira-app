# Praieira App — Documento de Arquitetura e Especificação por Módulo

> **Projeto:** Hub de Turismo Litorâneo de Pernambuco  
> **Repositório:** `emanuelrodrigues2005/praieira-app`  
> **Versão do documento:** 1.0  
> **Status:** Especificação executável para implementação  
> **Data de consolidação:** 28/06/2026  
> **Arquitetura-base:** Microserviços + REST + Event-Driven Architecture (EDA) + RabbitMQ

---

## 1. Finalidade deste documento

Este documento transforma a proposta funcional e o documento inicial de arquitetura em uma especificação técnica executável. Ele deve ser usado como:

1. referência única de arquitetura do projeto;
2. contrato de divisão de trabalho entre os desenvolvedores;
3. base para criação dos contextos de implementação de cada módulo;
4. checklist de integração e critérios de aceite;
5. referência para apresentação acadêmica e demonstração do sistema distribuído.

O objetivo do produto é centralizar informações turísticas e comerciais das orlas de **Gaibu**, **Porto de Galinhas**, **Praia dos Carneiros** e **Boa Viagem**, conectando turistas a empreendedores locais de forma simples, confiável e georreferenciada.

---

## 2. Fontes consolidadas e decisões de arquitetura

### 2.1 Fontes utilizadas

- Documento de arquitetura inicial do projeto.
- Proposta de informações e estudos complementares.
- Repositório atual `praieira-app`.
- Requisitos funcionais e objetivos fornecidos pelo proponente.

### 2.2 Estado atual verificado no repositório

O repositório já possui:

- frontend Angular 18;
- cinco serviços NestJS 10;
- PostgreSQL/PostGIS;
- MongoDB;
- RabbitMQ;
- Prisma nos serviços relacionais;
- Mongoose no serviço de analytics;
- Docker Compose com bancos, broker, serviços e frontend;
- schemas iniciais para usuários, catálogo, avaliações, interações e curadoria;
- endpoints de `health` em parte dos serviços;
- estrutura inicial de consumo do evento de visualização no analytics.

A maior parte do código ainda está em estágio de **scaffold/esqueleto**. Este documento define o que falta para transformar a estrutura em um MVP integrado.

### 2.3 Correção da matriz de responsabilidade

O documento inicial possui uma inconsistência: a matriz nominal atribui módulos a determinados desenvolvedores, mas a árvore de branches apresentada no final troca alguns responsáveis.

Para evitar ambiguidade, a divisão oficial deste projeto será a seguinte:

| Desenvolvedor | Módulos oficiais |
|---|---|
| **Emanuel** | Módulo 4 — Interaction & Review Service; Módulo 5 — Analytics Engine |
| **Gustavo** | Módulo 2 — Auth & Profile Service; Módulo 6 — Curation & Notification Service |
| **João Ricardo** | Módulo 1A — Frontend Turista; Módulo 1B — Dashboards; Módulo 3 — Catalog & Geo Service |

Essa matriz prevalece sobre qualquer atribuição divergente encontrada em versões anteriores do documento.

---

## 3. Público-alvo e atores do sistema

### 3.1 Turista

Pessoa que deseja descobrir serviços, estabelecimentos, passeios, experiências e pontos de interesse próximos à sua localização.

Principais necessidades:

- pesquisar por categoria e distância;
- visualizar serviços no mapa;
- consultar detalhes e avaliações;
- entrar em contato com o prestador;
- avaliar uma experiência;
- encontrar informações confiáveis e atualizadas.

### 3.2 Empreendedor local

Abrange:

- barraqueiros e ambulantes;
- bugueiros e operadores de passeios;
- bares e restaurantes;
- artesãos e produtores locais;
- lojas, quiosques e serviços auxiliares.

Principais necessidades:

- cadastrar perfil e serviços;
- informar localização e área de atuação;
- receber aprovação de curadoria;
- acompanhar visualizações, contatos e avaliações;
- atualizar disponibilidade, preços e informações.

### 3.3 Curador

Responsável por verificar a confiabilidade dos perfis e manter a qualidade da plataforma.

Principais necessidades:

- listar cadastros pendentes;
- consultar documentos e informações;
- aprovar ou rejeitar cadastros;
- registrar justificativa;
- receber alertas de baixa avaliação ou conteúdo suspeito;
- consultar histórico de decisões.

### 3.4 Administrador técnico

Responsável pela operação da infraestrutura, observabilidade, bancos, RabbitMQ e correção de falhas. Não é necessariamente uma persona exposta no MVP.

---

## 4. Escopo do MVP

### 4.1 Funcionalidades obrigatórias

- cadastro e login;
- papéis `TOURIST`, `WORKER` e `CURATOR`;
- criação e edição de perfil;
- cadastro de perfil comercial e serviços;
- busca georreferenciada por raio, praia e categoria;
- mapa interativo;
- exibição pública apenas de perfis aprovados;
- avaliações de 1 a 5 estrelas;
- registro de clique para contato via WhatsApp;
- fluxo de curadoria com aprovação e rejeição;
- notificações internas ou simuladas;
- eventos assíncronos via RabbitMQ;
- analytics de visualizações, contatos e avaliações;
- dashboard do empreendedor;
- painel do curador;
- execução local completa por Docker Compose.

### 4.2 Fora do escopo obrigatório

- pagamentos;
- reservas com confirmação financeira;
- chat em tempo real dentro da plataforma;
- emissão fiscal;
- marketplace completo;
- recomendação por inteligência artificial;
- aplicação mobile nativa separada;
- integração com serviços governamentais reais;
- armazenamento de documentos em nuvem.

### 4.3 Estratégia mobile

O MVP será uma aplicação Angular responsiva e instalável como PWA. Uma etapa posterior poderá empacotar o frontend com **Ionic/Capacitor** para Android e iOS sem duplicar a camada de interface.

---

## 5. Requisitos não funcionais

| Categoria | Requisito |
|---|---|
| Disponibilidade | Falha do analytics não pode impedir busca, cadastro ou avaliações. |
| Tolerância a falhas | Eventos devem permanecer em filas duráveis e ser reprocessados. |
| Escalabilidade | Serviços devem poder ser escalados de forma independente. |
| Segurança | Senhas com hash, JWT, autorização por papel e validação de entrada. |
| Privacidade | Coletar apenas dados necessários e evitar exposição indevida de dados pessoais. |
| Desempenho | Busca geográfica paginada e indexada; resposta alvo de até 2 s em ambiente local. |
| Auditabilidade | Aprovações, rejeições e notificações devem ter histórico. |
| Observabilidade | Logs estruturados, correlation ID e endpoints de saúde. |
| Manutenibilidade | Cada serviço deve possuir domínio, banco e testes próprios. |
| Portabilidade | Todo o ecossistema deve iniciar com `docker compose up --build`. |
| Acessibilidade | Navegação por teclado, contraste e rótulos de formulário no frontend. |

---

## 6. Visão arquitetural

### 6.1 Estilo

A solução adota:

- **microserviços orientados a domínio**;
- **Database per Service** em nível lógico;
- comunicação síncrona via **REST/HTTP**;
- comunicação assíncrona via **RabbitMQ**;
- processamento de eventos com **at-least-once delivery**;
- consistência eventual entre catálogo, curadoria e analytics.

### 6.2 Diagrama de containers

```mermaid
flowchart LR
    U[Turista / Empreendedor / Curador] --> FE[Angular 18 / PWA]

    FE -->|REST + JWT| AUTH[Auth & Profile\nNestJS + PostgreSQL]
    FE -->|REST + JWT| CAT[Catalog & Geo\nNestJS + PostgreSQL/PostGIS]
    FE -->|REST + JWT| REV[Interaction & Review\nNestJS + PostgreSQL]
    FE -->|REST + JWT| CUR[Curation & Notification\nNestJS + PostgreSQL]
    FE -->|REST + JWT| ANA[Analytics Read API\nNestJS + MongoDB]

    CAT -->|eventos| RMQ[(RabbitMQ)]
    REV -->|eventos| RMQ
    CUR -->|eventos| RMQ
    AUTH -->|eventos opcionais| RMQ

    RMQ --> ANA
    RMQ --> CUR
    RMQ --> CAT

    AUTH --> DBA[(db_auth)]
    CAT --> DBC[(db_catalog + PostGIS)]
    REV --> DBR[(db_reviews)]
    CUR --> DBU[(db_curation)]
    ANA --> DBM[(db_analytics / MongoDB)]
```

### 6.3 Regra de comunicação

- REST é usado quando o usuário precisa de resposta imediata.
- RabbitMQ é usado para efeitos colaterais, métricas, notificações e sincronização eventual.
- Um serviço nunca acessa diretamente o banco de outro serviço.
- IDs externos podem ser armazenados, mas não recebem foreign key entre bancos.

---

## 7. Stack oficial

### 7.1 Frontend

- Angular 18;
- TypeScript 5.5+;
- Angular Router;
- Reactive Forms;
- RxJS;
- Angular Signals para estado local/global simples;
- Tailwind CSS ou SCSS, escolhendo um padrão único;
- Leaflet + OpenStreetMap para o MVP;
- PWA com `@angular/pwa`;
- testes com Jasmine/Karma ou Vitest, conforme configuração do projeto.

> O repositório atual declara Angular, mas ainda precisa adicionar as dependências de mapa, PWA e, caso mantido, Tailwind.

### 7.2 Backend

- Node.js 20 LTS recomendado;
- NestJS 10;
- TypeScript 5.7;
- Prisma 5 nos bancos PostgreSQL;
- Mongoose no MongoDB;
- `class-validator` e `class-transformer`;
- JWT + Passport;
- `@nestjs/microservices` com transporte RMQ;
- Swagger/OpenAPI em cada serviço HTTP.

### 7.3 Dados e infraestrutura

- PostgreSQL 15;
- PostGIS 3.3;
- MongoDB;
- RabbitMQ 3 Management;
- Docker e Docker Compose;
- GitHub Actions para lint, testes e build.

---

## 8. Convenções globais

### 8.1 Identificadores e datas

- IDs: UUID em formato string.
- Datas: UTC, ISO 8601.
- Campos de auditoria: `createdAt`, `updatedAt`.
- Exclusão lógica quando houver necessidade de histórico: `deletedAt` ou `isActive`.

### 8.2 Padrão de resposta REST

Resposta de sucesso:

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid"
  }
}
```

Resposta paginada:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "requestId": "uuid"
  }
}
```

Resposta de erro:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "rating",
        "message": "rating deve estar entre 1 e 5"
      }
    ]
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-06-28T12:00:00.000Z"
  }
}
```

### 8.3 Códigos HTTP

- `200`: consulta ou atualização bem-sucedida;
- `201`: recurso criado;
- `204`: operação sem corpo de resposta;
- `400`: entrada inválida;
- `401`: não autenticado;
- `403`: papel sem permissão;
- `404`: recurso inexistente;
- `409`: conflito ou duplicidade;
- `422`: regra de negócio não atendida;
- `500`: erro interno.

### 8.4 Paginação

Parâmetros padrão:

- `page`: padrão 1;
- `limit`: padrão 20, máximo 100;
- `sort`: campo permitido;
- `order`: `asc` ou `desc`.

### 8.5 Autenticação e autorização

Token JWT deve conter:

```json
{
  "sub": "user-uuid",
  "role": "WORKER",
  "email": "usuario@exemplo.com",
  "iat": 0,
  "exp": 0
}
```

Regras:

- `TOURIST`: busca, consulta, contato e avaliação;
- `WORKER`: gerencia apenas o próprio perfil e serviços;
- `CURATOR`: consulta e decide solicitações de curadoria;
- endpoints públicos devem ser explicitamente marcados;
- identidade do usuário deve vir do token, nunca de um `userId` confiado no body.

### 8.6 Correlation ID

- Header aceito: `x-correlation-id`.
- Se não vier, o serviço gera um UUID.
- O ID deve ser incluído em logs e eventos derivados.

---

## 9. Contrato de eventos RabbitMQ

### 9.1 Topologia

- Exchange principal: `praieira.events`.
- Tipo: `topic`.
- Durable: `true`.
- Filas duráveis por consumidor.

Filas mínimas:

| Fila | Binding keys | Consumidor |
|---|---|---|
| `analytics.events` | `profile.viewed.v1`, `review.submitted.v1`, `contact.clicked.v1` | service-analytics |
| `curation.events` | `worker.profile.submitted.v1`, `review.submitted.v1` | service-curation |
| `catalog.curation.events` | `worker.profile.approved.v1`, `worker.profile.rejected.v1` | service-catalog |
| `notification.events` | `notification.requested.v1` | service-curation |
| `*.dlq` | mensagens rejeitadas | inspeção/reprocessamento |

### 9.2 Envelope obrigatório

```ts
export interface DomainEvent<TPayload> {
  eventId: string;
  eventName: string;
  version: 1;
  occurredAt: string;
  correlationId: string;
  producer: string;
  actor?: {
    userId?: string;
    role?: 'TOURIST' | 'WORKER' | 'CURATOR' | 'SYSTEM';
  };
  payload: TPayload;
}
```

### 9.3 Regras de entrega

- filas e mensagens persistentes;
- confirmação manual após persistência bem-sucedida;
- `nack` com requeue para falhas transitórias;
- limite de tentativas por cabeçalho ou fila de retry;
- após o limite, mover para DLQ;
- consumidores devem ser idempotentes por `eventId`;
- nunca confirmar mensagem antes de concluir a transação local.

### 9.4 Eventos oficiais

#### `worker.profile.submitted.v1`

Produtor: Catalog.  
Consumidor: Curation.

```json
{
  "workerProfileId": "uuid",
  "ownerUserId": "uuid",
  "name": "Barraca Exemplo",
  "category": "BEACH_STALL",
  "beach": "PORTO_DE_GALINHAS",
  "submittedAt": "2026-06-28T12:00:00.000Z"
}
```

#### `worker.profile.approved.v1`

Produtor: Curation.  
Consumidores: Catalog e Notification.

```json
{
  "curationRequestId": "uuid",
  "workerProfileId": "uuid",
  "reviewerId": "uuid",
  "notes": "Documentação validada",
  "decidedAt": "2026-06-28T12:00:00.000Z"
}
```

#### `worker.profile.rejected.v1`

Produtor: Curation.  
Consumidores: Catalog e Notification.

```json
{
  "curationRequestId": "uuid",
  "workerProfileId": "uuid",
  "reviewerId": "uuid",
  "reasonCode": "INCOMPLETE_INFORMATION",
  "notes": "Informe um telefone válido",
  "decidedAt": "2026-06-28T12:00:00.000Z"
}
```

#### `profile.viewed.v1`

Produtor: Catalog.  
Consumidor: Analytics.

```json
{
  "workerProfileId": "uuid",
  "viewerUserId": "uuid-ou-null",
  "viewerRole": "TOURIST",
  "beach": "GAIBU",
  "source": "MAP",
  "viewedAt": "2026-06-28T12:00:00.000Z"
}
```

#### `review.submitted.v1`

Produtor: Reviews.  
Consumidores: Analytics e Curation.

```json
{
  "reviewId": "uuid",
  "workerProfileId": "uuid",
  "touristUserId": "uuid",
  "rating": 5,
  "hasComment": true,
  "submittedAt": "2026-06-28T12:00:00.000Z"
}
```

#### `contact.clicked.v1`

Produtor: Reviews/Interactions.  
Consumidor: Analytics.

```json
{
  "interactionId": "uuid",
  "workerProfileId": "uuid",
  "touristUserId": "uuid-ou-null",
  "channel": "WHATSAPP",
  "source": "PROFILE_DETAIL",
  "clickedAt": "2026-06-28T12:00:00.000Z"
}
```

#### `notification.requested.v1`

Produtores: Curation ou outros serviços autorizados.  
Consumidor: Curation/Notification.

```json
{
  "recipientUserId": "uuid",
  "type": "CURATION_APPROVED",
  "title": "Perfil aprovado",
  "message": "Seu perfil já está visível para turistas.",
  "channels": ["IN_APP"]
}
```

---

## 10. Estrutura recomendada do monorepo

```text
praieira-app/
├── docs/
│   ├── ARQUITETURA_DETALHADA.md
│   ├── EVENTOS.md
│   ├── API.md
│   └── diagrams/
├── packages/
│   └── contracts/
│       ├── src/events/
│       ├── src/enums/
│       ├── src/http/
│       └── package.json
├── frontend/
├── service-auth/
├── service-catalog/
├── service-reviews/
├── service-analytics/
├── service-curation/
├── scripts/
│   ├── wait-for-service.sh
│   └── smoke-test.sh
├── .github/workflows/ci.yml
├── docker-compose.yml
├── init-dbs.sql
├── .env.example
└── README.md
```

O pacote `packages/contracts` deve conter apenas tipos, enums e schemas compartilhados. Ele não deve conter regras de negócio nem acesso a banco.

---

# 11. Divisão oficial por desenvolvedor

## 11.1 Emanuel

### Módulo 4 — Interaction & Review Service

Responsável por:

- avaliações;
- média e distribuição de notas;
- registro de intenção de contato;
- publicação dos eventos de avaliação e contato;
- regras contra duplicidade e abuso básico;
- documentação Swagger do serviço;
- testes unitários e de integração do domínio.

### Módulo 5 — Analytics Engine

Responsável por:

- consumo de eventos;
- idempotência;
- persistência de eventos e agregados no MongoDB;
- métricas por empreendedor, praia e período;
- API de leitura protegida para dashboards;
- testes de consumidores e agregações;
- demonstração de tolerância a falhas do consumidor.

Branches:

- `feature/reviews-interactions`
- `feature/analytics-engine`

---

## 11.2 Gustavo

### Módulo 2 — Auth & Profile Service

Responsável por:

- cadastro;
- login;
- emissão e renovação de JWT;
- hash de senha;
- perfis básicos de usuário;
- guards e decorators reutilizáveis;
- papéis e autorização;
- documentação Swagger;
- testes de autenticação e autorização.

### Módulo 6 — Curation & Notification Service

Responsável por:

- criação de solicitações por evento;
- fila de pendências;
- aprovação e rejeição;
- histórico e auditoria;
- alertas de avaliações críticas;
- notificações in-app e adaptador simulado;
- publicação de eventos de decisão;
- testes de curadoria e idempotência.

Branches:

- `feature/auth-profile`
- `feature/curation-notifications`

---

## 11.3 João Ricardo

### Módulo 1A — Frontend Turista

Responsável por:

- shell da aplicação;
- navegação pública;
- autenticação no frontend;
- busca e filtros;
- mapa;
- detalhe do perfil;
- contato e avaliação;
- responsividade e acessibilidade.

### Módulo 1B — Dashboards

Responsável por:

- dashboard do empreendedor;
- painel do curador;
- métricas e gráficos;
- telas de aprovação e rejeição;
- guards de rota;
- estados de carregamento e erro.

### Módulo 3 — Catalog & Geo Service

Responsável por:

- cadastro comercial;
- serviços oferecidos;
- localização geográfica;
- busca por raio;
- filtros territoriais;
- status de publicação;
- emissão de visualizações e submissão para curadoria;
- consumo das decisões da curadoria;
- testes geoespaciais.

Branches:

- `feature/frontend-tourist`
- `feature/frontend-dashboards`
- `feature/catalog-geo`

---

## 11.4 Responsabilidades compartilhadas

| Atividade | Responsável principal | Revisores |
|---|---|---|
| Docker Compose e rede | Emanuel | Gustavo e João |
| Contratos de eventos | Emanuel | Gustavo e João |
| Padrão JWT/guards | Gustavo | Emanuel e João |
| Integração frontend/backend | João | Emanuel e Gustavo |
| Seed de demonstração | João | Emanuel e Gustavo |
| CI/CD | Emanuel | Gustavo |
| README e roteiro de execução | todos | todos |
| Teste ponta a ponta | todos | todos |
| Vídeo/apresentação | todos | todos |

---

# 12. Módulo 1 — Frontend Angular

## 12.1 Objetivo

Fornecer uma SPA responsiva para turista, empreendedor e curador, com navegação baseada em papel e consumo dos cinco serviços.

## 12.2 Estrutura recomendada

```text
frontend/src/app/
├── core/
│   ├── auth/
│   ├── guards/
│   ├── interceptors/
│   ├── http/
│   ├── layout/
│   └── models/
├── shared/
│   ├── components/
│   ├── directives/
│   ├── pipes/
│   └── ui/
├── features/
│   ├── home/
│   ├── auth/
│   ├── catalog/
│   ├── worker-profile/
│   ├── reviews/
│   ├── entrepreneur-dashboard/
│   └── curator-dashboard/
├── app.routes.ts
└── app.config.ts
```

## 12.3 Rotas

| Rota | Acesso | Tela |
|---|---|---|
| `/` | público | página inicial e busca rápida |
| `/login` | público | login |
| `/cadastro` | público | cadastro de turista ou empreendedor |
| `/explorar` | público | mapa, lista e filtros |
| `/perfil/:id` | público | detalhe do prestador |
| `/perfil/:id/avaliar` | `TOURIST` | formulário de avaliação |
| `/empreendedor/cadastro` | `WORKER` | cadastro comercial |
| `/empreendedor/servicos` | `WORKER` | CRUD de serviços |
| `/empreendedor/dashboard` | `WORKER` | métricas |
| `/curadoria/pendentes` | `CURATOR` | lista de pendências |
| `/curadoria/:id` | `CURATOR` | análise de solicitação |
| `/minha-conta` | autenticado | perfil básico |
| `/**` | público | página não encontrada |

## 12.4 Componentes obrigatórios

- `AppShellComponent`;
- `HeaderComponent`;
- `BeachSelectorComponent`;
- `CategoryFilterComponent`;
- `RadiusFilterComponent`;
- `CatalogMapComponent`;
- `CatalogListComponent`;
- `WorkerCardComponent`;
- `WorkerDetailComponent`;
- `ReviewFormComponent`;
- `RatingStarsComponent`;
- `EntrepreneurSummaryCardsComponent`;
- `MetricsChartComponent`;
- `CurationQueueComponent`;
- `CurationDecisionDialogComponent`;
- `LoadingStateComponent`;
- `EmptyStateComponent`;
- `ErrorStateComponent`.

## 12.5 Serviços Angular

- `AuthApiService`;
- `CatalogApiService`;
- `ReviewsApiService`;
- `CurationApiService`;
- `AnalyticsApiService`;
- `AuthStore` com Signals;
- `LocationService` para geolocalização do navegador;
- `NotificationService` para mensagens de interface.

## 12.6 Regras de interface

- lista e mapa devem compartilhar o mesmo conjunto de filtros;
- falha na geolocalização deve permitir seleção manual de praia;
- botão de WhatsApp só aparece quando houver número válido;
- após clicar, primeiro registrar a interação e depois abrir o link;
- perfil pendente ou rejeitado não pode ser exibido na busca pública;
- tela de dashboard deve filtrar por 7, 30 e 90 dias;
- nenhuma tela pode depender de dados mockados na entrega final;
- toda chamada deve apresentar loading, empty state e tratamento de erro.

## 12.7 Critérios de aceite

- usuário consegue concluir o fluxo busca → detalhe → contato;
- turista autenticado consegue avaliar;
- empreendedor consegue cadastrar perfil e visualizar status;
- curador consegue aprovar/rejeitar pelo frontend;
- dashboard exibe dados reais do analytics;
- interface funciona em 360 px e desktop;
- rotas protegidas bloqueiam papéis incorretos;
- build de produção executa sem erro.

## 12.8 Contexto pronto do módulo

```text
Você é responsável pelo Frontend Angular 18 do Praieira App. Implemente uma SPA responsiva e acessível para os papéis TOURIST, WORKER e CURATOR. Use standalone components, Angular Router, Reactive Forms, RxJS e Signals. Integre exclusivamente por REST com os serviços auth, catalog, reviews, curation e analytics. Crie interceptor JWT, guards por papel, estados de loading/erro/vazio e mapa Leaflet. Não use dados mockados na versão final. Respeite as rotas, componentes, contratos HTTP e critérios de aceite definidos no documento ARQUITETURA_DETALHADA_PRAIEIRA_APP.md.
```

---

# 13. Módulo 2 — Auth & Profile Service

**Responsável:** Gustavo  
**Porta:** 3001  
**Banco:** `db_auth`

## 13.1 Limites do domínio

Este serviço possui:

- credenciais;
- papel do usuário;
- dados pessoais básicos;
- refresh tokens ou sessões;
- autorização.

Este serviço não possui:

- perfil comercial geográfico;
- serviços oferecidos;
- avaliações;
- status de curadoria;
- métricas.

## 13.2 Dependências a adicionar

- `@nestjs/jwt`;
- `@nestjs/passport`;
- `passport`;
- `passport-jwt`;
- `cookie-parser`, caso refresh token use cookie;
- `@nestjs/swagger`;
- `helmet`.

## 13.3 Modelo de dados proposto

```prisma
enum Role {
  TOURIST
  WORKER
  CURATOR
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         Role     @default(TOURIST)
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  profile      Profile?
  sessions     RefreshSession[]

  @@map("users")
}

model Profile {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  name      String
  bio       String?
  phone     String?
  avatarUrl String?  @map("avatar_url")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model RefreshSession {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  tokenHash String   @map("token_hash")
  expiresAt DateTime @map("expires_at")
  revokedAt DateTime? @map("revoked_at")
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_sessions")
}
```

## 13.4 Endpoints

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/auth/register` | público | cria usuário e perfil |
| `POST` | `/auth/login` | público | valida credenciais e emite tokens |
| `POST` | `/auth/refresh` | público com refresh | renova access token |
| `POST` | `/auth/logout` | autenticado | revoga sessão |
| `GET` | `/auth/me` | autenticado | retorna identidade atual |
| `GET` | `/profiles/:id` | autenticado ou público limitado | consulta perfil básico |
| `PATCH` | `/profiles/me` | autenticado | atualiza perfil próprio |
| `GET` | `/health` | público | saúde do serviço |

## 13.5 DTO de cadastro

```ts
interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: 'TOURIST' | 'WORKER';
  phone?: string;
}
```

Validações:

- email normalizado em lowercase;
- senha com mínimo de 8 caracteres;
- não permitir cadastro público como `CURATOR`;
- email único;
- telefone normalizado quando informado;
- hash com bcrypt, custo adequado ao ambiente.

## 13.6 Regras de segurança

- nunca retornar hash de senha;
- `JWT_SECRET` obrigatório fora de teste;
- access token curto, por exemplo 15 minutos;
- refresh token revogável;
- login deve usar mensagem genérica para email/senha inválidos;
- rate limiting recomendado no login;
- CORS restrito às origens configuradas;
- `CURATOR` deve ser criado via seed ou comando administrativo.

## 13.7 Testes obrigatórios

- cadastro de turista;
- cadastro de empreendedor;
- bloqueio de email duplicado;
- bloqueio de papel `CURATOR` no cadastro público;
- login válido e inválido;
- acesso com token expirado;
- atualização do próprio perfil;
- tentativa de atualizar perfil de terceiro;
- refresh e logout.

## 13.8 Critérios de aceite

- login retorna token utilizável nos outros serviços;
- roles são lidas por guard;
- senha não aparece em logs ou respostas;
- migrations recriam o banco do zero;
- Swagger descreve todos os endpoints;
- cobertura mínima acordada para regras críticas.

## 13.9 Contexto pronto do módulo

```text
Você é responsável pelo service-auth do Praieira App. Implemente autenticação e perfil básico em NestJS 10, Prisma e PostgreSQL. Use JWT, refresh token revogável, bcrypt, guards e roles TOURIST, WORKER e CURATOR. Não armazene perfil comercial, geolocalização, avaliações ou curadoria neste serviço. Implemente os endpoints, modelos, validações, testes e critérios de aceite da seção Módulo 2 do documento ARQUITETURA_DETALHADA_PRAIEIRA_APP.md. Preserve o padrão global de erros, correlation ID e Swagger.
```

---

# 14. Módulo 3 — Catalog & Geo Service

**Responsável:** João Ricardo  
**Porta:** 3002  
**Banco:** `db_catalog` com PostGIS

## 14.1 Limites do domínio

Possui:

- perfil comercial;
- categoria;
- praia;
- localização;
- serviços oferecidos;
- disponibilidade;
- status de publicação;
- busca geográfica.

Não possui:

- credenciais;
- texto completo das avaliações;
- histórico de curadoria;
- agregados de analytics.

## 14.2 Enums

```ts
type Beach =
  | 'GAIBU'
  | 'PORTO_DE_GALINHAS'
  | 'CARNEIROS'
  | 'BOA_VIAGEM';

type WorkerCategory =
  | 'BEACH_STALL'
  | 'STREET_VENDOR'
  | 'BUGGY_TOUR'
  | 'TOUR_OPERATOR'
  | 'BAR'
  | 'RESTAURANT'
  | 'ARTISAN'
  | 'LOCAL_STORE'
  | 'KIOSK'
  | 'AUXILIARY_SERVICE';

type PublicationStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';
```

## 14.3 Modelo proposto

```prisma
model WorkerProfile {
  id                String   @id @default(uuid())
  ownerUserId       String   @unique @map("owner_user_id")
  name              String
  slug              String   @unique
  description       String?
  category          String
  phone             String?
  whatsapp          String?
  beach             String
  addressText       String?  @map("address_text")
  latitude          Decimal  @db.Decimal(9, 6)
  longitude         Decimal  @db.Decimal(9, 6)
  publicationStatus String   @default("DRAFT") @map("publication_status")
  isActive          Boolean  @default(true) @map("is_active")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  services          ServiceItem[]

  @@index([beach, category, publicationStatus])
  @@map("worker_profiles")
}

model ServiceItem {
  id          String   @id @default(uuid())
  workerId    String   @map("worker_id")
  title       String
  description String?
  priceInCents Int?    @map("price_in_cents")
  category    String
  isAvailable Boolean  @default(true) @map("is_available")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  worker      WorkerProfile @relation(fields: [workerId], references: [id], onDelete: Cascade)

  @@index([workerId, isAvailable])
  @@map("service_items")
}
```

Além das colunas Prisma, criar por migration SQL:

```sql
ALTER TABLE worker_profiles
ADD COLUMN location geography(Point, 4326);

UPDATE worker_profiles
SET location = ST_SetSRID(ST_MakePoint(longitude::double precision, latitude::double precision), 4326)::geography;

CREATE INDEX worker_profiles_location_gix
ON worker_profiles USING GIST (location);
```

Ao criar ou atualizar latitude/longitude, atualizar `location` na mesma transação.

## 14.4 Endpoints

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/catalog/search` | público | busca por geografia e filtros |
| `GET` | `/catalog/workers/:id` | público | detalhe e emissão de visualização |
| `POST` | `/catalog/workers` | `WORKER` | cria perfil comercial próprio |
| `PATCH` | `/catalog/workers/me` | `WORKER` | atualiza perfil próprio |
| `POST` | `/catalog/workers/me/submit` | `WORKER` | envia para curadoria |
| `GET` | `/catalog/workers/me` | `WORKER` | consulta perfil e status próprios |
| `POST` | `/catalog/workers/me/services` | `WORKER` | cria item de serviço |
| `PATCH` | `/catalog/workers/me/services/:id` | `WORKER` | atualiza item próprio |
| `DELETE` | `/catalog/workers/me/services/:id` | `WORKER` | remove/desativa item próprio |
| `GET` | `/catalog/categories` | público | lista categorias |
| `GET` | `/catalog/beaches` | público | lista praias |
| `GET` | `/health` | público | saúde do serviço |

## 14.5 Busca geográfica

Parâmetros:

```text
lat: number obrigatório quando usar proximidade
lng: number obrigatório quando usar proximidade
radiusMeters: number padrão 5000, máximo 50000
beach: Beach opcional
category: WorkerCategory opcional
query: string opcional
page: number
limit: number
sort: distance | rating | newest
```

Consulta base:

```sql
SELECT
  wp.*,
  ST_Distance(
    wp.location,
    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
  ) AS distance_meters
FROM worker_profiles wp
WHERE wp.publication_status = 'APPROVED'
  AND wp.is_active = true
  AND ST_DWithin(
    wp.location,
    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
    $3
  )
ORDER BY distance_meters ASC
LIMIT $4 OFFSET $5;
```

## 14.6 Regras de negócio

- um usuário `WORKER` só pode ter um perfil comercial no MVP;
- perfil novo começa como `DRAFT`;
- submissão exige nome, categoria, praia, localização e contato;
- submissão altera para `PENDING` e publica `worker.profile.submitted.v1`;
- perfil `PENDING` não pode ser editado, salvo cancelamento explícito;
- apenas `APPROVED` aparece em endpoints públicos;
- ao receber aprovação/rejeição, atualizar status de forma idempotente;
- `GET /catalog/workers/:id` publica `profile.viewed.v1` somente para perfil aprovado;
- falha ao publicar métrica não deve impedir a resposta, mas deve ser registrada e tratada com outbox ou retry.

## 14.7 Confiabilidade recomendada: Outbox

Para evitar salvar o perfil e perder o evento, criar `OutboxEvent` no banco do catálogo na mesma transação. Um worker local publica eventos pendentes e marca `publishedAt`.

O MVP pode usar publicação direta, mas a demonstração de corretude distribuída fica melhor com outbox.

## 14.8 Testes obrigatórios

- criar perfil próprio;
- bloquear segundo perfil;
- validar coordenadas;
- buscar dentro e fora do raio;
- filtrar por praia e categoria;
- impedir perfil pendente na busca pública;
- publicar evento de submissão;
- consumir aprovação e rejeição idempotentemente;
- impedir alteração de serviço de outro empreendedor;
- publicar visualização ao abrir detalhe.

## 14.9 Critérios de aceite

- busca retorna distância em metros;
- índice geográfico existe;
- somente aprovados aparecem;
- eventos possuem envelope padrão;
- migrations funcionam em container limpo;
- Swagger documenta filtros e respostas.

## 14.10 Contexto pronto do módulo

```text
Você é responsável pelo service-catalog do Praieira App. Implemente catálogo comercial e busca georreferenciada em NestJS 10, Prisma, PostgreSQL e PostGIS. O serviço deve cadastrar um perfil comercial por WORKER, gerenciar itens de serviço, controlar DRAFT/PENDING/APPROVED/REJECTED/SUSPENDED, buscar por raio e publicar profile.viewed.v1 e worker.profile.submitted.v1. Consuma decisões da curadoria de forma idempotente. Somente perfis APPROVED podem ser públicos. Implemente os endpoints, modelo, migration PostGIS, testes e critérios da seção Módulo 3 do documento de arquitetura.
```

---

# 15. Módulo 4 — Interaction & Review Service

**Responsável:** Emanuel  
**Porta:** 3003  
**Banco:** `db_reviews`

## 15.1 Limites do domínio

Possui:

- avaliações;
- nota e comentário;
- interações de contato;
- resumo de avaliações por perfil;
- eventos de interação.

Não possui:

- dados cadastrais completos do turista;
- dados do catálogo;
- agregados gerais de analytics.

## 15.2 Modelo proposto

```prisma
model Review {
  id              String   @id @default(uuid())
  rating          Int
  comment         String?
  workerProfileId String   @map("worker_profile_id")
  touristUserId   String   @map("tourist_user_id")
  status          String   @default("PUBLISHED")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@unique([workerProfileId, touristUserId])
  @@index([workerProfileId, status, createdAt])
  @@map("reviews")
}

model Interaction {
  id              String   @id @default(uuid())
  type            String
  channel         String
  source          String?
  workerProfileId String   @map("worker_profile_id")
  touristUserId   String?  @map("tourist_user_id")
  metadata        Json?
  createdAt       DateTime @default(now()) @map("created_at")

  @@index([workerProfileId, type, createdAt])
  @@map("interactions")
}
```

Adicionar constraint SQL para nota:

```sql
ALTER TABLE reviews
ADD CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5);
```

## 15.3 Endpoints

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/reviews` | `TOURIST` | cria avaliação |
| `PATCH` | `/reviews/:id` | autor | atualiza avaliação própria |
| `DELETE` | `/reviews/:id` | autor ou curador | remove/modera avaliação |
| `GET` | `/reviews/worker/:workerProfileId` | público | lista avaliações |
| `GET` | `/reviews/worker/:workerProfileId/summary` | público | média e distribuição |
| `POST` | `/interactions/contact/:workerProfileId` | público/autenticado | registra contato |
| `GET` | `/health` | público | saúde do serviço |

## 15.4 DTO de avaliação

```ts
interface CreateReviewDto {
  workerProfileId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}
```

## 15.5 Regras de negócio

- apenas `TOURIST` pode criar avaliação;
- ID do turista vem do JWT;
- uma avaliação por turista e perfil no MVP;
- comentário com limite configurado, por exemplo 1000 caracteres;
- não aceitar comentário vazio formado apenas por espaços;
- o serviço deve validar a existência pública do perfil via Catalog ou aceitar consistência eventual conforme contrato de integração;
- criação publica `review.submitted.v1`;
- atualização pode publicar `review.updated.v1` se implementado;
- contato registra primeiro e retorna `contactUrl` sanitizada;
- clique publica `contact.clicked.v1`;
- número de WhatsApp deve vir do catálogo ou ser enviado pelo frontend apenas como dado não confiável; o ideal é consultar o catálogo.

## 15.6 Resumo de avaliações

Resposta:

```json
{
  "data": {
    "workerProfileId": "uuid",
    "averageRating": 4.4,
    "totalReviews": 120,
    "distribution": {
      "1": 2,
      "2": 4,
      "3": 10,
      "4": 30,
      "5": 74
    }
  }
}
```

## 15.7 Testes obrigatórios

- nota mínima e máxima;
- bloqueio de nota inválida;
- bloqueio de usuário sem papel turista;
- bloqueio de avaliação duplicada;
- edição pelo autor;
- bloqueio de edição por terceiro;
- cálculo correto da média;
- registro de contato anônimo e autenticado;
- publicação de ambos os eventos;
- comportamento quando RabbitMQ está temporariamente indisponível.

## 15.8 Critérios de aceite

- constraint de nota existe no banco;
- eventos são publicados após persistência;
- resumo não exige carregar todos os registros na aplicação;
- endpoints paginados;
- Swagger completo;
- testes cobrem regras principais.

## 15.9 Contexto pronto do módulo

```text
Você é responsável pelo service-reviews do Praieira App. Implemente avaliações e interações em NestJS 10, Prisma e PostgreSQL. Apenas TOURIST cria uma avaliação, com nota entre 1 e 5 e uma avaliação por perfil no MVP. Registre cliques de contato, publique review.submitted.v1 e contact.clicked.v1, ofereça listagem paginada e resumo agregado. Use o usuário do JWT, nunca confie em touristUserId no body. Implemente modelos, constraints, endpoints, testes, Swagger e critérios da seção Módulo 4 do documento de arquitetura.
```

---

# 16. Módulo 5 — Analytics Engine

**Responsável:** Emanuel  
**Porta:** 3005 para API de leitura  
**Banco:** MongoDB `db_analytics`

## 16.1 Objetivo

Consumir eventos sem impactar os fluxos transacionais e fornecer métricas para empreendedores e visão territorial futura.

## 16.2 Decisão importante

O documento inicial descreve o serviço como consumidor sem endpoints HTTP públicos. Porém, o frontend possui um dashboard de métricas. Portanto:

- o serviço continua sem endpoints HTTP de escrita;
- passa a expor **endpoints protegidos de leitura**;
- toda escrita de analytics ocorre exclusivamente por eventos.

## 16.3 Collections

### `processed_events`

```ts
{
  eventId: string;
  eventName: string;
  processedAt: Date;
}
```

Índice único em `eventId`.

### `raw_events`

```ts
{
  eventId: string;
  eventName: string;
  occurredAt: Date;
  producer: string;
  actor: object;
  payload: object;
  correlationId: string;
}
```

### `worker_daily_metrics`

```ts
{
  workerProfileId: string;
  beach: string;
  date: string;
  profileViews: number;
  whatsappClicks: number;
  reviewsCount: number;
  ratingSum: number;
  ratingAverage: number;
  uniqueViewers: number;
  updatedAt: Date;
}
```

Índice único composto em `workerProfileId + date`.

### `beach_daily_metrics`

```ts
{
  beach: string;
  date: string;
  profileViews: number;
  contactClicks: number;
  reviewsCount: number;
  activeProfilesObserved: number;
}
```

## 16.4 Consumidores

- `handleProfileViewed`;
- `handleReviewSubmitted`;
- `handleContactClicked`.

Fluxo de processamento:

1. validar envelope e versão;
2. verificar `processed_events`;
3. persistir raw event, caso adotado;
4. atualizar agregado com operação atômica `$inc`/upsert;
5. registrar evento processado;
6. confirmar mensagem;
7. em erro, aplicar retry ou DLQ.

## 16.5 Endpoints de leitura

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/analytics/workers/:id/summary` | dono ou `CURATOR` | visão geral |
| `GET` | `/analytics/workers/:id/timeseries` | dono ou `CURATOR` | série temporal |
| `GET` | `/analytics/beaches/:beach/summary` | `CURATOR` | visão territorial |
| `GET` | `/analytics/health` | público | saúde HTTP |
| RMQ | health interno | operação | estado do consumidor |

Parâmetros de período:

- `from`;
- `to`;
- limite máximo de 365 dias;
- padrão de 30 dias.

## 16.6 Resposta de resumo

```json
{
  "data": {
    "workerProfileId": "uuid",
    "period": {
      "from": "2026-06-01",
      "to": "2026-06-30"
    },
    "profileViews": 900,
    "whatsappClicks": 180,
    "reviewsCount": 32,
    "averageRating": 4.7,
    "contactConversionRate": 0.2
  }
}
```

`contactConversionRate = whatsappClicks / profileViews`, retornando zero quando não houver visualizações.

## 16.7 Autorização

Como cada banco é isolado, o analytics recebe o JWT e verifica:

- `CURATOR`: acesso permitido conforme rota;
- `WORKER`: só pode consultar seu próprio `workerProfileId`.

Para relacionar `userId` e `workerProfileId`, existem duas opções:

1. consulta interna ao Catalog;
2. projeção local alimentada por eventos de perfil.

Para o MVP, usar consulta interna ao Catalog com timeout curto. Para evolução, criar projeção local.

## 16.8 Testes obrigatórios

- consumo de cada evento;
- rejeição de envelope inválido;
- idempotência de evento duplicado;
- agregação diária;
- cálculo de média e conversão;
- retry e DLQ;
- recuperação após indisponibilidade;
- autorização de dashboard;
- consulta por período.

## 16.9 Demonstração de sistema distribuído

Roteiro recomendado:

1. iniciar todos os containers;
2. interromper `service-analytics`;
3. gerar visualizações, contatos e avaliações;
4. mostrar mensagens acumuladas no RabbitMQ;
5. iniciar novamente o analytics;
6. mostrar consumo das mensagens e atualização do dashboard;
7. provar ausência de perda de dados.

## 16.10 Critérios de aceite

- evento duplicado não duplica métrica;
- queda do consumidor não derruba os produtores;
- filas são duráveis;
- dashboard lê dados agregados reais;
- série temporal respeita período;
- logs incluem eventId e correlationId.

## 16.11 Contexto pronto do módulo

```text
Você é responsável pelo service-analytics do Praieira App. Implemente um consumidor NestJS com RabbitMQ e MongoDB/Mongoose. Consuma profile.viewed.v1, review.submitted.v1 e contact.clicked.v1, processe com confirmação manual e idempotência por eventId, mantenha agregados diários e exponha apenas endpoints REST protegidos de leitura para dashboards. A escrita deve ocorrer somente por eventos. Implemente retry/DLQ, métricas, testes e o roteiro de tolerância a falhas da seção Módulo 5 do documento de arquitetura.
```

---

# 17. Módulo 6 — Curation & Notification Service

**Responsável:** Gustavo  
**Porta:** 3004  
**Banco:** `db_curation`

## 17.1 Limites do domínio

Possui:

- solicitação de curadoria;
- decisão e justificativa;
- histórico de auditoria;
- alertas de moderação;
- notificações internas;
- eventos de aprovação e rejeição.

Não possui:

- dados completos do catálogo;
- credenciais;
- avaliações completas;
- métricas agregadas.

## 17.2 Modelo proposto

```prisma
enum CurationStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

model CurationRequest {
  id              String          @id @default(uuid())
  workerProfileId String          @map("worker_profile_id")
  ownerUserId     String          @map("owner_user_id")
  status          CurationStatus  @default(PENDING)
  reviewerUserId  String?         @map("reviewer_user_id")
  reasonCode      String?         @map("reason_code")
  notes           String?
  sourceEventId   String          @unique @map("source_event_id")
  decidedAt       DateTime?       @map("decided_at")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")
  history         CurationHistory[]

  @@index([status, createdAt])
  @@index([workerProfileId])
  @@map("curation_requests")
}

model CurationHistory {
  id          String   @id @default(uuid())
  requestId   String   @map("request_id")
  fromStatus  String?  @map("from_status")
  toStatus    String   @map("to_status")
  actorUserId String?  @map("actor_user_id")
  notes       String?
  createdAt   DateTime @default(now()) @map("created_at")
  request     CurationRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  @@map("curation_history")
}

model ModerationAlert {
  id              String   @id @default(uuid())
  type            String
  workerProfileId String   @map("worker_profile_id")
  sourceEventId   String   @unique @map("source_event_id")
  severity        String
  status          String   @default("OPEN")
  payload         Json?
  createdAt       DateTime @default(now()) @map("created_at")
  resolvedAt      DateTime? @map("resolved_at")

  @@index([status, severity])
  @@map("moderation_alerts")
}

model Notification {
  id              String   @id @default(uuid())
  recipientUserId String   @map("recipient_user_id")
  type            String
  title           String
  message         String
  channel         String   @default("IN_APP")
  status          String   @default("PENDING")
  readAt          DateTime? @map("read_at")
  sentAt          DateTime? @map("sent_at")
  createdAt       DateTime @default(now()) @map("created_at")

  @@index([recipientUserId, readAt, createdAt])
  @@map("notifications")
}
```

## 17.3 Endpoints

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/curation/pending` | `CURATOR` | lista pendências |
| `GET` | `/curation/requests/:id` | `CURATOR` | detalhe e histórico |
| `POST` | `/curation/requests/:id/approve` | `CURATOR` | aprova |
| `POST` | `/curation/requests/:id/reject` | `CURATOR` | rejeita |
| `GET` | `/curation/history` | `CURATOR` | pesquisa decisões |
| `GET` | `/curation/alerts` | `CURATOR` | lista alertas |
| `PATCH` | `/curation/alerts/:id/resolve` | `CURATOR` | encerra alerta |
| `GET` | `/notifications/me` | autenticado | notificações do usuário |
| `PATCH` | `/notifications/:id/read` | destinatário | marca como lida |
| `GET` | `/health` | público | saúde do serviço |

## 17.4 Consumidores

### `worker.profile.submitted.v1`

- criar solicitação pendente;
- usar `sourceEventId` único para idempotência;
- não duplicar solicitação ativa do mesmo perfil.

### `review.submitted.v1`

- quando `rating <= 2`, criar alerta de moderação;
- a regra pode exigir duas ou mais avaliações baixas em janela de tempo em uma evolução;
- no MVP, registrar alerta sem suspender automaticamente o perfil.

### `notification.requested.v1`

- persistir notificação;
- marcar como enviada no canal `IN_APP`;
- adaptadores de email/SMS são opcionais.

## 17.5 Aprovação

Transação local:

1. validar status `PENDING`;
2. atualizar para `APPROVED`;
3. definir curador e `decidedAt`;
4. inserir histórico;
5. publicar `worker.profile.approved.v1`;
6. criar/publicar notificação.

Rejeição exige:

- `reasonCode`;
- notas claras para correção;
- publicação de `worker.profile.rejected.v1`.

## 17.6 Testes obrigatórios

- criação por evento;
- idempotência do evento de submissão;
- listagem paginada;
- aprovação e rejeição;
- bloqueio de dupla decisão;
- autorização por papel;
- histórico de decisão;
- criação de alerta de nota baixa;
- notificação do empreendedor;
- publicação dos eventos corretos.

## 17.7 Critérios de aceite

- somente curador decide;
- decisão é auditável;
- perfil aprovado é refletido no catálogo por evento;
- perfil rejeitado recebe justificativa;
- evento duplicado não duplica solicitação;
- notificações ficam consultáveis.

## 17.8 Contexto pronto do módulo

```text
Você é responsável pelo service-curation do Praieira App. Implemente curadoria e notificações em NestJS 10, Prisma e PostgreSQL. Consuma worker.profile.submitted.v1 de forma idempotente, permita apenas CURATOR aprovar ou rejeitar, registre histórico e publique worker.profile.approved.v1 ou worker.profile.rejected.v1. Consuma avaliações baixas para criar alertas e implemente notificações in-app. Respeite os modelos, endpoints, transações, testes e critérios da seção Módulo 6 do documento de arquitetura.
```

---

# 18. Fluxos ponta a ponta

## 18.1 Cadastro e publicação de empreendedor

```mermaid
sequenceDiagram
    actor W as Empreendedor
    participant F as Frontend
    participant A as Auth
    participant C as Catalog
    participant R as RabbitMQ
    participant U as Curation

    W->>F: cria conta WORKER
    F->>A: POST /auth/register
    A-->>F: JWT + perfil básico
    W->>F: preenche perfil comercial
    F->>C: POST /catalog/workers
    C-->>F: perfil DRAFT
    F->>C: POST /catalog/workers/me/submit
    C->>R: worker.profile.submitted.v1
    C-->>F: status PENDING
    R->>U: entrega evento
    U->>U: cria solicitação
    U->>R: worker.profile.approved.v1
    R->>C: atualiza para APPROVED
    U->>R: notification.requested.v1
```

## 18.2 Busca, visualização e contato

```mermaid
sequenceDiagram
    actor T as Turista
    participant F as Frontend
    participant C as Catalog
    participant I as Reviews/Interactions
    participant R as RabbitMQ
    participant A as Analytics

    T->>F: permite localização
    F->>C: GET /catalog/search
    C-->>F: perfis aprovados por distância
    T->>F: abre perfil
    F->>C: GET /catalog/workers/:id
    C->>R: profile.viewed.v1
    C-->>F: detalhes
    R->>A: processa visualização
    T->>F: clicar WhatsApp
    F->>I: POST /interactions/contact/:id
    I->>R: contact.clicked.v1
    I-->>F: contactUrl
    F->>F: abre WhatsApp
```

## 18.3 Avaliação e alerta

```mermaid
sequenceDiagram
    actor T as Turista
    participant F as Frontend
    participant I as Reviews
    participant R as RabbitMQ
    participant A as Analytics
    participant U as Curation

    T->>F: envia nota e comentário
    F->>I: POST /reviews
    I->>I: persiste avaliação
    I->>R: review.submitted.v1
    I-->>F: avaliação criada
    R->>A: agrega métrica
    R->>U: verifica nota baixa
    U->>U: cria alerta se rating <= 2
```

---

# 19. Configuração e variáveis de ambiente

## 19.1 `.env.example`

```dotenv
NODE_ENV=development

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
RABBITMQ_EXCHANGE=praieira.events

JWT_SECRET=replace-me
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

AUTH_DATABASE_URL=postgresql://postgres:postgres@postgres_db:5432/db_auth?schema=public
CATALOG_DATABASE_URL=postgresql://postgres:postgres@postgres_db:5432/db_catalog?schema=public
REVIEWS_DATABASE_URL=postgresql://postgres:postgres@postgres_db:5432/db_reviews?schema=public
CURATION_DATABASE_URL=postgresql://postgres:postgres@postgres_db:5432/db_curation?schema=public
MONGO_URL=mongodb://mongo_db:27017/db_analytics

AUTH_SERVICE_URL=http://service-auth:3001
CATALOG_SERVICE_URL=http://service-catalog:3002
REVIEWS_SERVICE_URL=http://service-reviews:3003
CURATION_SERVICE_URL=http://service-curation:3004
ANALYTICS_SERVICE_URL=http://service-analytics:3005

FRONTEND_ORIGIN=http://localhost:4200
```

## 19.2 Melhorias no Docker Compose

- não manter segredos reais no arquivo;
- adicionar healthcheck aos cinco serviços;
- usar `depends_on.condition: service_healthy` quando aplicável;
- executar migrations antes de iniciar cada serviço;
- fixar versão da imagem MongoDB em vez de `latest`;
- persistir RabbitMQ em volume;
- adicionar `restart: unless-stopped` em ambiente de demonstração;
- disponibilizar Swagger nas portas de cada serviço;
- opcionalmente incluir Nginx como reverse proxy.

---

# 20. Observabilidade

## 20.1 Logs

Formato JSON recomendado:

```json
{
  "level": "info",
  "service": "service-catalog",
  "message": "worker profile submitted",
  "requestId": "uuid",
  "correlationId": "uuid",
  "userId": "uuid",
  "workerProfileId": "uuid",
  "timestamp": "2026-06-28T12:00:00.000Z"
}
```

Não registrar:

- senhas;
- tokens completos;
- documentos pessoais;
- comentários sensíveis além do necessário.

## 20.2 Saúde

Cada serviço HTTP deve possuir:

- `GET /health/live`;
- `GET /health/ready`.

`ready` verifica banco e, para produtores/consumidores, conexão com RabbitMQ.

## 20.3 Métricas mínimas

- quantidade de requests;
- latência;
- erros por rota;
- mensagens consumidas;
- mensagens com falha;
- tamanho de fila observado no RabbitMQ;
- tempo de processamento de evento.

Prometheus/Grafana são evolução opcional, não bloqueadores do MVP.

---

# 21. Segurança e privacidade

- validar todos os DTOs;
- usar `ValidationPipe` com `whitelist`, `forbidNonWhitelisted` e `transform`;
- ativar Helmet;
- limitar tamanho de body;
- configurar CORS por ambiente;
- usar consultas parametrizadas;
- não confiar em IDs de usuário enviados pelo cliente;
- verificar propriedade antes de atualizar recursos;
- limitar tentativas de login;
- limitar frequência de avaliações e cliques abusivos;
- manter mensagens de erro sem detalhes internos;
- aplicar princípio de menor privilégio;
- permitir desativação de conta em evolução posterior;
- tratar telefone e localização como dados pessoais;
- coletar consentimento para geolocalização do turista.

---

# 22. Estratégia de testes

## 22.1 Pirâmide

1. testes unitários de serviços e regras;
2. testes de integração com banco e RabbitMQ;
3. testes de contrato dos eventos;
4. testes E2E dos fluxos principais;
5. smoke test em Docker Compose.

## 22.2 Casos E2E mínimos

### E2E-01 — Empreendedor aprovado

- cadastrar worker;
- criar perfil comercial;
- enviar para curadoria;
- aprovar;
- confirmar aparição na busca.

### E2E-02 — Avaliação

- cadastrar turista;
- buscar perfil;
- avaliar;
- confirmar média;
- confirmar métrica no analytics.

### E2E-03 — Contato

- abrir perfil;
- registrar clique;
- confirmar evento e conversão.

### E2E-04 — Tolerância a falhas

- parar analytics;
- gerar eventos;
- reiniciar analytics;
- validar processamento acumulado.

### E2E-05 — Autorização

- turista não acessa curadoria;
- worker não altera perfil de terceiro;
- curador não é criado por cadastro público.

---

# 23. CI/CD

Pipeline por pull request:

1. instalar dependências;
2. lint;
3. typecheck;
4. testes unitários;
5. build de todos os serviços;
6. build do frontend;
7. validar Dockerfiles;
8. opcionalmente subir dependências e executar integração.

Estratégia de branches:

- `main`: estável;
- `develop`: integração, caso o grupo deseje;
- branches `feature/*` por módulo;
- PR pequeno e revisável;
- ao menos um revisor;
- squash merge recomendado.

Convenção de commits:

```text
feat(auth): implementa login com JWT
fix(catalog): corrige busca por raio
chore(infra): adiciona healthcheck do RabbitMQ
test(reviews): cobre duplicidade de avaliação
docs(architecture): atualiza contrato de eventos
```

---

# 24. Ordem recomendada de implementação

## Fase 0 — Contratos e infraestrutura

- estabilizar Docker Compose;
- criar `.env.example`;
- criar exchange/filas;
- padronizar erros e eventos;
- adicionar pacote de contratos;
- configurar lint e CI.

## Fase 1 — Identidade e catálogo básico

- Auth completo;
- Catalog CRUD sem curadoria;
- frontend de login, cadastro e perfil comercial.

## Fase 2 — Curadoria

- evento de submissão;
- solicitação pendente;
- painel do curador;
- aprovação/rejeição;
- atualização eventual do catálogo.

## Fase 3 — Descoberta turística

- busca geográfica;
- mapa;
- detalhe público;
- evento de visualização.

## Fase 4 — Avaliações e contato

- avaliações;
- resumo;
- clique de WhatsApp;
- eventos.

## Fase 5 — Analytics e dashboards

- consumidores;
- agregados;
- endpoints de leitura;
- dashboard do empreendedor.

## Fase 6 — Qualidade e demonstração

- testes E2E;
- tolerância a falhas;
- documentação;
- seed;
- roteiro de apresentação.

---

# 25. Definition of Done por tarefa

Uma tarefa só está concluída quando:

- código compila;
- endpoint ou consumidor funciona;
- DTO e validação estão presentes;
- autorização foi aplicada;
- teste unitário existe para a regra principal;
- teste de integração existe quando envolve banco ou broker;
- Swagger foi atualizado;
- variáveis estão no `.env.example`;
- logs não expõem segredo;
- PR foi revisado;
- Docker Compose continua subindo;
- documentação do módulo foi atualizada.

---

# 26. Entregáveis exatos por desenvolvedor

## 26.1 Emanuel

### Interaction & Review

- migrations de review e interaction;
- módulos, controllers, services e DTOs;
- guard de papéis integrado ao JWT;
- publisher RabbitMQ;
- eventos `review.submitted.v1` e `contact.clicked.v1`;
- resumo agregado;
- testes unitários e integração;
- Swagger.

### Analytics

- schemas Mongoose;
- consumidores dos três eventos;
- idempotência;
- retry e DLQ;
- agregações diárias;
- API de leitura;
- autorização do dashboard;
- testes;
- demonstração de recuperação.

## 26.2 Gustavo

### Auth & Profile

- migrations de usuário, perfil e sessão;
- cadastro, login, refresh, logout e `me`;
- JWT strategy;
- decorators `@CurrentUser()` e `@Roles()`;
- `JwtAuthGuard` e `RolesGuard`;
- seed de curador;
- testes;
- Swagger.

### Curation & Notification

- migrations de solicitações, histórico, alertas e notificações;
- consumidores;
- endpoints do curador;
- publishers de decisão;
- notificações in-app;
- testes de idempotência;
- Swagger.

## 26.3 João Ricardo

### Catalog & Geo

- migrations e PostGIS;
- CRUD de perfil e serviços;
- submissão;
- busca geográfica;
- filtros;
- publishers e consumers;
- testes de geolocalização;
- Swagger.

### Frontend

- design system mínimo;
- rotas e guards;
- login/cadastro;
- exploração com mapa/lista;
- perfil e avaliação;
- cadastro do empreendedor;
- status de curadoria;
- dashboard do empreendedor;
- painel do curador;
- integração real com APIs;
- responsividade e testes principais.

---

# 27. Critérios de sucesso do projeto

O MVP será considerado integrado quando:

1. todos os containers iniciarem com um único comando;
2. um worker puder se cadastrar e enviar perfil;
3. um curador puder aprovar o perfil;
4. o perfil aprovado aparecer no mapa e na busca;
5. um turista puder visualizar, contatar e avaliar;
6. os eventos aparecerem no RabbitMQ;
7. o analytics processar eventos em background;
8. o dashboard apresentar dados reais;
9. a queda do analytics não interromper os demais fluxos;
10. testes e documentação permitirem reprodução pelo professor.

---

# 28. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Divergência de contratos | alto | pacote compartilhado e versionamento `.v1` |
| Eventos duplicados | alto | idempotência por `eventId` |
| Perda de evento após transação | alto | outbox ou retry persistente |
| PostGIS mal configurado | médio | migration SQL e teste de distância |
| Frontend bloqueado por CORS | médio | origem configurável e smoke test |
| JWT incompatível entre serviços | alto | segredo/algoritmo padronizados |
| Dashboard sem fonte de dados | alto | API de leitura no analytics |
| Escopo excessivo | alto | separar MVP obrigatório de evoluções |
| Dados inconsistentes entre bancos | médio | eventos de estado e reconciliação |
| Uso de imagem `latest` | médio | fixar versões de containers |

---

# 29. Backlog futuro

- favoritos;
- eventos turísticos;
- múltiplos estabelecimentos por empreendedor;
- upload de imagens em object storage;
- moderação de comentários;
- suspensão automática com revisão humana;
- recomendação personalizada;
- reservas;
- múltiplos canais de notificação;
- aplicação Ionic/Capacitor;
- API Gateway;
- observabilidade com OpenTelemetry;
- Kubernetes;
- relatórios para gestão pública;
- expansão para outras praias e estados.

---

# 30. Checklist final de integração

- [ ] Auth emite JWT aceito pelos quatro serviços HTTP.
- [ ] Todos os serviços usam o mesmo enum de papéis.
- [ ] Catalog publica submissão e visualização.
- [ ] Curation consome submissão e publica decisão.
- [ ] Catalog consome decisão.
- [ ] Reviews publica avaliação e contato.
- [ ] Analytics consome os três eventos.
- [ ] DLQ existe e pode ser inspecionada.
- [ ] Frontend usa APIs reais.
- [ ] Mapa usa dados aprovados.
- [ ] Dashboard usa analytics real.
- [ ] Swagger disponível.
- [ ] Migrations executam em banco vazio.
- [ ] Seed cria ao menos um curador.
- [ ] Smoke test cobre o fluxo principal.
- [ ] README contém comando de execução e credenciais de demonstração.

---

## Conclusão

A arquitetura proposta preserva a intenção acadêmica de demonstrar sistemas distribuídos, desacoplamento, mensageria e tolerância a falhas, sem perder a viabilidade de entrega por uma equipe pequena. A divisão de domínio evita sobreposição entre os desenvolvedores, enquanto contratos de eventos, autorização comum, testes e critérios de aceite reduzem riscos de integração.

Este documento deve ser tratado como a fonte principal para criação de issues, branches, contextos de desenvolvimento e validação da entrega final.
