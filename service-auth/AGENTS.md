# service-auth — AGENTS.md

> Módulo 2: Auth & Profile Service
> Responsável: Gustavo

## Objetivo

Prover identidade, autenticação e gestão de perfis pessoais dos usuários. É o serviço de entrada da plataforma — todo fluxo começa aqui. Define e emite os tokens JWT que os demais serviços validam.

**Domínio:** Usuário, Papel (TOURIST, WORKER, CURATOR, ADMIN), Perfil pessoal, Autenticação, Sessão.
**Glossário completo:** `CONTEXT.md`

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | NestJS 10 |
| Linguagem | TypeScript 5.7 |
| ORM | Prisma 5 |
| Banco | PostgreSQL 15 (`db_auth`) |
| Autenticação | JWT + Passport (`@nestjs/passport`, `passport-jwt`) |
| Validação | `class-validator` + `class-transformer` |
| Hash de senha | bcryptjs |
| Documentação | Swagger/OpenAPI |

## Porta

**3001** — porta fixa e exclusiva. Nenhum outro serviço pode usar esta porta.

## Como rodar

### Local (desenvolvimento)

```bash
cd service-auth
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

O serviço sobe em `http://localhost:3001`. Swagger em `http://localhost:3001/api`.

### Docker

```bash
docker compose up --build service-auth
```

O `entrypoint.sh` aguarda o PostgreSQL, aplica o schema (migrate ou db push) e inicia a aplicação.

## Contratos principais

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/auth/register` | público | Cadastro de usuário |
| `POST` | `/auth/login` | público | Login, retorna JWT |
| `POST` | `/auth/refresh` | autenticado | Renova token de acesso |
| `POST` | `/auth/logout` | autenticado | Invalida sessão |
| `GET` | `/auth/me` | autenticado | Dados do usuário autenticado |
| `GET` | `/health` | público | Saúde do serviço |

## Regras críticas

1. **JWT deve ser compatível entre todos os serviços.** Mesmo segredo (`JWT_SECRET`), mesmo algoritmo, mesma estrutura de payload (`sub`, `role`, `email`).
2. **Identidade vem do token, nunca do body.** Nenhum endpoint deve aceitar `userId` como parâmetro de entrada — o `sub` do JWT é a fonte da verdade.
3. **Papéis são mutuamente exclusivos.** Um usuário tem exatamente um papel.
4. **Curadores não podem ser criados por cadastro público.** Apenas seed ou administrador provisiona `CURATOR`.
5. **Senhas nunca aparecem em logs, respostas ou eventos.**
