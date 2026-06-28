# Praieira App — Documento de Requisitos de Software

> **Produto:** Hub territorial de turismo litorâneo de Pernambuco
> **Repositório:** `emanuelrodrigues2005/praieira-app`
> **Documento:** Especificação de Requisitos de Software — ERS/SRS
> **Versão:** 1.0
> **Data:** 28/06/2026
> **Status:** Baseline proposta para desenvolvimento do MVP
> **Territórios iniciais:** Gaibu, Porto de Galinhas, Praia dos Carneiros e Boa Viagem

---

## 1. Controle do documento

| Campo | Valor |
|---|---|
| Nome do produto | Praieira App |
| Tipo de documento | Especificação de Requisitos de Software |
| Versão | 1.0 |
| Situação | Proposto para validação da equipe |
| Responsáveis pela validação | Equipe de desenvolvimento, orientador, representantes dos empreendedores e curadores |
| Próxima revisão | Antes do início da implementação funcional |
| Repositório de referência | `emanuelrodrigues2005/praieira-app` |

### 1.1 Histórico de versões

| Versão | Data | Alteração |
|---|---:|---|
| 1.0 | 28/06/2026 | Consolidação inicial dos requisitos funcionais, não funcionais, regras de negócio, critérios de aceite e escopo do MVP |

### 1.2 Convenções

Os requisitos usam os seguintes prefixos:

| Prefixo | Significado |
|---|---|
| `OBJ` | Objetivo de negócio |
| `RF` | Requisito funcional |
| `RN` | Regra de negócio |
| `RNF` | Requisito não funcional |
| `RI` | Requisito de integração |
| `RD` | Requisito de dados |
| `UC` | Caso de uso |
| `US` | História de usuário |
| `CA` | Critério de aceite |
| `RS` | Requisito de segurança |
| `LGPD` | Requisito de privacidade e proteção de dados |

As prioridades seguem o método MoSCoW:

- **Must:** obrigatório para o MVP;
- **Should:** importante, mas não bloqueia a primeira entrega;
- **Could:** desejável para evolução;
- **Won't now:** explicitamente fora do escopo atual.

---

# 2. Finalidade do documento

Este documento define, de forma verificável e sem ambiguidades intencionais, os requisitos do Praieira App. Ele deve ser utilizado como referência para:

1. planejamento e divisão das tarefas;
2. implementação do frontend, backend e integrações;
3. elaboração dos testes;
4. validação do produto;
5. avaliação acadêmica;
6. manutenção e evolução da plataforma;
7. controle de mudanças de escopo.

Um requisito somente será considerado concluído quando sua implementação, seus testes e seus critérios de aceite estiverem atendidos.

---

# 3. Contexto do problema

Destinos litorâneos com elevado fluxo turístico apresentam dificuldades relacionadas à fragmentação das informações sobre serviços, comércio, alimentação, transporte, passeios, artesanato e experiências locais.

Os turistas frequentemente encontram problemas para:

- localizar serviços confiáveis;
- identificar opções próximas;
- comparar categorias e avaliações;
- obter informações atualizadas;
- entrar em contato com prestadores locais;
- saber se um perfil foi verificado.

Os empreendedores locais enfrentam problemas para:

- obter visibilidade digital;
- alcançar turistas no momento em que estão próximos;
- divulgar produtos e serviços;
- apresentar informações confiáveis;
- acompanhar o interesse gerado pelo seu perfil;
- competir de forma mais equilibrada com negócios de maior presença digital.

A falta de uma base territorial estruturada também reduz a capacidade de monitoramento do turismo, planejamento de ações e tomada de decisão baseada em evidências.

---

# 4. Público-alvo

## 4.1 Empreendedores locais

O público prioritário do produto inclui:

- barraqueiros;
- ambulantes de praia;
- bugueiros;
- operadores de passeios;
- donos de bares e restaurantes;
- artesãos;
- produtores de artesanato local;
- comerciantes de lojas;
- operadores de quiosques;
- prestadores de serviços auxiliares ao turismo.

Esses grupos integram o arranjo produtivo local do turismo litorâneo e dependem do fluxo de visitantes, da confiança e da visibilidade para gerar renda.

## 4.2 Turistas e visitantes

Pessoas que visitam ou circulam pelas orlas atendidas e desejam descobrir serviços, experiências e estabelecimentos próximos.

## 4.3 Curadores e gestores

Pessoas autorizadas a:

- analisar perfis;
- verificar informações;
- aprovar ou rejeitar cadastros;
- moderar conteúdo;
- acompanhar indicadores;
- manter a confiabilidade da plataforma.

## 4.4 Administradores técnicos

Responsáveis por:

- disponibilidade;
- monitoramento;
- segurança;
- bancos de dados;
- mensageria;
- backups;
- correção de falhas;
- atualização da infraestrutura.

---

# 5. Premissas econômicas e quantitativas

Os seguintes números foram fornecidos como contexto do projeto:

- aproximadamente 633 mil viagens domésticas para Pernambuco em 2023;
- movimentação econômica aproximada de R$ 1,7 bilhão;
- gasto médio informado próximo de R$ 2.700;
- crescimento informado de 10,5% na receita turística em 2025;
- estimativa informada de cerca de 1,2 milhão de visitantes anuais em Porto de Galinhas.

## 5.1 Regra de utilização dos dados econômicos

Os números acima são **premissas contextuais informadas pelo proponente** e não constituem requisitos técnicos.

Antes de serem publicados em:

- página institucional;
- apresentação;
- relatório;
- material promocional;
- release;
- painel público;

eles deverão ser verificados em fontes oficiais ou acadêmicas, com registro de:

- fonte;
- título;
- instituição;
- data de publicação;
- período de referência;
- link;
- metodologia;
- data de acesso.

### RN-DADOS-001 — Não publicação de dado econômico sem fonte

O sistema e seus materiais oficiais não devem apresentar estatísticas econômicas como fatos confirmados sem fonte registrada e validada.

**Prioridade:** Must.

---

# 6. Visão do produto

O Praieira App será uma plataforma digital integrada, acessível por navegador e dispositivos móveis, destinada a centralizar, organizar e disponibilizar informações turísticas e comerciais das orlas de:

- Gaibu;
- Porto de Galinhas;
- Praia dos Carneiros;
- Boa Viagem.

A plataforma funcionará como um hub territorial de serviços turísticos, conectando turistas a empreendedores locais de forma:

- simples;
- confiável;
- acessível;
- georreferenciada;
- responsiva;
- mensurável.

---

# 7. Objetivos de negócio

| ID | Objetivo |
|---|---|
| `OBJ-001` | Reduzir a desconexão entre turistas e serviços locais. |
| `OBJ-002` | Aumentar a visibilidade digital de pequenos empreendedores. |
| `OBJ-003` | Facilitar a descoberta de serviços por localização e categoria. |
| `OBJ-004` | Melhorar a confiança por meio de curadoria e avaliações. |
| `OBJ-005` | Permitir contato direto entre turista e prestador. |
| `OBJ-006` | Disponibilizar métricas úteis aos empreendedores. |
| `OBJ-007` | Criar uma base territorial de dados para decisões futuras. |
| `OBJ-008` | Permitir expansão para novas praias e municípios sem reestruturação completa. |
| `OBJ-009` | Promover inclusão produtiva e desenvolvimento econômico local. |
| `OBJ-010` | Possibilitar monitoramento contínuo de uso, satisfação e impacto. |

---

# 8. Indicadores de sucesso

Os indicadores deverão ser medidos após o lançamento e comparados por período e território.

| ID | Indicador | Forma de cálculo |
|---|---|---|
| `KPI-001` | Empreendedores cadastrados | Total de perfis criados |
| `KPI-002` | Empreendedores aprovados | Perfis aprovados / perfis submetidos |
| `KPI-003` | Perfis ativos | Perfis aprovados e disponíveis |
| `KPI-004` | Visualizações de perfis | Eventos válidos de visualização |
| `KPI-005` | Intenções de contato | Cliques válidos em canais de contato |
| `KPI-006` | Taxa de conversão de interesse | Contatos / visualizações |
| `KPI-007` | Avaliação média | Média das avaliações válidas |
| `KPI-008` | Cobertura territorial | Categorias e perfis ativos por praia |
| `KPI-009` | Tempo de curadoria | Tempo entre submissão e decisão |
| `KPI-010` | Retenção de empreendedores | Empreendedores ativos após período definido |
| `KPI-011` | Satisfação do usuário | Resultado de pesquisa de satisfação |
| `KPI-012` | Disponibilidade | Percentual de tempo operacional |
| `KPI-013` | Atualização cadastral | Perfis atualizados dentro do prazo definido |
| `KPI-014` | Ocorrência de erros | Erros técnicos por quantidade de requisições |

As metas numéricas de cada indicador deverão ser definidas após o piloto, evitando metas sem base de uso real.

---

# 9. Escopo do produto

## 9.1 Escopo obrigatório do MVP

O MVP deverá incluir:

1. cadastro e autenticação;
2. papéis de turista, empreendedor e curador;
3. perfil do usuário;
4. perfil comercial do empreendedor;
5. cadastro de serviços;
6. cadastro da localização do serviço;
7. seleção de praia e categoria;
8. pesquisa textual e por filtros;
9. busca por proximidade;
10. mapa interativo;
11. página de detalhes do perfil;
12. avaliações por estrelas e comentário;
13. contato direto por WhatsApp ou telefone;
14. registro de visualizações e contatos;
15. fluxo de curadoria;
16. aprovação e rejeição;
17. histórico de decisões;
18. painel do empreendedor;
19. painel do curador;
20. indicadores básicos;
21. notificações internas ou simuladas;
22. execução web responsiva;
23. experiência adequada para dispositivos móveis;
24. logs e monitoramento técnico;
25. proteção dos dados pessoais.

## 9.2 Estratégia para aplicação móvel

Para evitar duplicação prematura de código, o MVP deverá ser entregue como:

- aplicação web responsiva;
- Progressive Web App, quando tecnicamente possível;
- interface otimizada para Android e iOS por navegador.

O aplicativo instalável em lojas poderá ser implementado posteriormente por empacotamento da aplicação Angular com Ionic/Capacitor ou tecnologia equivalente.

### RN-PLATAFORMA-001 — Paridade funcional móvel

As funcionalidades Must deverão funcionar em telas móveis suportadas, mesmo que o MVP não seja publicado inicialmente nas lojas de aplicativos.

## 9.3 Fora do escopo do MVP

Não fazem parte da primeira entrega:

- pagamentos;
- reservas financeiras;
- carteira digital;
- emissão fiscal;
- chat interno em tempo real;
- publicidade paga;
- leilão de destaque;
- inteligência artificial de recomendação;
- reconhecimento facial;
- venda de passagens;
- integração fiscal;
- integração com bases governamentais reais;
- rastreamento contínuo da localização;
- aplicativo nativo independente;
- avaliação anônima;
- armazenamento definitivo de documentos sensíveis sem política específica.

---

# 10. Perfis de usuário

## 10.1 Turista

Pode:

- criar conta;
- autenticar-se;
- pesquisar serviços;
- usar mapa;
- visualizar perfis;
- favoritar perfis, se implementado;
- entrar em contato;
- avaliar prestadores;
- editar seus dados;
- solicitar exclusão da conta.

## 10.2 Empreendedor

Pode:

- criar conta;
- cadastrar perfil pessoal;
- cadastrar perfil comercial;
- cadastrar serviços;
- indicar localização;
- enviar perfil para curadoria;
- corrigir pendências;
- acompanhar o status;
- atualizar informações;
- consultar métricas próprias;
- responder informações solicitadas pela curadoria;
- solicitar exclusão ou desativação.

## 10.3 Curador

Pode:

- acessar fila de pendências;
- consultar detalhes do cadastro;
- aprovar;
- rejeitar;
- solicitar correção;
- suspender perfil;
- consultar histórico;
- analisar denúncias;
- moderar avaliações, dentro das regras;
- consultar indicadores de curadoria.

## 10.4 Administrador

Pode:

- gerenciar configurações globais;
- gerenciar curadores;
- consultar logs autorizados;
- bloquear usuários;
- configurar categorias;
- cadastrar praias;
- operar processos de recuperação;
- aplicar políticas de segurança.

No MVP acadêmico, as funções de administrador podem ser executadas por configuração técnica ou seed, sem interface completa.

---

# 11. Glossário

| Termo | Definição |
|---|---|
| Orla | Área territorial litorânea cadastrada na plataforma |
| Praia | Unidade territorial utilizada para busca e classificação |
| Empreendedor | Prestador ou comerciante que oferece serviço ao turista |
| Perfil comercial | Página pública que representa um empreendedor ou estabelecimento |
| Serviço | Oferta disponibilizada pelo empreendedor |
| Curadoria | Processo de análise e aprovação de informações |
| Perfil aprovado | Perfil autorizado a aparecer publicamente |
| Perfil pendente | Perfil aguardando decisão |
| Perfil rejeitado | Perfil não aprovado, com justificativa |
| Perfil suspenso | Perfil temporariamente indisponível |
| Visualização | Acesso válido à página de detalhes do perfil |
| Intenção de contato | Ação de abertura de canal externo, como WhatsApp |
| Avaliação | Nota e comentário enviados por turista autenticado |
| Georreferenciamento | Associação de um registro a latitude e longitude |
| Raio de busca | Distância máxima entre o usuário e o resultado |
| Curador | Usuário autorizado a validar e moderar conteúdo |
| PWA | Aplicação web instalável e adaptada a dispositivos móveis |
| Dado pessoal | Informação relacionada a pessoa identificada ou identificável |
| Evento | Mensagem de negócio publicada de forma assíncrona |
| MVP | Produto mínimo viável |

---

# 12. Premissas, dependências e restrições

## 12.1 Premissas

- O usuário terá conexão com a internet para carregar informações.
- A geolocalização dependerá de permissão do dispositivo.
- O usuário poderá realizar busca manual sem conceder geolocalização.
- Empreendedores poderão ter diferentes níveis de letramento digital.
- Os dados cadastrais poderão precisar de revisão periódica.
- O contato com o prestador ocorrerá por canal externo no MVP.
- As praias iniciais serão cadastradas previamente.
- O sistema poderá ser expandido para novos territórios.

## 12.2 Dependências

- provedor de mapas;
- serviço de geolocalização do dispositivo;
- banco georreferenciado;
- serviço de autenticação;
- mensageria;
- canais de notificação;
- infraestrutura de hospedagem;
- processo humano de curadoria.

## 12.3 Restrições

- o sistema não deve depender apenas da geolocalização automática;
- um serviço indisponível de analytics não deve interromper funções principais;
- dados de um serviço não devem ser alterados diretamente por outro serviço;
- informações públicas devem respeitar a aprovação da curadoria;
- dados pessoais não devem ser expostos sem necessidade;
- o produto deve ser utilizável em telas móveis;
- a expansão territorial não deve exigir duplicação da aplicação.

---

# 13. Requisitos funcionais

## 13.1 Autenticação e contas

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-AUTH-001` | O sistema deve permitir cadastro por e-mail e senha. | Must | Uma conta válida é criada e o e-mail duplicado é rejeitado. |
| `RF-AUTH-002` | O sistema deve permitir autenticação com credenciais válidas. | Must | Usuário válido recebe sessão ou token. |
| `RF-AUTH-003` | O sistema deve rejeitar autenticação com credenciais inválidas sem revelar qual campo está incorreto. | Must | Resposta genérica e segura. |
| `RF-AUTH-004` | O sistema deve associar cada conta a um papel autorizado. | Must | Papéis mínimos: turista, empreendedor e curador. |
| `RF-AUTH-005` | O sistema deve permitir encerramento da sessão. | Must | O frontend remove a sessão e o token deixa de ser reutilizado após a política definida. |
| `RF-AUTH-006` | O sistema deve permitir recuperação ou redefinição de senha. | Should | Processo seguro com token temporário. |
| `RF-AUTH-007` | O sistema deve permitir atualização de senha por usuário autenticado. | Must | Exige senha atual ou fluxo de verificação. |
| `RF-AUTH-008` | O sistema deve bloquear acesso a recursos incompatíveis com o papel. | Must | Acesso indevido retorna `403`. |
| `RF-AUTH-009` | O sistema deve registrar data de criação e última atualização da conta. | Must | Datas persistidas e auditáveis. |
| `RF-AUTH-010` | O sistema deve permitir solicitação de desativação ou exclusão da conta. | Must | Solicitação registrada e processada conforme política de dados. |
| `RF-AUTH-011` | O sistema deve permitir que administrador suspenda conta por motivo registrado. | Should | Conta suspensa não autentica. |
| `RF-AUTH-012` | O sistema deve aceitar termos de uso e aviso de privacidade no cadastro. | Must | Versão e data do aceite ficam registradas. |

## 13.2 Perfil pessoal

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-PERFIL-001` | O usuário deve poder visualizar seu perfil. | Must | Somente dados autorizados são retornados. |
| `RF-PERFIL-002` | O usuário deve poder atualizar nome, telefone e foto. | Must | Dados válidos são persistidos. |
| `RF-PERFIL-003` | O usuário deve poder escolher quais dados de contato serão públicos. | Must | Campos privados não aparecem no perfil comercial. |
| `RF-PERFIL-004` | O sistema deve validar formatos de telefone e URL. | Must | Formatos inválidos são rejeitados. |
| `RF-PERFIL-005` | O sistema deve registrar alterações relevantes do perfil. | Should | Histórico contém autor, data e campos alterados. |

## 13.3 Perfil comercial do empreendedor

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-EMP-001` | Empreendedor autenticado deve poder criar perfil comercial. | Must | Perfil criado inicialmente como rascunho ou pendente. |
| `RF-EMP-002` | O perfil deve possuir nome comercial, descrição, categoria, praia e contato. | Must | Submissão incompleta é rejeitada. |
| `RF-EMP-003` | O empreendedor deve poder informar horário de funcionamento. | Must | Horários válidos aparecem no perfil. |
| `RF-EMP-004` | O empreendedor deve poder cadastrar foto de capa e galeria. | Should | Arquivos válidos são associados ao perfil. |
| `RF-EMP-005` | O empreendedor deve poder informar acessibilidade e meios de atendimento. | Should | Informações aparecem como atributos pesquisáveis ou visíveis. |
| `RF-EMP-006` | O empreendedor deve poder salvar o perfil como rascunho. | Must | Rascunho não aparece publicamente. |
| `RF-EMP-007` | O empreendedor deve poder enviar o perfil para curadoria. | Must | Status muda para pendente. |
| `RF-EMP-008` | O empreendedor deve acompanhar o status da análise. | Must | Exibe rascunho, pendente, aprovado, correção, rejeitado ou suspenso. |
| `RF-EMP-009` | O empreendedor deve visualizar a justificativa de rejeição ou solicitação de correção. | Must | Justificativa aparece apenas aos autorizados. |
| `RF-EMP-010` | O empreendedor deve poder corrigir e reenviar o perfil. | Must | Nova versão volta à fila de curadoria. |
| `RF-EMP-011` | O empreendedor deve poder desativar temporariamente o perfil. | Must | Perfil deixa de aparecer nas buscas. |
| `RF-EMP-012` | Alterações críticas em perfil aprovado devem poder gerar nova curadoria. | Must | Mudanças configuradas alteram status ou criam revisão. |
| `RF-EMP-013` | O sistema deve informar ao empreendedor quando os dados estiverem desatualizados. | Should | Alerta após período configurável. |
| `RF-EMP-014` | O sistema deve impedir que um usuário comum edite perfil de outro empreendedor. | Must | Requisição retorna `403`. |

## 13.4 Categorias

Categorias mínimas:

- alimentação;
- bar e restaurante;
- barraca de praia;
- ambulante;
- passeio;
- buggy;
- transporte;
- artesanato;
- comércio;
- quiosque;
- experiência;
- serviço auxiliar;
- ponto turístico;
- evento.

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-CATG-001` | O sistema deve manter catálogo central de categorias. | Must | Categorias ativas podem ser usadas nos cadastros. |
| `RF-CATG-002` | Administrador deve poder ativar, desativar e ordenar categorias. | Should | Alterações não apagam registros históricos. |
| `RF-CATG-003` | Cada perfil deve possuir ao menos uma categoria principal. | Must | Perfil sem categoria não é submetido. |
| `RF-CATG-004` | O sistema pode permitir categorias secundárias. | Could | Busca retorna perfil pelas categorias associadas. |

## 13.5 Serviços, produtos e experiências

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-SERV-001` | Empreendedor aprovado deve poder cadastrar serviços. | Must | Serviço fica associado ao perfil correto. |
| `RF-SERV-002` | Serviço deve conter título, descrição, categoria e disponibilidade. | Must | Campos obrigatórios são validados. |
| `RF-SERV-003` | O preço deve ser opcional e identificado como fixo, inicial, faixa ou sob consulta. | Must | Valor não é apresentado de forma enganosa. |
| `RF-SERV-004` | Empreendedor deve poder ativar e desativar um serviço. | Must | Serviço inativo não aparece como disponível. |
| `RF-SERV-005` | Empreendedor deve poder cadastrar duração ou horário de uma experiência. | Should | Informação aparece nos detalhes. |
| `RF-SERV-006` | Empreendedor deve poder registrar condições e observações. | Should | Texto é validado e exibido. |
| `RF-SERV-007` | O sistema deve permitir associação de imagens ao serviço. | Should | Imagens passam por validação. |
| `RF-SERV-008` | Alterações de serviço devem atualizar a data da última modificação. | Must | Data é persistida. |

## 13.6 Praias, territórios e geolocalização

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-GEO-001` | O sistema deve cadastrar praias como entidades territoriais. | Must | As quatro praias iniciais estão disponíveis. |
| `RF-GEO-002` | Um perfil comercial deve estar associado a uma praia. | Must | Associação obrigatória é persistida. |
| `RF-GEO-003` | Um perfil deve possuir latitude e longitude válidas para aparecer no mapa. | Must | Coordenadas fora do intervalo são rejeitadas. |
| `RF-GEO-004` | O empreendedor deve poder selecionar localização no mapa. | Must | Marcador gera coordenadas. |
| `RF-GEO-005` | O sistema deve permitir informar localização textual complementar. | Must | Referência aparece nos detalhes. |
| `RF-GEO-006` | O turista deve poder autorizar geolocalização. | Must | Busca usa a localização somente após consentimento do dispositivo. |
| `RF-GEO-007` | O turista deve poder pesquisar sem fornecer sua localização. | Must | Pode selecionar praia ou digitar local. |
| `RF-GEO-008` | O sistema deve permitir busca por raio. | Must | Resultados respeitam o limite configurado. |
| `RF-GEO-009` | O sistema deve calcular e apresentar distância aproximada. | Must | Distância é calculada de forma consistente. |
| `RF-GEO-010` | O sistema deve ordenar por proximidade quando solicitado. | Must | Ordem crescente de distância. |
| `RF-GEO-011` | O sistema deve suportar expansão para novas praias. | Must | Nova praia pode ser adicionada sem alteração estrutural. |
| `RF-GEO-012` | Localizações imprecisas devem poder ser sinalizadas para revisão. | Should | Sinalização chega à curadoria. |

## 13.7 Busca, filtros e listagem

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-BUSCA-001` | O turista deve poder buscar por texto. | Must | Busca considera nome, categoria e descrição autorizada. |
| `RF-BUSCA-002` | O turista deve poder filtrar por praia. | Must | Só aparecem registros do território selecionado. |
| `RF-BUSCA-003` | O turista deve poder filtrar por categoria. | Must | Resultados respeitam a categoria. |
| `RF-BUSCA-004` | O turista deve poder filtrar por distância. | Must | Resultados fora do raio são excluídos. |
| `RF-BUSCA-005` | O turista deve poder ordenar por proximidade. | Must | Ordem é verificável. |
| `RF-BUSCA-006` | O turista deve poder ordenar por avaliação. | Should | Usa média e quantidade mínima configurável. |
| `RF-BUSCA-007` | A listagem deve apresentar nome, categoria, praia, distância e avaliação. | Must | Dados aparecem em cada cartão. |
| `RF-BUSCA-008` | A busca deve ser paginada. | Must | Limite e cursor/página são respeitados. |
| `RF-BUSCA-009` | O sistema deve exibir estado de lista vazia. | Must | Mensagem orienta a alterar filtros. |
| `RF-BUSCA-010` | Somente perfis aprovados, ativos e não suspensos devem aparecer publicamente. | Must | Perfis inválidos não são retornados. |
| `RF-BUSCA-011` | O sistema deve preservar os filtros ao alternar entre lista e mapa. | Should | Estado da pesquisa é mantido. |
| `RF-BUSCA-012` | O sistema deve permitir compartilhar link para perfil público. | Should | Link abre o perfil correto. |

## 13.8 Mapa interativo

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-MAPA-001` | O sistema deve apresentar serviços em mapa interativo. | Must | Marcadores correspondem aos resultados. |
| `RF-MAPA-002` | O usuário deve poder mover e ampliar o mapa. | Must | Ações funcionam em desktop e mobile. |
| `RF-MAPA-003` | Ao selecionar marcador, o sistema deve exibir resumo do perfil. | Must | Resumo contém ação para detalhes. |
| `RF-MAPA-004` | Os marcadores devem refletir filtros ativos. | Must | Mapa e lista têm resultados compatíveis. |
| `RF-MAPA-005` | Marcadores próximos devem ser agrupados quando necessário. | Should | Mapa permanece legível. |
| `RF-MAPA-006` | Falha no provedor de mapas não deve impedir acesso à listagem. | Must | Lista permanece disponível com mensagem adequada. |
| `RF-MAPA-007` | O mapa deve informar que a distância é aproximada. | Must | Aviso visível quando aplicável. |

## 13.9 Página pública do perfil

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-DET-001` | O sistema deve exibir página pública de perfil aprovado. | Must | URL carrega o perfil correto. |
| `RF-DET-002` | A página deve exibir descrição, categoria, praia, localização, horários e contato autorizado. | Must | Campos disponíveis são exibidos. |
| `RF-DET-003` | A página deve exibir serviços ativos. | Must | Serviços inativos não aparecem. |
| `RF-DET-004` | A página deve exibir média e quantidade de avaliações válidas. | Must | Cálculo corresponde aos dados. |
| `RF-DET-005` | A página deve identificar o status de perfil verificado. | Must | Selo aparece apenas após aprovação. |
| `RF-DET-006` | A abertura da página deve registrar visualização válida. | Must | Evento contém identificadores e data. |
| `RF-DET-007` | Atualizações de página em curto intervalo não devem inflar métricas indefinidamente. | Must | Deduplicação respeita janela configurada. |
| `RF-DET-008` | A página deve fornecer ação de contato. | Must | Ação abre canal configurado. |
| `RF-DET-009` | Conteúdo indisponível deve retornar página adequada, sem vazar informações. | Must | Resposta pública segura. |

## 13.10 Contato direto

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-CONT-001` | O turista deve poder iniciar contato pelo WhatsApp quando disponibilizado. | Must | Link abre número e mensagem válidos. |
| `RF-CONT-002` | O turista deve poder visualizar telefone público, quando autorizado. | Must | Telefone privado não é exposto. |
| `RF-CONT-003` | O clique de contato deve gerar registro de intenção. | Must | Evento é persistido ou publicado. |
| `RF-CONT-004` | O sistema não deve afirmar que o contato resultou em venda. | Must | Métrica é nomeada como intenção de contato. |
| `RF-CONT-005` | A mensagem inicial do WhatsApp pode ser pré-preenchida. | Should | Mensagem identifica o Praieira App sem conteúdo enganoso. |
| `RF-CONT-006` | O sistema deve informar que a conversa ocorrerá em serviço externo. | Must | Aviso aparece antes ou junto à ação. |

## 13.11 Avaliações e feedback

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-AVAL-001` | Turista autenticado deve poder avaliar perfil aprovado. | Must | Avaliação válida é criada. |
| `RF-AVAL-002` | A nota deve ser inteira entre 1 e 5. | Must | Valores fora do intervalo são rejeitados. |
| `RF-AVAL-003` | O comentário deve ser opcional no MVP. | Must | Nota sem comentário pode ser salva. |
| `RF-AVAL-004` | O sistema deve impedir spam de avaliações. | Must | Regra de unicidade ou janela é aplicada. |
| `RF-AVAL-005` | O turista deve poder editar sua avaliação. | Should | Média é recalculada. |
| `RF-AVAL-006` | O turista deve poder remover sua avaliação. | Should | Avaliação deixa de compor o cálculo, preservando auditoria quando necessário. |
| `RF-AVAL-007` | O sistema deve recalcular média após criação, edição, remoção ou moderação. | Must | Média final é consistente. |
| `RF-AVAL-008` | Avaliações devem possuir data. | Must | Data aparece na listagem. |
| `RF-AVAL-009` | O empreendedor não deve poder alterar avaliações recebidas. | Must | Tentativa é bloqueada. |
| `RF-AVAL-010` | O sistema deve permitir denúncia de avaliação. | Should | Denúncia entra em fila de moderação. |
| `RF-AVAL-011` | Avaliação removida por moderação deve possuir motivo. | Must | Ação fica auditada. |
| `RF-AVAL-012` | Avaliação de baixa nota pode gerar alerta de curadoria sem remoção automática. | Should | Alerta não altera a avaliação por si só. |
| `RF-AVAL-013` | O sistema deve informar critérios básicos de publicação das avaliações. | Must | Regra é acessível ao usuário. |

## 13.12 Curadoria e moderação

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-CUR-001` | Curador deve visualizar fila de perfis pendentes. | Must | Lista contém status e data de submissão. |
| `RF-CUR-002` | Curador deve visualizar todos os dados necessários à análise. | Must | Detalhes são acessíveis somente a autorizado. |
| `RF-CUR-003` | Curador deve poder aprovar perfil. | Must | Perfil torna-se publicável. |
| `RF-CUR-004` | Curador deve poder rejeitar perfil com justificativa obrigatória. | Must | Rejeição sem motivo é impedida. |
| `RF-CUR-005` | Curador deve poder solicitar correção. | Must | Empreendedor recebe motivo e pode reenviar. |
| `RF-CUR-006` | Curador deve poder suspender perfil aprovado. | Must | Perfil é removido da busca pública. |
| `RF-CUR-007` | Decisões devem registrar curador, data, status anterior, novo status e justificativa. | Must | Histórico é imutável para usuários comuns. |
| `RF-CUR-008` | Curador não deve aprovar o próprio perfil comercial. | Must | Conflito é bloqueado. |
| `RF-CUR-009` | O sistema deve permitir filtrar fila por praia, categoria, status e antiguidade. | Should | Filtros retornam resultados corretos. |
| `RF-CUR-010` | O sistema deve sinalizar cadastros antigos sem decisão. | Should | Pendências acima do prazo aparecem destacadas. |
| `RF-CUR-011` | O sistema deve permitir moderação de conteúdo denunciado. | Should | Decisão é auditada. |
| `RF-CUR-012` | A aprovação não deve apagar versões ou decisões anteriores. | Must | Histórico permanece consultável. |
| `RF-CUR-013` | O sistema deve permitir reativar perfil suspenso após nova análise. | Should | Reativação registra justificativa. |

## 13.13 Notificações

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-NOT-001` | O sistema deve notificar empreendedor sobre submissão do perfil. | Must | Notificação é registrada. |
| `RF-NOT-002` | O sistema deve notificar aprovação. | Must | Mensagem identifica o perfil. |
| `RF-NOT-003` | O sistema deve notificar rejeição ou solicitação de correção. | Must | Inclui justificativa autorizada. |
| `RF-NOT-004` | O sistema deve notificar suspensão. | Must | Inclui orientação disponível. |
| `RF-NOT-005` | O usuário deve poder consultar notificações internas. | Should | Lista mostra lidas e não lidas. |
| `RF-NOT-006` | O usuário deve poder marcar notificação como lida. | Should | Estado é persistido. |
| `RF-NOT-007` | Falha de envio externo não deve desfazer a decisão de curadoria. | Must | Envio pode ser reprocessado. |
| `RF-NOT-008` | O sistema pode enviar e-mail, push ou WhatsApp conforme consentimento e integração. | Could | Canal respeita preferências e política. |
| `RF-NOT-009` | Notificações devem possuir identificador para evitar duplicidade. | Must | Reprocessamento não cria múltiplas mensagens indevidas. |

## 13.14 Painel do empreendedor

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-DASH-EMP-001` | Empreendedor deve visualizar quantidade de visualizações do próprio perfil. | Must | Dados são restritos ao perfil autorizado. |
| `RF-DASH-EMP-002` | Empreendedor deve visualizar intenções de contato. | Must | Métrica usa eventos válidos. |
| `RF-DASH-EMP-003` | Empreendedor deve visualizar média e quantidade de avaliações. | Must | Dados correspondem ao período. |
| `RF-DASH-EMP-004` | Empreendedor deve selecionar período. | Must | Períodos mínimo: 7, 30 e 90 dias. |
| `RF-DASH-EMP-005` | O painel deve apresentar evolução temporal. | Should | Gráfico ou tabela é legível. |
| `RF-DASH-EMP-006` | O painel deve informar que contato não equivale a venda. | Must | Texto explicativo está visível. |
| `RF-DASH-EMP-007` | Empreendedor não deve acessar métricas privadas de outro perfil. | Must | Acesso retorna `403`. |
| `RF-DASH-EMP-008` | O painel deve apresentar status e pendências cadastrais. | Must | Status atual e ação recomendada aparecem. |

## 13.15 Painel de curadoria e gestão

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-DASH-CUR-001` | Curador deve visualizar quantidade de pendências. | Must | Total corresponde à fila. |
| `RF-DASH-CUR-002` | Curador deve visualizar tempo médio de análise. | Should | Cálculo considera decisões válidas. |
| `RF-DASH-CUR-003` | Curador deve visualizar cadastros por praia e categoria. | Should | Agrupamentos são consistentes. |
| `RF-DASH-CUR-004` | Curador deve visualizar alertas de avaliação e denúncia. | Should | Alertas abrem item relacionado. |
| `RF-DASH-CUR-005` | Gestor autorizado deve consultar indicadores agregados sem expor dados pessoais desnecessários. | Must | Painel usa agregação e controle de acesso. |

## 13.16 Eventos, passeios e experiências

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-EVENTO-001` | O sistema deve permitir cadastrar experiências e passeios como serviços. | Must | Itens aparecem no catálogo. |
| `RF-EVENTO-002` | O sistema deve permitir informar disponibilidade e duração. | Should | Dados aparecem no detalhe. |
| `RF-EVENTO-003` | O sistema deve permitir cadastro de eventos temporários. | Should | Evento possui início, término e território. |
| `RF-EVENTO-004` | Eventos encerrados não devem aparecer como futuros. | Must | Estado é calculado corretamente. |
| `RF-EVENTO-005` | Eventos devem passar por curadoria quando publicados por usuários externos. | Must | Evento pendente não é público. |

## 13.17 Suporte e adoção

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-SUP-001` | O sistema deve disponibilizar instruções simples de cadastro. | Must | Ajuda é acessível no fluxo. |
| `RF-SUP-002` | Mensagens de erro devem indicar como corrigir o problema. | Must | Mensagem é compreensível. |
| `RF-SUP-003` | O produto deve disponibilizar canal de suporte. | Should | Canal é informado em local acessível. |
| `RF-SUP-004` | O sistema deve oferecer conteúdo de orientação aos empreendedores. | Should | Material pode ser acessado em mobile. |
| `RF-SUP-005` | O sistema deve permitir envio de feedback sobre a plataforma. | Should | Feedback é registrado. |

## 13.18 Administração

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---:|---|
| `RF-ADM-001` | Administrador deve poder cadastrar e editar praias. | Should | Novos territórios ficam disponíveis. |
| `RF-ADM-002` | Administrador deve poder gerenciar categorias. | Should | Alterações preservam integridade. |
| `RF-ADM-003` | Administrador deve poder criar ou revogar acesso de curador. | Must | Permissão é aplicada imediatamente conforme política. |
| `RF-ADM-004` | Administrador deve consultar trilha de auditoria. | Must | Busca por usuário, ação e período. |
| `RF-ADM-005` | Administrador deve gerenciar textos de termos e privacidade por versão. | Should | Aceites anteriores permanecem vinculados à versão. |
| `RF-ADM-006` | Administrador deve poder configurar parâmetros operacionais. | Could | Configurações são validadas e auditadas. |

---

# 14. Regras de negócio

| ID | Regra |
|---|---|
| `RN-001` | Apenas perfis aprovados, ativos e não suspensos podem aparecer publicamente. |
| `RN-002` | Perfil novo inicia como rascunho ou pendente, nunca como aprovado. |
| `RN-003` | Rejeição, suspensão e solicitação de correção exigem justificativa. |
| `RN-004` | Um curador não pode aprovar perfil de sua própria titularidade. |
| `RN-005` | Alterações críticas em perfil aprovado devem gerar nova análise. |
| `RN-006` | Nome comercial, categoria principal, praia, descrição, contato autorizado e localização são obrigatórios para submissão. |
| `RN-007` | Coordenadas devem respeitar latitude entre `-90` e `90` e longitude entre `-180` e `180`. |
| `RN-008` | A geolocalização do turista somente pode ser acessada após permissão do dispositivo. |
| `RN-009` | Negar geolocalização não pode impedir a busca manual. |
| `RN-010` | Avaliação somente pode ser criada por turista autenticado. |
| `RN-011` | Nota válida é um inteiro entre 1 e 5. |
| `RN-012` | No MVP, cada turista pode manter uma avaliação ativa por perfil comercial; nova submissão deve atualizar a avaliação existente ou ser bloqueada com orientação. |
| `RN-013` | Avaliações removidas por moderação devem manter registro de auditoria. |
| `RN-014` | Empreendedor não pode editar ou apagar diretamente avaliações de turistas. |
| `RN-015` | Visualizações repetidas pelo mesmo contexto dentro da janela de deduplicação não devem inflar métricas. |
| `RN-016` | A janela de deduplicação de visualizações deve ser configurável; valor inicial recomendado: 30 minutos. |
| `RN-017` | Clique de contato representa intenção de contato, não contratação ou venda confirmada. |
| `RN-018` | Dados analíticos devem ser apresentados de forma agregada sempre que possível. |
| `RN-019` | Preço opcional deve indicar seu tipo: fixo, a partir de, faixa ou sob consulta. |
| `RN-020` | Serviço inativo ou indisponível não deve ser apresentado como disponível. |
| `RN-021` | Evento temporário encerrado não deve aparecer entre eventos futuros. |
| `RN-022` | Exclusão de conta deve observar obrigações de auditoria e anonimização. |
| `RN-023` | Dados pessoais privados não podem ser exibidos em perfil público. |
| `RN-024` | Toda decisão de curadoria deve possuir responsável e timestamp. |
| `RN-025` | A indisponibilidade do analytics não pode bloquear operações transacionais principais. |
| `RN-026` | Mensagens assíncronas podem ser entregues mais de uma vez; consumidores devem ser idempotentes. |
| `RN-027` | Um erro de notificação não deve reverter aprovação ou rejeição concluída. |
| `RN-028` | Dados econômicos só podem ser publicados após validação de fonte. |
| `RN-029` | Conteúdo ofensivo, fraudulento ou ilegal pode ser suspenso após processo de moderação. |
| `RN-030` | O usuário deve ser informado quando uma ação o direcionar a serviço externo. |
| `RN-031` | O selo de verificação representa aprovação cadastral, não garantia absoluta da qualidade do serviço. |
| `RN-032` | A plataforma não deve garantir preço, disponibilidade ou resultado comercial sem confirmação direta do prestador. |
| `RN-033` | Mudanças em regras de cálculo de indicadores devem ser versionadas. |
| `RN-034` | Novas praias devem reutilizar a mesma estrutura de dados e permissões. |
| `RN-035` | Conteúdo público deve possuir identificação clara do responsável pelo cadastro ou perfil, sem exposição indevida. |

---

# 15. Requisitos de dados

## 15.1 Entidades principais

### Usuário

- identificador;
- e-mail;
- senha protegida;
- papel;
- status;
- data de criação;
- data de atualização;
- última autenticação;
- versão dos termos aceitos.

### Perfil pessoal

- identificador;
- usuário;
- nome;
- telefone;
- foto;
- preferências;
- configurações de privacidade.

### Praia

- identificador;
- nome;
- município;
- estado;
- coordenada central;
- limite geográfico opcional;
- status.

### Perfil comercial

- identificador;
- proprietário;
- nome comercial;
- descrição;
- categoria principal;
- categorias secundárias;
- praia;
- latitude;
- longitude;
- endereço ou referência;
- telefone público;
- WhatsApp público;
- horários;
- imagens;
- acessibilidade;
- status de curadoria;
- status operacional;
- data da última atualização.

### Serviço

- identificador;
- perfil comercial;
- título;
- descrição;
- categoria;
- tipo de preço;
- valor ou faixa;
- duração;
- disponibilidade;
- imagens;
- status.

### Avaliação

- identificador;
- perfil comercial;
- turista;
- nota;
- comentário;
- status;
- data de criação;
- data de atualização;
- motivo de moderação, quando aplicável.

### Interação

- identificador;
- tipo;
- perfil comercial;
- usuário ou sessão anonimizada;
- origem;
- data;
- metadados mínimos;
- identificador de deduplicação.

### Curadoria

- identificador;
- perfil ou conteúdo analisado;
- status anterior;
- decisão;
- curador;
- justificativa;
- data;
- versão analisada.

### Notificação

- identificador;
- destinatário;
- tipo;
- título;
- mensagem;
- estado de leitura;
- canal;
- estado de entrega;
- data.

### Evento de analytics

- identificador do evento;
- tipo;
- versão;
- origem;
- data de ocorrência;
- entidade relacionada;
- território;
- categoria;
- dados mínimos permitidos.

## 15.2 Requisitos de qualidade dos dados

| ID | Requisito |
|---|---|
| `RD-001` | Identificadores devem ser globalmente únicos. |
| `RD-002` | Datas devem ser armazenadas com timezone padronizado, preferencialmente UTC. |
| `RD-003` | Valores monetários não devem ser armazenados em ponto flutuante binário. |
| `RD-004` | Campos de texto devem possuir limite máximo. |
| `RD-005` | Coordenadas devem ser validadas e indexadas geograficamente. |
| `RD-006` | Relações devem impedir registros órfãos quando aplicável. |
| `RD-007` | Exclusões lógicas devem ser usadas quando auditoria for necessária. |
| `RD-008` | Alterações críticas devem preservar histórico. |
| `RD-009` | Dados analíticos não devem replicar dados pessoais além do necessário. |
| `RD-010` | Imagens devem possuir tipo, tamanho e origem validados. |
| `RD-011` | Campos categóricos devem utilizar enumeração ou tabela controlada. |
| `RD-012` | A versão do contrato de evento deve ser armazenada. |
| `RD-013` | Registros duplicados devem ser prevenidos por restrições e idempotência. |
| `RD-014` | O sistema deve possuir rotina de backup e restauração testável. |

---

# 16. Requisitos de integração

| ID | Integração | Requisito |
|---|---|---|
| `RI-001` | Mapas | O frontend deve consumir provedor de mapas por chave configurável, nunca fixa no código. |
| `RI-002` | Geolocalização | O sistema deve utilizar API do dispositivo apenas após permissão. |
| `RI-003` | WhatsApp | O contato deve utilizar link oficial compatível, com número sanitizado. |
| `RI-004` | RabbitMQ | Eventos devem usar exchange, routing key, filas duráveis e confirmação apropriada. |
| `RI-005` | Banco geográfico | Consultas por proximidade devem usar índice geoespacial. |
| `RI-006` | Notificações | Provedores externos devem ser encapsulados para permitir substituição. |
| `RI-007` | Upload de imagens | O provedor de armazenamento deve ser configurável. |
| `RI-008` | APIs REST | Respostas devem usar contrato consistente, validação e códigos HTTP adequados. |
| `RI-009` | Autenticação | Serviços protegidos devem validar a identidade e as permissões. |
| `RI-010` | Analytics | Eventos de negócio devem ser processados sem acoplamento direto à resposta do usuário. |

---

# 17. Requisitos de eventos assíncronos

## 17.1 Eventos mínimos

| Evento | Emissor | Consumidores esperados |
|---|---|---|
| `profile.submitted` | Perfil/Catálogo | Curadoria, Notificação |
| `profile.approved` | Curadoria | Catálogo, Notificação, Analytics |
| `profile.rejected` | Curadoria | Notificação, Analytics |
| `profile.correction_requested` | Curadoria | Notificação |
| `profile.suspended` | Curadoria | Catálogo, Notificação |
| `profile.viewed` | Catálogo | Analytics |
| `contact.clicked` | Interações | Analytics |
| `review.submitted` | Avaliações | Analytics, Curadoria |
| `review.updated` | Avaliações | Analytics |
| `review.moderated` | Curadoria | Avaliações, Analytics |
| `notification.requested` | Serviços de domínio | Notificação |
| `service.updated` | Catálogo | Analytics opcional |

## 17.2 Envelope obrigatório

Todo evento deve possuir:

```json
{
  "eventId": "uuid",
  "eventType": "profile.viewed",
  "eventVersion": 1,
  "occurredAt": "2026-06-28T18:00:00.000Z",
  "producer": "service-catalog",
  "correlationId": "uuid",
  "actor": {
    "userId": "uuid-ou-null",
    "role": "TOURIST"
  },
  "data": {}
}
```

## 17.3 Regras de mensageria

| ID | Requisito |
|---|---|
| `RNF-EVT-001` | Filas de negócio devem ser duráveis. |
| `RNF-EVT-002` | Mensagens devem possuir identificador único. |
| `RNF-EVT-003` | Consumidores devem ser idempotentes. |
| `RNF-EVT-004` | Falhas temporárias devem ser retentadas com limite. |
| `RNF-EVT-005` | Mensagens não processáveis devem ir para fila de erro ou DLQ. |
| `RNF-EVT-006` | Mensagens somente devem ser confirmadas após processamento válido. |
| `RNF-EVT-007` | Dados sensíveis não devem ser enviados sem necessidade. |
| `RNF-EVT-008` | Mudanças incompatíveis devem aumentar a versão do evento. |
| `RNF-EVT-009` | Logs devem incluir `eventId` e `correlationId`. |
| `RNF-EVT-010` | A indisponibilidade do broker deve ser tratada sem corromper a operação principal. |

---

# 18. Requisitos não funcionais

## 18.1 Desempenho

| ID | Requisito |
|---|---|
| `RNF-DES-001` | Consultas comuns devem responder, no percentil 95, em até 2 segundos no ambiente de referência, excluindo dependências externas lentas. |
| `RNF-DES-002` | Busca geográfica deve usar paginação e índice. |
| `RNF-DES-003` | O frontend deve carregar conteúdo essencial antes de recursos não críticos. |
| `RNF-DES-004` | Imagens devem ser comprimidas e carregadas sob demanda. |
| `RNF-DES-005` | Operações de analytics não devem aumentar significativamente a latência das APIs transacionais. |
| `RNF-DES-006` | O mapa não deve carregar quantidade ilimitada de marcadores em uma única consulta. |

## 18.2 Disponibilidade e resiliência

| ID | Requisito |
|---|---|
| `RNF-RES-001` | Falha do analytics não deve interromper autenticação, busca, contato ou avaliação. |
| `RNF-RES-002` | Serviços devem possuir endpoint de saúde. |
| `RNF-RES-003` | Dependências devem possuir timeout. |
| `RNF-RES-004` | Chamadas internas não devem aguardar indefinidamente. |
| `RNF-RES-005` | Mensagens pendentes devem ser processadas após recuperação do consumidor. |
| `RNF-RES-006` | O sistema deve evitar repetição infinita de falhas. |
| `RNF-RES-007` | Bancos devem possuir persistência fora do ciclo de vida do container. |
| `RNF-RES-008` | O procedimento de restauração deve ser testado antes da entrega final. |

## 18.3 Escalabilidade e replicabilidade

| ID | Requisito |
|---|---|
| `RNF-ESC-001` | Serviços devem poder ser escalados independentemente. |
| `RNF-ESC-002` | Inclusão de nova praia não deve exigir novo conjunto de serviços. |
| `RNF-ESC-003` | Configurações territoriais devem ser armazenadas como dados. |
| `RNF-ESC-004` | APIs devem ser stateless sempre que possível. |
| `RNF-ESC-005` | Consumidores concorrentes devem evitar processamento incorreto duplicado. |
| `RNF-ESC-006` | O sistema deve suportar segmentação de indicadores por território. |

## 18.4 Usabilidade

| ID | Requisito |
|---|---|
| `RNF-USA-001` | Fluxos principais devem funcionar em linguagem simples. |
| `RNF-USA-002` | Formulários devem indicar campos obrigatórios. |
| `RNF-USA-003` | Erros devem aparecer próximos ao campo relacionado. |
| `RNF-USA-004` | A plataforma deve evitar termos técnicos para usuários finais. |
| `RNF-USA-005` | O cadastro do empreendedor deve permitir salvar progresso. |
| `RNF-USA-006` | A interface deve fornecer estados de carregamento, vazio, sucesso e erro. |
| `RNF-USA-007` | Ações destrutivas devem exigir confirmação. |
| `RNF-USA-008` | O usuário deve ser informado sobre o próximo passo após submissão. |

## 18.5 Acessibilidade

| ID | Requisito |
|---|---|
| `RNF-ACE-001` | A interface deve buscar conformidade com WCAG 2.1 nível AA. |
| `RNF-ACE-002` | Elementos interativos devem ser acessíveis por teclado. |
| `RNF-ACE-003` | Imagens informativas devem possuir texto alternativo. |
| `RNF-ACE-004` | Formulários devem possuir rótulos associados. |
| `RNF-ACE-005` | Contraste de texto e controles deve ser adequado. |
| `RNF-ACE-006` | Informações não devem depender exclusivamente de cor. |
| `RNF-ACE-007` | O mapa deve possuir alternativa textual em forma de lista. |

## 18.6 Compatibilidade

| ID | Requisito |
|---|---|
| `RNF-COMP-001` | O frontend deve funcionar nas versões atuais suportadas de Chrome, Edge, Firefox e Safari. |
| `RNF-COMP-002` | A interface deve ser responsiva a partir de largura móvel comum. |
| `RNF-COMP-003` | Funções Must devem operar em Android e iOS por navegador moderno. |
| `RNF-COMP-004` | APIs devem usar JSON UTF-8. |
| `RNF-COMP-005` | Datas exibidas devem respeitar o fuso e a localidade configurada. |

## 18.7 Manutenibilidade

| ID | Requisito |
|---|---|
| `RNF-MAN-001` | Cada módulo deve possuir responsabilidades claramente delimitadas. |
| `RNF-MAN-002` | Código deve seguir lint, formatação e convenções do projeto. |
| `RNF-MAN-003` | Regras de negócio críticas devem possuir testes automatizados. |
| `RNF-MAN-004` | Configurações devem vir de variáveis de ambiente. |
| `RNF-MAN-005` | Segredos não devem ser versionados. |
| `RNF-MAN-006` | APIs devem possuir documentação atualizada. |
| `RNF-MAN-007` | Migrações de banco devem ser versionadas. |
| `RNF-MAN-008` | Alterações de contrato devem ser revisadas antes do merge. |
| `RNF-MAN-009` | Dependências devem ser atualizadas de forma controlada. |
| `RNF-MAN-010` | O ambiente deve iniciar por procedimento documentado. |

## 18.8 Observabilidade

| ID | Requisito |
|---|---|
| `RNF-OBS-001` | Serviços devem produzir logs estruturados. |
| `RNF-OBS-002` | Logs devem incluir serviço, nível, timestamp e correlation ID. |
| `RNF-OBS-003` | Senhas, tokens e dados sensíveis não devem aparecer em logs. |
| `RNF-OBS-004` | Erros devem possuir código rastreável. |
| `RNF-OBS-005` | O ambiente deve permitir verificar saúde do banco e do broker. |
| `RNF-OBS-006` | Métricas técnicas mínimas devem incluir requisições, erros e latência. |
| `RNF-OBS-007` | Filas pendentes e DLQ devem ser monitoráveis. |
| `RNF-OBS-008` | Auditoria de negócio deve ser separável de logs técnicos. |

---

# 19. Segurança

## 19.1 Requisitos gerais

| ID | Requisito |
|---|---|
| `RS-001` | Senhas devem ser armazenadas com algoritmo de hash apropriado e salt. |
| `RS-002` | Senha nunca deve ser retornada por API. |
| `RS-003` | Tokens devem possuir expiração. |
| `RS-004` | Recursos devem validar autenticação e autorização no backend. |
| `RS-005` | O frontend não deve ser considerado fonte confiável de autorização. |
| `RS-006` | Entradas devem ser validadas por lista de propriedades permitidas. |
| `RS-007` | Consultas devem ser protegidas contra injeção. |
| `RS-008` | Uploads devem validar extensão, MIME, tamanho e conteúdo permitido. |
| `RS-009` | APIs devem limitar requisições em rotas sensíveis. |
| `RS-010` | Tentativas repetidas de login devem ser limitadas. |
| `RS-011` | Erros internos não devem expor stack trace em produção. |
| `RS-012` | Comunicação em produção deve usar HTTPS. |
| `RS-013` | CORS deve permitir apenas origens configuradas. |
| `RS-014` | Cabeçalhos de segurança devem ser configurados. |
| `RS-015` | Segredos devem ser armazenados fora do repositório. |
| `RS-016` | Acesso administrativo deve ser auditado. |
| `RS-017` | Dados de perfis suspensos não devem permanecer acessíveis por URL pública. |
| `RS-018` | Links externos devem ser sanitizados. |
| `RS-019` | A aplicação deve mitigar abuso de avaliações e contatos. |
| `RS-020` | Dependências com vulnerabilidade crítica conhecida devem ser corrigidas antes da produção. |

## 19.2 Matriz de autorização resumida

| Recurso | Turista | Empreendedor | Curador | Administrador |
|---|---:|---:|---:|---:|
| Pesquisar perfis | Sim | Sim | Sim | Sim |
| Avaliar perfil | Sim | Não como proprietário | Conforme política | Conforme política |
| Criar perfil comercial | Não | Sim | Opcional | Sim |
| Editar próprio perfil | Sim | Sim | Sim | Sim |
| Editar perfil de terceiro | Não | Não | Apenas moderação | Sim |
| Aprovar cadastro | Não | Não | Sim | Sim |
| Consultar métricas próprias | Não | Sim | Não | Sim |
| Consultar indicadores agregados | Não | Não | Sim | Sim |
| Gerenciar curadores | Não | Não | Não | Sim |

---

# 20. Privacidade e LGPD

| ID | Requisito |
|---|---|
| `LGPD-001` | O sistema deve informar finalidade da coleta dos dados. |
| `LGPD-002` | O sistema deve coletar somente dados necessários. |
| `LGPD-003` | O sistema deve registrar aceite dos termos e aviso de privacidade. |
| `LGPD-004` | Consentimentos opcionais devem ser separados de funcionalidades essenciais. |
| `LGPD-005` | O usuário deve poder solicitar acesso aos próprios dados. |
| `LGPD-006` | O usuário deve poder solicitar correção dos próprios dados. |
| `LGPD-007` | O usuário deve poder solicitar exclusão ou anonimização, observadas obrigações legais. |
| `LGPD-008` | Dados públicos e privados devem ser claramente separados. |
| `LGPD-009` | Localização precisa do turista não deve ser armazenada por padrão. |
| `LGPD-010` | Analytics deve preferir identificadores anonimizados ou pseudonimizados. |
| `LGPD-011` | Dados devem possuir prazo de retenção definido. |
| `LGPD-012` | Incidentes devem possuir procedimento de resposta. |
| `LGPD-013` | Acesso a dados pessoais deve respeitar o menor privilégio. |
| `LGPD-014` | Exportações devem ser protegidas e auditadas. |
| `LGPD-015` | Provedores externos devem ser avaliados quanto à proteção dos dados. |
| `LGPD-016` | O sistema deve manter contato ou canal para solicitações de privacidade. |
| `LGPD-017` | Logs não devem conter conteúdo desnecessário de avaliações ou mensagens pessoais. |
| `LGPD-018` | Backups devem seguir a mesma política de proteção e retenção. |

---

# 21. Casos de uso principais

## UC-001 — Cadastrar turista

**Ator principal:** visitante  
**Pré-condição:** não possuir conta com o mesmo e-mail.  
**Fluxo principal:**

1. visitante acessa cadastro;
2. informa nome, e-mail e senha;
3. lê e aceita termos obrigatórios;
4. sistema valida os campos;
5. sistema cria conta com papel de turista;
6. sistema confirma o cadastro.

**Fluxos alternativos:**

- e-mail já cadastrado;
- senha fora da política;
- termos não aceitos;
- falha temporária.

**Pós-condição:** conta criada de forma segura.

## UC-002 — Cadastrar empreendedor e perfil comercial

**Ator principal:** empreendedor  
**Pré-condição:** conta autenticada com papel apropriado.  
**Fluxo principal:**

1. empreendedor cria ou completa perfil pessoal;
2. inicia perfil comercial;
3. informa dados obrigatórios;
4. seleciona categoria e praia;
5. marca localização;
6. informa contato público;
7. salva rascunho;
8. revisa;
9. envia para curadoria;
10. sistema registra submissão.

**Pós-condição:** perfil pendente e não público.

## UC-003 — Pesquisar serviço próximo

**Ator principal:** turista  
**Pré-condição:** nenhuma.  
**Fluxo principal:**

1. turista acessa pesquisa;
2. autoriza localização ou seleciona praia;
3. escolhe categoria ou texto;
4. sistema consulta perfis aprovados;
5. resultados aparecem em lista e mapa;
6. turista ordena ou filtra;
7. turista abre um perfil.

**Pós-condição:** visualização válida é registrada.

## UC-004 — Entrar em contato

**Ator principal:** turista  
**Pré-condição:** perfil ativo com contato público.  
**Fluxo principal:**

1. turista abre perfil;
2. seleciona WhatsApp ou telefone;
3. sistema informa uso de canal externo;
4. sistema registra intenção;
5. canal externo é aberto.

**Pós-condição:** intenção registrada, sem promessa de contratação.

## UC-005 — Avaliar empreendedor

**Ator principal:** turista autenticado  
**Pré-condição:** perfil aprovado e ativo.  
**Fluxo principal:**

1. turista seleciona avaliar;
2. escolhe nota;
3. informa comentário opcional;
4. sistema valida regra anti-spam;
5. sistema salva avaliação;
6. média é atualizada;
7. evento é publicado.

**Pós-condição:** avaliação visível conforme política.

## UC-006 — Aprovar perfil

**Ator principal:** curador  
**Pré-condição:** perfil pendente e curador autorizado.  
**Fluxo principal:**

1. curador abre fila;
2. seleciona cadastro;
3. verifica dados;
4. escolhe aprovar;
5. sistema valida conflito de interesse;
6. decisão é registrada;
7. perfil torna-se público;
8. empreendedor é notificado.

**Pós-condição:** perfil aprovado e auditado.

## UC-007 — Solicitar correção

**Ator principal:** curador  
**Fluxo principal:**

1. curador identifica problema;
2. informa justificativa;
3. solicita correção;
4. sistema registra decisão;
5. perfil não fica público;
6. empreendedor recebe notificação;
7. empreendedor corrige e reenvia.

## UC-008 — Consultar métricas

**Ator principal:** empreendedor  
**Pré-condição:** perfil pertencente ao usuário.  
**Fluxo principal:**

1. empreendedor abre painel;
2. seleciona perfil e período;
3. sistema valida propriedade;
4. sistema retorna visualizações, contatos e avaliações;
5. interface exibe indicadores e explicações.

---

# 22. Histórias de usuário e critérios de aceite

## US-001 — Descobrir serviços próximos

**Como** turista,  
**quero** encontrar serviços próximos à minha localização,  
**para** escolher opções convenientes durante a visita.

### Critérios

```gherkin
Dado que autorizei a localização
E existem perfis aprovados dentro do raio
Quando eu executar a busca
Então devo visualizar somente perfis ativos no raio selecionado
E cada resultado deve mostrar a distância aproximada
E os mesmos filtros devem ser refletidos no mapa
```

## US-002 — Buscar sem compartilhar localização

**Como** turista,  
**quero** selecionar uma praia manualmente,  
**para** pesquisar sem compartilhar minha posição.

```gherkin
Dado que neguei a permissão de localização
Quando eu selecionar "Porto de Galinhas"
Então o sistema deve permitir a pesquisa normalmente
E não deve insistir de forma bloqueante na permissão
```

## US-003 — Submeter perfil à curadoria

**Como** empreendedor,  
**quero** enviar meu perfil para análise,  
**para** aparecer na plataforma após aprovação.

```gherkin
Dado que preenchi todos os campos obrigatórios
Quando eu confirmar a submissão
Então o perfil deve ficar com status pendente
E não deve aparecer nas buscas públicas
E uma notificação de submissão deve ser registrada
```

## US-004 — Receber justificativa

**Como** empreendedor,  
**quero** entender por que meu perfil precisa de correção,  
**para** ajustar os dados corretamente.

```gherkin
Dado que um curador solicitou correção
Quando eu abrir o status do perfil
Então devo visualizar a justificativa
E devo poder editar e reenviar o cadastro
```

## US-005 — Avaliar experiência

**Como** turista autenticado,  
**quero** avaliar um prestador,  
**para** compartilhar minha experiência.

```gherkin
Dado que estou autenticado como turista
E o perfil está aprovado
Quando eu enviar nota entre 1 e 5
Então a avaliação deve ser salva
E a média deve ser recalculada
E o empreendedor não deve poder alterá-la
```

## US-006 — Consultar interesse

**Como** empreendedor,  
**quero** visualizar visualizações e contatos,  
**para** compreender o interesse dos turistas.

```gherkin
Dado que sou proprietário do perfil
Quando eu selecionar os últimos 30 dias
Então devo visualizar apenas métricas do meu perfil
E a interface deve diferenciar contato de venda confirmada
```

## US-007 — Curar cadastro

**Como** curador,  
**quero** analisar cadastros pendentes,  
**para** manter informações confiáveis.

```gherkin
Dado que estou autenticado como curador
Quando eu aprovar um perfil válido
Então a decisão deve registrar meu identificador e a data
E o perfil deve tornar-se público
E o empreendedor deve ser notificado
```

## US-008 — Manter acesso durante falha do analytics

**Como** turista,  
**quero** continuar pesquisando mesmo se o analytics estiver indisponível,  
**para** não ter a experiência interrompida.

```gherkin
Dado que o serviço de analytics está indisponível
Quando eu pesquisar e abrir um perfil
Então as funções principais devem continuar disponíveis
E o evento deve ser retido ou tratado para processamento posterior
```

---

# 23. Priorização do MVP

## 23.1 Must

- autenticação;
- papéis e autorização;
- perfis pessoais;
- perfil comercial;
- categorias;
- praia e geolocalização;
- busca por texto, praia, categoria e raio;
- mapa e lista;
- curadoria;
- contato;
- avaliações;
- eventos de analytics;
- dashboard básico;
- responsividade;
- logs;
- segurança básica;
- Docker;
- testes essenciais.

## 23.2 Should

- recuperação de senha;
- galeria;
- notificações internas completas;
- denúncia;
- eventos temporários;
- gráficos;
- agrupamento de marcadores;
- suporte e materiais;
- auditoria administrativa por interface;
- PWA instalável.

## 23.3 Could

- favoritos;
- push;
- e-mail;
- empacotamento para lojas;
- recomendações;
- relatórios exportáveis;
- multilíngue;
- modo offline parcial;
- integração governamental.

## 23.4 Won't now

- pagamentos;
- reservas financeiras;
- marketplace;
- chat interno;
- emissão fiscal;
- IA avançada;
- rastreamento contínuo;
- garantia de venda;
- aplicação nativa independente.

---

# 24. Fases recomendadas

## Fase 0 — Fundação

- repositório;
- configuração;
- ambientes;
- bancos;
- mensageria;
- health checks;
- autenticação mínima;
- contratos de API;
- contratos de evento;
- CI.

## Fase 1 — Cadastro e curadoria

- contas;
- perfis;
- perfil comercial;
- localização;
- submissão;
- aprovação;
- rejeição;
- histórico.

## Fase 2 — Descoberta

- busca;
- filtros;
- mapa;
- detalhes;
- serviços;
- visualizações.

## Fase 3 — Interação

- contato;
- avaliações;
- moderação;
- notificações.

## Fase 4 — Analytics

- consumidores;
- deduplicação;
- agregações;
- painel do empreendedor;
- painel de curadoria.

## Fase 5 — Qualidade e piloto

- segurança;
- acessibilidade;
- desempenho;
- backup;
- testes E2E;
- documentação;
- dados piloto;
- capacitação.

---

# 25. Critérios gerais de aceite do produto

O MVP será aceito quando:

1. o ambiente iniciar por procedimento documentado;
2. serviços obrigatórios apresentarem saúde válida;
3. usuário puder cadastrar-se e autenticar-se;
4. autorização por papel estiver aplicada no backend;
5. empreendedor puder submeter perfil;
6. curador puder aprovar, rejeitar e solicitar correção;
7. somente perfil aprovado aparecer publicamente;
8. turista puder buscar por praia, categoria e proximidade;
9. mapa e lista apresentarem resultados compatíveis;
10. turista puder abrir contato externo;
11. contato gerar métrica de intenção;
12. turista autenticado puder avaliar;
13. média for calculada corretamente;
14. eventos forem processados com idempotência;
15. falha do analytics não bloquear funções principais;
16. empreendedor visualizar métricas próprias;
17. dados privados não aparecerem publicamente;
18. fluxos Must funcionarem em mobile;
19. regras críticas possuírem testes;
20. não houver segredo versionado;
21. backups e restauração tiverem procedimento;
22. documentação estiver atualizada;
23. erros principais tiverem mensagens compreensíveis;
24. trilha de curadoria estiver auditável.

---

# 26. Estratégia de testes

## 26.1 Testes unitários

Cobrir:

- validações;
- regras de status;
- autorização;
- média de avaliações;
- deduplicação;
- cálculo de distância;
- transformação de eventos;
- idempotência;
- regras de preço;
- regras de curadoria.

## 26.2 Testes de integração

Cobrir:

- API e banco;
- publicação e consumo de eventos;
- migrações;
- busca geográfica;
- autenticação entre camadas;
- processamento de DLQ;
- notificações;
- agregações.

## 26.3 Testes E2E

Cenários mínimos:

1. cadastro de empreendedor;
2. criação do perfil;
3. submissão;
4. aprovação;
5. busca pública;
6. visualização;
7. contato;
8. avaliação;
9. dashboard;
10. suspensão.

## 26.4 Testes de segurança

- autenticação inválida;
- acesso horizontal;
- acesso por papel incorreto;
- injeção;
- XSS;
- upload inválido;
- rate limit;
- token expirado;
- exposição de erros;
- vazamento em logs.

## 26.5 Testes de acessibilidade

- teclado;
- foco;
- rótulos;
- contraste;
- leitor de tela;
- alternativa ao mapa;
- mensagens de erro.

## 26.6 Testes de resiliência

- analytics desligado;
- RabbitMQ temporariamente indisponível;
- banco reiniciado;
- mensagem duplicada;
- consumidor falhando;
- provedor de mapa indisponível;
- notificação externa falhando.

---

# 27. Matriz de rastreabilidade

| Objetivo | Requisitos relacionados |
|---|---|
| `OBJ-001` | `RF-BUSCA-*`, `RF-MAPA-*`, `RF-DET-*`, `RF-CONT-*` |
| `OBJ-002` | `RF-EMP-*`, `RF-SERV-*`, `RF-DASH-EMP-*` |
| `OBJ-003` | `RF-GEO-*`, `RF-BUSCA-*`, `RF-MAPA-*` |
| `OBJ-004` | `RF-CUR-*`, `RF-AVAL-*`, `RN-001`, `RN-031` |
| `OBJ-005` | `RF-CONT-*` |
| `OBJ-006` | `RF-DASH-EMP-*`, eventos de analytics |
| `OBJ-007` | `RF-DASH-CUR-*`, `RD-*`, `RNF-OBS-*` |
| `OBJ-008` | `RF-GEO-011`, `RNF-ESC-*` |
| `OBJ-009` | Perfis, catálogo, contato, métricas e suporte |
| `OBJ-010` | `KPI-*`, analytics, feedback e observabilidade |

---

# 28. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---:|---|
| Dados cadastrais desatualizados | Alto | Alertas, confirmação periódica e suspensão controlada |
| Baixo letramento digital | Alto | Fluxos simples, rascunho, linguagem clara e capacitação |
| Fraude ou perfil falso | Alto | Curadoria, auditoria, denúncia e suspensão |
| Avaliações abusivas | Médio | Autenticação, unicidade, denúncia e moderação |
| Dependência de mapas | Médio | Abstração do provedor e alternativa por lista |
| Custo de infraestrutura | Médio | Escala gradual, monitoramento e serviços adequados ao uso |
| Fila de curadoria acumulada | Alto | Priorização, filtros, alertas e métricas de SLA |
| Vazamento de dados | Alto | Menor privilégio, criptografia, logs seguros e revisão |
| Dados econômicos sem fonte | Médio | Validação obrigatória antes de publicação |
| Métrica interpretada como venda | Médio | Nomear como intenção de contato e exibir aviso |
| Mensagens duplicadas | Médio | Idempotência e identificadores únicos |
| Falha de serviço | Médio | Isolamento, timeout, retry e filas duráveis |
| Crescimento territorial desorganizado | Médio | Entidade territorial e configuração por dados |
| Dependências vulneráveis | Alto | Atualização controlada e análise de segurança |
| Escopo excessivo | Alto | Priorização MoSCoW e controle formal de mudanças |

---

# 29. Suporte, manutenção e continuidade

## 29.1 Manutenção corretiva

Deve permitir:

- registro de incidente;
- priorização por impacto;
- correção;
- teste de regressão;
- implantação;
- documentação da causa.

## 29.2 Manutenção preventiva

Deve incluir:

- atualização de dependências;
- renovação de certificados;
- testes de backup;
- revisão de permissões;
- análise de filas;
- revisão de logs;
- atualização da documentação.

## 29.3 Manutenção evolutiva

Novas funcionalidades devem:

1. possuir requisito registrado;
2. indicar objetivo;
3. apresentar impacto;
4. definir prioridade;
5. possuir critério de aceite;
6. respeitar compatibilidade de APIs e eventos;
7. ser aprovadas antes da implementação.

## 29.4 Continuidade

A continuidade depende de:

- custos operacionais compatíveis;
- documentação;
- capacitação;
- monitoramento;
- backups;
- parcerias;
- governança dos dados;
- atualização cadastral;
- mensuração de valor.

---

# 30. Monitoramento de impacto

Além de métricas técnicas, o projeto deverá avaliar:

- adesão dos empreendedores;
- uso por praia;
- diversidade de categorias;
- volume de contatos;
- satisfação;
- percepção de visibilidade;
- tempo de atualização;
- tempo de curadoria;
- distribuição territorial dos resultados;
- dificuldades de uso;
- impacto percebido na geração de oportunidades.

Pesquisas de impacto devem evitar afirmar causalidade econômica sem metodologia adequada. Resultados devem distinguir:

- correlação;
- percepção;
- estimativa;
- evidência direta;
- dado observado.

---

# 31. Definition of Ready

Uma tarefa está pronta para desenvolvimento quando:

- possui requisito relacionado;
- ator está identificado;
- regra de negócio está clara;
- dependências estão registradas;
- contrato de API ou evento está definido;
- critério de aceite está escrito;
- dados necessários estão definidos;
- impacto de segurança foi considerado;
- não existe ambiguidade bloqueante.

---

# 32. Definition of Done

Uma tarefa está concluída quando:

- código foi implementado;
- revisão foi realizada;
- lint e build passam;
- testes relevantes passam;
- critério de aceite foi validado;
- documentação foi atualizada;
- migração foi criada, quando necessária;
- logs não expõem dados sensíveis;
- autorização foi verificada;
- comportamento mobile foi testado;
- alteração foi integrada sem quebrar contratos;
- não existem segredos no commit.

---

# 33. Controle de mudanças

Toda mudança de requisito deve registrar:

- identificador;
- descrição;
- motivo;
- solicitante;
- impacto funcional;
- impacto técnico;
- impacto em dados;
- impacto em segurança;
- prioridade;
- decisão;
- data;
- versão do documento.

Mudanças Must durante a implementação devem ser avaliadas pela equipe antes de alterar o escopo.

---

# 34. Decisões que exigem validação da equipe

Antes do fechamento da baseline, a equipe deve validar:

1. se o MVP será apenas PWA ou também empacotado;
2. provedor de mapas;
3. política de recuperação de senha;
4. política de armazenamento de imagens;
5. janela de deduplicação;
6. regra final de unicidade da avaliação;
7. critérios de alterações críticas que exigem nova curadoria;
8. prazo de atualização cadastral;
9. prazo esperado para curadoria;
10. canais de notificação;
11. política de retenção;
12. categorias iniciais;
13. formato de suporte;
14. metas do piloto;
15. responsável institucional pela curadoria.

Enquanto essas decisões não forem formalizadas, devem ser utilizadas as recomendações deste documento, sem inventar regras adicionais diretamente no código.

---

# 35. Checklist de validação da baseline

- [ ] Objetivos revisados pela equipe.
- [ ] Escopo Must aprovado.
- [ ] Fora do escopo aceito.
- [ ] Papéis confirmados.
- [ ] Categorias iniciais confirmadas.
- [ ] Praias iniciais confirmadas.
- [ ] Fluxo de curadoria aprovado.
- [ ] Política de avaliação aprovada.
- [ ] Dados públicos e privados definidos.
- [ ] Política LGPD revisada.
- [ ] Provedor de mapas definido.
- [ ] Contratos de evento validados.
- [ ] Critérios de aceite testáveis.
- [ ] Estratégia mobile confirmada.
- [ ] Plano de suporte definido.
- [ ] Fontes dos dados econômicos validadas.
- [ ] Documento versionado no repositório.

---

# 36. Resumo executivo

O Praieira App deverá conectar turistas e empreendedores locais por meio de uma plataforma territorial, responsiva, georreferenciada e confiável.

O núcleo do MVP é composto por:

- cadastro;
- perfis;
- catálogo;
- busca;
- mapa;
- curadoria;
- avaliações;
- contato;
- analytics;
- painéis;
- segurança;
- privacidade;
- operação resiliente.

A confiabilidade dependerá de quatro pilares:

1. **dados atualizados;**
2. **curadoria auditável;**
3. **proteção de dados;**
4. **métricas interpretadas corretamente.**

A plataforma será considerada preparada para expansão quando novos territórios, categorias e volumes de uso puderem ser incorporados sem duplicar a arquitetura ou comprometer os dados existentes.
