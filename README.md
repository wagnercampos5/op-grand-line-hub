# Grand Line Hub

Plataforma full-stack inspirada no universo de *One Piece* construída em monorepo `pnpm`, integrando um diário colaborativo de navegação (**Crônicas da Grand Line**) e um quadro de vagas e recompensas (**Mural de Contratos & Tripulações**).

---

## Ambiente em Produção (Deploy)

- **Aplicação Web (Vercel):** [Acessar Grand Line Hub](https://https://op-grand-line-hub.vercel.app)
- **API REST & Swagger Docs (Render):** [Acessar Documentação da API](https://https://op-grand-line-api.onrender.comapi/docs)
- **Banco de Dados:** PostgreSQL 16 gerenciado via Supabase

> **Nota sobre cold start:** Como a API utiliza o plano gratuito do Render, a primeira requisição após um período de inatividade pode levar cerca de 30 segundos para despertar o servidor.

---

## Sumário

- [Ambiente em Produção (Deploy)](#ambiente-em-produção-deploy)
- [Funcionalidades](#funcionalidades)
- [Arquitetura do Monorepo](#arquitetura-do-monorepo)
- [Stack Tecnológica](#stack-tecnológica)
- [Endpoints da API e Swagger](#endpoints-da-api-e-swagger)
- [Setup Local com Docker, Migrations e Seed](#setup-local-com-docker-migrations-e-seed)
- [Scripts Disponíveis e Qualidade](#scripts-disponíveis-e-qualidade)
- [Integração Contínua (CI)](#integração-contínua-ci)
- [Como o `AGENTS.md` Foi Usado no Fluxo com IA](#como-o-agentsmd-foi-usado-no-fluxo-com-ia)
- [Capturas de Tela](#capturas-de-tela)
- [Origem do Projeto e Créditos](#origem-do-projeto-e-créditos)

---

## Funcionalidades

- **Crônicas da Grand Line (`/feed`):**
  - Listagem pública paginada (`?page=1&limit=10`), filtro por categoria (`VOYAGE_LOG`, `ISLAND_DISCOVERY`, `AKUMA_NO_MI`, `VOID_CENTURY`) e busca **Full-Text Search** nativa no PostgreSQL (`?search=termo`).
  - Exibição de imagem de capa opcional ou placeholder cartográfico temático automático quando `coverUrl` não é informado (ou falha ao carregar).
  - Publicação de crônicas (`ChronicleComposer`), curtidas idempotentes (`POST` / `DELETE /chronicles/:id/likes`) e comentários para tripulantes autenticados.
- **Mural de Contratos & Tripulações (`/contracts`):**
  - Listagem pública paginada com busca Full-Text e filtros combinados por **Mar** (`EAST_BLUE`, `GRAND_LINE`, `NEW_WORLD`), **Modalidade** (`CREW_RECRUITMENT`, `BOUNTY_HUNTER`) e **Status** (`OPEN`, `IN_PROGRESS`, `COMPLETED`).
  - Emissão de novos editais com recompensas em *Berries* armazenadas em `BigInt` (suportando valores acima de 2,14 bilhões) e atualização de status exclusiva para o autor do contrato (`403 Forbidden` para outros usuários).
- **Autenticação e Acesso de Visitantes (`/login` e `/register`):**
  - Cadastro de tripulantes com escolha de afiliação (`PIRATE`, `MARINE`, `REVOLUTIONARY`, `BOUNTY_HUNTER`), login via JWT e restauração automática de sessão via `GET /auth/me`.
  - Visitantes não autenticados navegam livremente pelas rotas `GET` públicas, com bloqueio visual e redirecionamento para autenticação nas ações interativas.

---

## Arquitetura do Monorepo

```text
op-grand-line-hub/
├── .github/workflows/ci.yml      # Pipeline de CI (PostgreSQL 16 + lint + testes + builds)
├── AGENTS.md                     # Regras arquiteturais, design tokens, segurança e Git
├── docker-compose.yml            # Container PostgreSQL 16 Alpine com volume persistente e healthcheck
├── package.json                  # Scripts globais do monorepo (pnpm)
├── pnpm-workspace.yaml           # Workspaces (apps/*) e allowBuilds nativos (bcrypt, prisma, esbuild)
├── plans/                        # Planos técnicos registrados antes da execução com IA
│   ├── implementar-auth-frontend.md
│   ├── implementar-backend-auth-db.md
│   └── implementar-feed-e-contratos.md
├── apps/
│   ├── api/                      # Back-end NestJS 12 + Prisma 7 + Swagger + Jest
│   │   ├── AGENTS.md             # Diretrizes específicas de NestJS e skills locais
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Models User, Chronicle, ChronicleLike, Comment, Contract
│   │   │   ├── seed.ts           # Seed temático idempotente (6 usuários, 6 crônicas, 6 contratos)
│   │   │   └── migrations/       # Migrations SQL versionadas (inclui índices GIN de FTS)
│   │   └── src/
│   │       ├── auth/             # AuthModule, JwtAuthGuard, OptionalJwtAuthGuard, @CurrentUser
│   │       ├── chronicles/       # ChroniclesModule (FTS PostgreSQL, curtidas, comentários)
│   │       ├── contracts/        # ContractsModule (FTS PostgreSQL, filtros, controle de autoria)
│   │       ├── common/           # DTOs compartilhados (paginação e AUTHOR_PUBLIC_SELECT)
│   │       ├── config/           # Validação fail-fast de variáveis de ambiente
│   │       ├── prisma/           # PrismaService (@prisma/adapter-pg + pg Pool)
│   │       └── users/            # UsersModule (POST /users e mapper seguro sem passwordHash)
│   └── web/                      # Front-end React 19 + Vite 8 + Tailwind CSS v4 + Vitest
│       ├── public/               # Assets estáticos (logo-grand-line.jpg, banners)
│       └── src/
│           ├── components/
│           │   ├── atoms/        # Avatar, Badge, Button, Input, Label, Select, Textarea, WantedStamp
│           │   ├── molecules/    # AffiliationBadge, FormField, ReactionButton, SearchBar
│           │   ├── organisms/    # AuthForm, ChronicleCard, ChronicleComposer, ContractCard, ContractComposer, Sidebar
│           │   ├── templates/    # AuthLayout, MainFeedLayout
│           │   └── pages/        # FeedPage, ContractsPage, LoginPage, RegisterPage
│           ├── contexts/         # AuthContext (sessão JWT e hidratação /auth/me)
│           ├── routes/           # AppRoutes (/ -> /feed, /contracts, /login, /register)
│           ├── services/         # Cliente Axios + interceptors + serviços REST tipados
│           ├── types/            # Contratos TypeScript espelhados da API
│           └── utils/            # Formatadores de Berries, datas e labels em pt-BR
```

### Front-end (`apps/web`): Atomic Design e Design Tokens

- **Hierarquia unidirecional:** componentes em `atoms/` nunca importam de `molecules/`, `organisms/`, `templates/` ou `pages/`; cada camada só depende das camadas inferiores.
- **Tokens semânticos (Tailwind CSS v4 em `apps/web/src/index.css`):** todos os componentes usam exclusivamente os tokens do bloco `@theme`, sem cores hexadecimais hardcoded nem medidas arbitrárias em pixels:
  - `ocean-abyss` (`#07131F`) — fundo principal escuro
  - `ship-deck` (`#112437`) — cards, formulários e superfícies elevadas
  - `parchment` (`#F5EBD6`) — texto principal claro
  - `mist-gray` (`#9FB3C8`) — textos secundários e metadados
  - `treasure-gold` (`#E5A93C`) — destaques primários, CTAs e recompensas
  - `log-pose-cyan` (`#38BDF8`) — links ativos, foco acessível e badges informativos
  - `crimson-bounty` (`#F25C66`) — alertas de erro, ações destrutivas e cartazes de procurado
- **Acessibilidade e Testes:** todo componente possui teste colocalizado (`*.test.tsx`) validando comportamento e conformidade WCAG 2 AA com `jest-axe` (`toHaveNoViolations()`).

### Back-end (`apps/api`): NestJS Modular, Prisma 7 e Full-Text Search

- **Prisma 7 + `@prisma/adapter-pg`:** client gerado em `apps/api/src/generated/prisma` (ignorado no Git) conectado via pool `pg` gerenciado pelo `PrismaService` com shutdown hooks habilitados.
- **Full-Text Search nativo no PostgreSQL 16:** a migration `add_chronicles_and_contracts` cria índices `GIN` ponderados (`setweight(..., 'A')` no título e `'B'` no corpo) com dicionário `'portuguese'`. As buscas (`?search=`) combinam `websearch_to_tsquery('portuguese', ...)` + `ts_rank` com `ILIKE` parametrizado via `Prisma.sql`, mantendo hidratação posterior com `AUTHOR_PUBLIC_SELECT` para nunca expor `passwordHash`.
- **Segurança:** validação global com `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`), CORS restrito por `CORS_ORIGIN`, validação de ambiente em `env.validation.ts` e proteção contra enumeração de e-mails no login por comparação timing-safe com `bcrypt`.

---

## Stack Tecnológica

| Camada | Tecnologias |
| :--- | :--- |
| **Monorepo & Runtime** | Node.js `24.x`, pnpm Workspaces (`11.x`) |
| **Front-end** | React `19`, TypeScript `6`, Vite `8`, Tailwind CSS `4`, React Router `7`, Axios |
| **Back-end** | NestJS `12`, TypeScript `6`, class-validator, class-transformer, `@nestjs/jwt`, `@nestjs/swagger`, `bcrypt` |
| **Banco de Dados & ORM** | PostgreSQL `16` (Docker / service container), Prisma `7` (`@prisma/client` + `@prisma/adapter-pg` + `pg`) |
| **Testes & Qualidade** | Vitest `5`, Testing Library, `jest-axe`, Jest `30`, Supertest, ESLint `10`, Oxlint (`--type-aware`), Prettier |
| **CI/CD** | GitHub Actions (`.github/workflows/ci.yml`) |

---

## Endpoints da API e Swagger

Com a API em execução (`http://localhost:3000`), a documentação interativa OpenAPI/Swagger fica disponível em:

- **Swagger UI:** `http://localhost:3000/api/docs`
- **OpenAPI JSON:** `http://localhost:3000/api/docs-json`

| Método | Rota | Autenticação | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/users` | Pública | Cadastra novo tripulante (`201`, `400`, `409`) |
| `POST` | `/auth/login` | Pública | Autentica usuário e retorna `{ access_token }` (`200`, `400`, `401`) |
| `GET` | `/auth/me` | `JwtAuthGuard` | Retorna perfil do usuário autenticado (`200`, `401`) |
| `GET` | `/chronicles` | `OptionalJwtAuthGuard` | Lista crônicas paginadas (`?page=&limit=&search=&category=`) |
| `POST` | `/chronicles` | `JwtAuthGuard` | Publica nova crônica (`201`, `400`, `401`) |
| `POST` | `/chronicles/:id/likes` | `JwtAuthGuard` | Curte uma crônica de forma idempotente (`200`, `400`, `401`, `404`) |
| `DELETE` | `/chronicles/:id/likes` | `JwtAuthGuard` | Remove curtida de forma idempotente (`200`, `400`, `401`, `404`) |
| `GET` | `/chronicles/:id/comments` | Pública | Lista comentários de uma crônica (`200`, `400`, `404`) |
| `POST` | `/chronicles/:id/comments` | `JwtAuthGuard` | Adiciona comentário em uma crônica (`201`, `400`, `401`, `404`) |
| `GET` | `/contracts` | Pública | Lista contratos paginados (`?page=&limit=&search=&sea=&type=&status=`) |
| `POST` | `/contracts` | `JwtAuthGuard` | Cria novo contrato com status inicial `OPEN` (`201`, `400`, `401`) |
| `PATCH` | `/contracts/:id/status` | `JwtAuthGuard` | Atualiza status do próprio contrato (`200`, `400`, `401`, `403`, `404`) |

---

## Setup Local com Docker, Migrations e Seed

### Pré-requisitos

- **Node.js** `24.x` (compatível com `require(esm)` do NestJS 12: 20.19+, 22.12+ ou 24+)
- **pnpm** `11.x` (`npm install -g pnpm` ou `corepack enable`)
- **Docker** e **Docker Compose**

### Passo a Passo

1. **Instalar as dependências do monorepo:**

   ```bash
   pnpm install
   ```

2. **Configurar as variáveis de ambiente da API:**

   Copie o template de exemplo em `apps/api/.env.example` para `apps/api/.env`:

   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

   No Windows (PowerShell):

   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   ```

   Variáveis esperadas em `apps/api/.env`:

   | Variável | Exemplo / Padrão | Observação |
   | :--- | :--- | :--- |
   | `PORT` | `3000` | Porta HTTP da API NestJS |
   | `CORS_ORIGIN` | `http://localhost:5173` | Origem permitida pelo CORS |
   | `DATABASE_URL` | `postgresql://grandline:grandline_dev_password@localhost:5432/grand_line_hub?schema=public` | String de conexão PostgreSQL 16 |
   | `JWT_SECRET` | *(32+ caracteres)* | Segredo obrigatório para assinatura JWT (troque em produção) |
   | `JWT_EXPIRES_IN` | `1d` | Tempo de expiração do token JWT |
   | `BCRYPT_SALT_ROUNDS` | `10` | Custo de hash `bcrypt` (inteiro entre 4 e 15) |

   > No front-end (`apps/web`), a URL base da API usa `VITE_API_URL` quando definida, ou `http://localhost:3000` por padrão.

3. **Subir o banco PostgreSQL 16 com Docker:**

   ```bash
   docker compose up -d
   ```

   O serviço `postgres` (`postgres:16-alpine`, container `grand-line-hub-postgres`) expõe a porta `5432`, persiste dados no volume `grand_line_postgres_data` e possui `healthcheck` com `pg_isready`.

4. **Gerar o Prisma Client e aplicar as migrations:**

   ```bash
   pnpm --filter api prisma:generate
   pnpm --filter api prisma:deploy
   ```

5. **Executar o seed temático idempotente:**

   ```bash
   pnpm db:seed
   ```

   O script `apps/api/prisma/seed.ts` compila a API (`nest build`) e popula o banco de forma idempotente (`upsert`) com **6 tripulantes**, **6 crônicas**, **6 comentários**, **13 curtidas** e **6 contratos**.

   **Credenciais de demonstração criadas pelo seed** (senha padrão para todos: `GrandLine@2026`):

   - `nico.robin@ohara.gl` — Nico Robin (`PIRATE`, `฿ 930.000.000`)
   - `luffy@thousand-sunny.gl` — Monkey D. Luffy (`PIRATE`, `฿ 3.000.000.000`)
   - `zoro@thousand-sunny.gl` — Roronoa Zoro (`BOUNTY_HUNTER`, `฿ 1.111.000.000`)
   - `smoker@g5-marine.gl` — Vice-Almirante Smoker (`MARINE`, `฿ 0`)
   - `sabo@baltigo.gl` — Sabo (`REVOLUTIONARY`, `฿ 602.000.000`)
   - `law@polar-tang.gl` — Trafalgar D. Water Law (`PIRATE`, `฿ 3.000.000.000`)

6. **Iniciar os servidores de desenvolvimento:**

   Em terminais separados (ou via `pnpm dev` em paralelo):

   ```bash
   pnpm api:dev   # API em http://localhost:3000 (Swagger em /api/docs)
   pnpm web:dev   # Front-end em http://localhost:5173
   ```

---

## Scripts Disponíveis e Qualidade

Comandos executados a partir da raiz do monorepo:

| Comando | Descrição |
| :--- | :--- |
| `pnpm dev` | Inicia front-end e back-end em paralelo |
| `pnpm web:dev` | Inicia o servidor Vite do front-end na porta `5173` |
| `pnpm api:dev` | Inicia a API NestJS em watch mode na porta `3000` |
| `pnpm lint` | Executa ESLint (`apps/web`) e Oxlint type-aware (`apps/api`) |
| `pnpm api:test` | Executa a suíte unitária Jest do back-end |
| `pnpm web:test` | Executa testes unitários (Vitest + Testing Library) e acessibilidade (`jest-axe`) |
| `pnpm api:build` | Compila o back-end NestJS (`nest build`) |
| `pnpm web:build` | Executa checagem TypeScript (`tsc -b`) e bundle de produção (`vite build`) |
| `pnpm db:seed` | Compila a API e executa o seed idempotente no PostgreSQL |

Comandos úteis dentro de `apps/api`:

- `pnpm --filter api prisma:migrate` — cria/aplica migrations em desenvolvimento (`prisma migrate dev`)
- `pnpm --filter api prisma:studio` — abre a interface visual do Prisma Studio
- `pnpm --filter api test:e2e` — executa testes E2E com Supertest

---

## Integração Contínua (CI)

O workflow em [`.github/workflows/ci.yml`](.github/workflows/ci.yml) é disparado automaticamente em eventos de `push` e `pull_request` para a branch `main`.

Ele provisiona um service container **PostgreSQL 16** (`postgres:16-alpine`) com healthcheck e executa em sequência:

1. Instalação determinística com `pnpm install --frozen-lockfile` (Node 24 + pnpm 11)
2. Geração do Prisma Client (`pnpm --filter api prisma:generate`)
3. Aplicação das migrations SQL no container PostgreSQL 16 (`pnpm --filter api prisma:deploy`)
4. Verificação de lint (`pnpm lint`)
5. Testes do back-end (`pnpm api:test`) e do front-end com `jest-axe` (`pnpm web:test`)
6. Builds de produção da API (`pnpm api:build`) e do Web (`pnpm web:build`)

---

## Como o `AGENTS.md` Foi Usado no Fluxo com IA

O arquivo [`AGENTS.md`](AGENTS.md) na raiz (complementado por [`apps/api/AGENTS.md`](apps/api/AGENTS.md)) atuou como **especificação viva e guardrail contínuo** para os agentes de IA durante todo o ciclo de desenvolvimento — do setup inicial até a auditoria final:

1. **Planejamento orientado às regras (`plans/`):**
   Antes de editar código em cada entrega ([`implementar-auth-frontend.md`](plans/implementar-auth-frontend.md), [`implementar-backend-auth-db.md`](plans/implementar-backend-auth-db.md) e [`implementar-feed-e-contratos.md`](plans/implementar-feed-e-contratos.md)), os agentes consultaram o `AGENTS.md` para estruturar decisões técnicas alinhadas ao projeto — como a árvore Atomic Design, o contraste WCAG 2 AA dos 7 tokens de cor, a escolha do Prisma 7 para suportar `BigInt` nas recompensas e a estratégia de Full-Text Search no PostgreSQL.
2. **Conformidade arquitetural automática no Front-end:**
   - Separação estrita entre `atoms/`, `molecules/`, `organisms/`, `templates/` e `pages/`, preservando a regra de dependência unidirecional.
   - Bloqueio rigoroso contra cores hexadecimais hardcoded e medidas arbitrárias em pixels, forçando o uso exclusivo de tokens semânticos (`bg-ocean-abyss`, `bg-ship-deck`, `text-parchment`, `text-mist-gray`, `bg-treasure-gold`, `bg-log-pose-cyan`, `bg-crimson-bounty`).
   - Obrigatoriedade de arquivos `*.test.tsx` colocalizados com checagem `jest-axe` em cada novo componente e página.
3. **Padronização REST e Segurança no Back-end:**
   - Organização consistente em `Module`, `Controller`, `Service` e `DTOs` com `class-validator` + `@nestjs/swagger`.
   - Rotas no plural (`/users`, `/auth/login`, `/chronicles`, `/contracts`), status codes semânticos (`200`, `201`, `400`, `401`, `403`, `404`), paginação e busca padronizadas, proteção por `JwtAuthGuard` nas mutações e garantia de que `passwordHash` nunca vaze nas respostas.
4. **Higiene de Git e Auditoria:**
   - Aplicação do padrão **Conventional Commits** com os scopes permitidos (`web`, `api`, `root`, `docs`), como observado no histórico (`chore(root): ...`, `feat(web): ...`, `feat(api): ...`).
   - Uso do `AGENTS.md` como checklist objetivo durante a auditoria pós-implementação (incluindo verificação de tratamento de erros em compositores/interações, estabilidade de timeouts em CI e cobertura `jest-axe`).

---

## Capturas de Tela

### 1. Crônicas da Grand Line (Feed, Busca Full-Text e Placeholder Cartográfico)
![Feed de Crônicas](docs/screenshots/feed-cronicas.png)

### 2. Mural de Contratos & Tripulações (Filtros por Mar e Recompensas em Berries)
![Mural de Contratos](docs/screenshots/mural-contratos.png)

### 3. Autenticação e Alistamento de Tripulantes (Split-Screen & Atomic Design)
| Retorne ao Convés (Login) | Aliste-se na Rota (Cadastro) |
| :---: | :---: |
| ![Tela de Login](docs/screenshots/tela-login.png) | ![Tela de Cadastro](docs/screenshots/tela-cadastro.png) |

### 4. Documentação Interativa da API (Swagger UI)
![Swagger API](docs/screenshots/swagger-docs.png)

---

## Origem do Projeto e Créditos

Este projeto foi desenvolvido como desafio prático do curso **"Engenharia de software na era da IA: Como usar IA no fluxo real de desenvolvimento"** (Alura).

- **Repositório base de referência do curso:** [alura-cursos/code-connect](https://github.com/alura-cursos/code-connect)
- **Adaptação autoral:** Em vez de reproduzir o projeto original (*CodeConnect*), toda a arquitetura de monorepo, engenharia de contexto (`AGENTS.md`), planejamento orientado a especificações (`plans/`), testes de acessibilidade (`jest-axe`) e integração contínua foi aplicada na criação de uma plataforma original inspirada no universo de *One Piece*.