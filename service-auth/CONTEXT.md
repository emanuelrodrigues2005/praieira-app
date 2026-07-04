# Auth & Profile — Glossário de Domínio

> Contexto responsável pela identidade, autenticação, papéis e perfil pessoal dos usuários da plataforma.
> **Diretório:** `service-auth/`

---

## Usuário (User)

Pessoa que possui cadastro na plataforma. Todo usuário tem obrigatoriamente um papel. Um mesmo usuário não pode acumular mais de um papel simultaneamente.

## Papel (Role)

Função que o usuário exerce na plataforma, determinando o que ele pode ou não fazer. Os papéis são mutuamente exclusivos.

### Turista (Tourist)

Usuário cujo objetivo é descobrir serviços, estabelecimentos e experiências nas praias. Pode pesquisar, visualizar perfis, entrar em contato com empreendedores e publicar avaliações.

**Papel no código:** `TOURIST`

### Empreendedor (Worker)

Usuário que oferece produtos, serviços ou experiências ao turista. Inclui barraqueiros, ambulantes, bugueiros, operadores de passeios, donos de bares e restaurantes, artesãos, lojistas e quiosques.

Pode cadastrar seu perfil comercial, submetê-lo à curadoria, atualizar informações e consultar suas métricas.

> **Nota de terminologia:** O domínio de negócio chama este ator de **Empreendedor**. O código usa `WORKER` como identificador do papel. Os dois termos referem-se ao mesmo ator.

**Papel no código:** `WORKER`

### Curador (Curator)

Usuário autorizado a validar perfis comerciais submetidos pelos empreendedores. Decide pela aprovação, rejeição ou solicitação de correção. Também modera avaliações e analisa denúncias.

**Papel no código:** `CURATOR`

### Administrador (Admin)

Usuário responsável pela operação técnica da plataforma. Gerencia curadores, configurações globais, categorias e praias. No MVP acadêmico, suas funções podem ser exercidas por configuração direta (seed), sem interface completa.

**Papel no código:** `ADMIN`

## Perfil pessoal

Conjunto de dados básicos que identificam um usuário: nome, email e telefone. Diferente do perfil comercial, que pertence ao contexto de Catalog.

## Autenticação (Authentication)

Processo pelo qual o usuário prova sua identidade (login/senha) e recebe um token de acesso. O token é usado em todas as requisições subsequentes.

## Sessão (Session)

Período de uso autenticado, delimitado pela emissão e expiração do token de acesso. O token de acesso tem vida curta; a renovação é feita por token de atualização (refresh).
