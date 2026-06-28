# Catalog & Geo — Glossário de Domínio

> Contexto responsável pelo catálogo de perfis comerciais e serviços, geolocalização, busca e mapa.
> **Diretório:** `service-catalog/`

---

## Perfil comercial (Worker Profile)

Página pública que representa um empreendedor na plataforma. Contém nome, descrição, categoria, telefone, WhatsApp, localização e praia de atuação. É a unidade central de descoberta para o turista.

**Status possíveis:**

| Status | Significado |
|---|---|
| **Rascunho (Draft)** | Perfil sendo preenchido pelo empreendedor, ainda não enviado à curadoria |
| **Pendente (Pending)** | Perfil submetido, aguardando decisão do curador |
| **Aprovado (Approved)** | Perfil validado e visível publicamente na busca e no mapa |
| **Rejeitado (Rejected)** | Perfil não aprovado; o empreendedor recebe a justificativa e pode corrigir |
| **Suspenso (Suspended)** | Perfil temporariamente indisponível por decisão de moderação |

Apenas perfis **Aprovados** aparecem em buscas públicas, no mapa e na listagem.

## Serviço (Service Item)

Oferta individual disponibilizada por um empreendedor dentro do seu perfil comercial. Pode ter título, descrição, preço, categoria própria e localização específica. Um empreendedor pode cadastrar múltiplos serviços.

## Praia (Beach)

Unidade territorial utilizada para busca e classificação. O MVP cobre quatro praias iniciais: **Gaibu**, **Porto de Galinhas**, **Praia dos Carneiros** e **Boa Viagem**. A arquitetura permite expansão para novas praias por configuração de dados, sem reestruturação.

> **Nota:** O termo "Orla" aparece nos documentos como sinônimo de "Praia". O glossário do documento de requisitos define **Orla** como "Área territorial litorânea cadastrada na plataforma" e **Praia** como "Unidade territorial utilizada para busca e classificação". No uso corrente do projeto, os dois termos são intercambiáveis.

## Categoria (Category)

Classificação do perfil comercial ou serviço. Exemplos de categorias de empreendedores: barraqueiro, ambulante, bugueiro, operador de passeios, bar e restaurante, artesão, loja, quiosque. A lista definitiva de categorias iniciais ainda requer validação da equipe.

## Georreferenciamento (Geolocation)

Associação de um perfil ou serviço a coordenadas geográficas (latitude e longitude). Permite busca por proximidade e exibição no mapa.

## Raio de busca (Search Radius)

Distância máxima, em metros ou quilômetros, entre a localização do turista e os resultados retornados. Parâmetro configurável na busca.

## Catálogo (Catalog)

Conjunto de todos os perfis comerciais e serviços cadastrados, indexados por praia, categoria e localização. O catálogo é a fonte de dados para busca e mapa.

## Submissão (Submission)

Ato do empreendedor de enviar seu perfil comercial da situação de **Rascunho** para **Pendente**, disparando o fluxo de curadoria.

## Visualização (View)

Acesso de um turista à página de detalhes de um perfil comercial aprovado. Cada visualização gera um evento registrado para fins de analytics.
