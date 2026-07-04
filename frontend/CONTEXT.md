# Frontend — Glossário de Domínio

> Contexto responsável pela interface do usuário — turista, empreendedor e curador.
> **Diretório:** `frontend/`

---

## Aplicação web responsiva (Responsive Web App)

O MVP é entregue como uma aplicação Angular de página única (SPA) que se adapta a diferentes tamanhos de tela — desktop, tablet e celular. Não é um aplicativo nativo publicado em lojas.

## Progressive Web App (PWA)

Evolução da aplicação web responsiva que permite instalação na tela inicial do dispositivo, uso offline parcial e experiência semelhante a um aplicativo nativo. É uma meta _Should_ do MVP, não obrigatória na primeira entrega.

## Exploração (Explore / Discovery)

Tela principal do turista, onde ele pode alternar entre visualização em **mapa** e visualização em **lista**. Permite buscar, filtrar e navegar pelos perfis comerciais aprovados.

## Mapa interativo (Interactive Map)

Visualização geográfica dos perfis comerciais aprovados, usando Leaflet + OpenStreetMap no MVP. Os marcadores representam empreendedores e serviços. O agrupamento de marcadores em alta densidade é uma evolução _Should_.

## Lista (List View)

Visualização textual dos perfis comerciais, ordenados por proximidade, avaliação ou relevância. Serve como alternativa acessível ao mapa e como fallback quando o provedor de mapa estiver indisponível.

## Perfil público (Public Profile)

Página de detalhes de um empreendedor visível ao turista. Inclui nome, descrição, categoria, avaliações, serviços, localização no mapa e botões de contato (WhatsApp/telefone).

## Painel do empreendedor (Worker Dashboard)

Área restrita onde o empreendedor autenticado gerencia seu perfil comercial, acompanha o status da curadoria, consulta métricas (visualizações, contatos, avaliações) e edita suas informações.

## Painel do curador (Curator Dashboard)

Área restrita onde o curador autenticado acessa a fila de pendências, analisa perfis submetidos, toma decisões (aprovar/rejeitar), consulta histórico e gerencia alertas de moderação.

## Design system

Conjunto mínimo de componentes, cores, tipografia e espaçamentos padronizados para garantir consistência visual entre todas as telas e fluxos da aplicação. A implementação usa Tailwind CSS ou SCSS, com um único padrão a ser definido pela equipe.

## Responsividade (Responsiveness)

Capacidade da interface de se adaptar a telas de diferentes tamanhos, garantindo que todas as funcionalidades _Must_ funcionem adequadamente em dispositivos móveis. A regra **RN-PLATAFORMA-001** exige paridade funcional em telas móveis.
