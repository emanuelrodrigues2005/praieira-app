# frontend — AGENTS.md

> Módulo 1A (Frontend Turista) + Módulo 1B (Dashboards)
> Responsável: João Ricardo

## Objetivo

Interface do usuário da plataforma Praieira — turista, empreendedor e curador. Aplicação Angular responsiva que consome as APIs REST dos cinco serviços de backend e exibe mapa interativo, busca, perfis, avaliações, dashboards e fluxo de curadoria.

**Domínio:** Aplicação responsiva, PWA, Exploração (mapa/lista), Perfil público, Painel do empreendedor, Painel do curador, Design system, Responsividade.
**Glossário completo:** `CONTEXT.md`

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | Angular 18+ |
| Linguagem | TypeScript 5.5+ |
| Estilo | Tailwind CSS ou SCSS (definir um padrão único) |
| Mapa | Leaflet + OpenStreetMap (MVP) |
| Roteamento | Angular Router |
| Formulários | Reactive Forms |
| Estado | RxJS + Angular Signals |
| Testes | Jasmine/Karma ou Vitest |
| PWA | `@angular/pwa` |

## Porta

**4200** — porta fixa e exclusiva. Nenhum outro serviço pode usar esta porta.

> Em desenvolvimento local (`ng serve`), o Angular sobe em `http://localhost:4200`. No Docker, o `Dockerfile` usa `npx @angular/cli serve --host 0.0.0.0 --port 4200`.

## Como rodar

### Local (desenvolvimento)

```bash
cd frontend
npm install
npm start
```

A aplicação sobe em `http://localhost:4200`.

### Docker

```bash
docker compose up --build frontend
```

## APIs consumidas

| Serviço | Porta | Uso no frontend |
|---|---|---|
| service-auth | 3001 | Login, cadastro, perfil pessoal |
| service-catalog | 3002 | Busca, mapa, lista, perfil comercial, serviços |
| service-reviews | 3003 | Avaliações, contato (WhatsApp/telefone) |
| service-curation | 3004 | Fila de pendências, aprovação/rejeição, notificações |
| service-analytics | 3005 | Dashboards (métricas do empreendedor e curador) |

## Telas por ator

### Turista

- **Exploração:** alterna entre mapa e lista, filtra por praia, categoria e raio
- **Perfil público:** detalhes do empreendedor, serviços, avaliações, botão de contato
- **Avaliação:** formulário de nota (1-5 estrelas) e comentário

### Empreendedor

- **Cadastro:** perfil pessoal + perfil comercial + serviços
- **Status da curadoria:** rascunho → pendente → aprovado/rejeitado
- **Painel do empreendedor:** métricas do próprio perfil (visualizações, contatos, avaliações)

### Curador

- **Fila de pendências:** lista de solicitações aguardando decisão
- **Análise:** detalhes do perfil submetido, documentos
- **Decisão:** aprovar ou rejeitar com justificativa
- **Painel do curador:** indicadores agregados da plataforma

## Regras críticas

1. **Responsividade obrigatória.** Todas as funcionalidades Must devem funcionar em telas móveis. Testar em viewport 375px (iPhone SE).
2. **Alternativa ao mapa.** Se o Leaflet/OpenStreetMap falhar ou estiver indisponível, a lista textual deve continuar funcional.
3. **Acessibilidade básica:** navegação por teclado, foco visível, rótulos em formulários, contraste suficiente.
4. **JWT armazenado com segurança.** Não usar localStorage para tokens em produção. HttpOnly cookie ou memória com refresh.
5. **Nunca expor segredos no frontend.** Chaves de API, URLs internas e tokens sensíveis não devem ser hardcoded.
6. **Intenção de contato ≠ venda.** Todo indicador de "contatos" no dashboard deve exibir a ressalva "Este número representa intenções de contato, não vendas confirmadas".
