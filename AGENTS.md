# AGENTS.md — Grand Line Hub

## Visão Geral do Projeto
Monorepo `pnpm` para o **Grand Line Hub**, uma plataforma que une:
1. **Crônicas da Grand Line (Feed):** Relatos, descobertas sobre ilhas, Akuma no Mi e teorias do Século Perdido.
2. **Mural de Contratos & Tripulações:** Publicação de vagas para tripulações e contratos de caça/recompensas com status (`OPEN`, `IN_PROGRESS`, `COMPLETED`).

### Estrutura do Monorepo
- `apps/web`: Front-end em React 19 + TypeScript + Vite + Tailwind CSS v4.
- `apps/api`: Back-end em NestJS + TypeScript + Swagger + PostgreSQL (via Docker).

## Comandos Principais (Executar da raiz)
- `pnpm web:dev` — Inicia o servidor de desenvolvimento do Front-end (porta 5173).
- `pnpm api:dev` — Inicia o servidor de desenvolvimento do Back-end em watch mode (porta 3000).
- `pnpm web:test` — Roda testes unitários e de acessibilidade no Front-end (Vitest + Testing Library + jest-axe).
- `pnpm api:test` — Roda testes unitários no Back-end (Jest).

---

## Regras de Arquitetura — Front-end (`apps/web`)

### 1. Atomic Design
Todos os componentes de UI devem ficar em `src/components/` seguindo rigorosamente a hierarquia:
- `atoms/`: Unidades indivisíveis (`Button`, `Input`, `Badge`, `Avatar`, `WantedStamp`).
- `molecules/`: Combinação de átomos (`FormField`, `SearchBar`, `AffiliationBadge`, `ReactionButton`).
- `organisms/`: Seções complexas (`Sidebar`, `ChronicleCard`, `ContractCard`, `AuthForm`).
- `templates/`: Layouts de página sem dados reais (`AuthLayout`, `MainFeedLayout`).
- `pages/`: Páginas completas conectadas às rotas e API (`LoginPage`, `RegisterPage`, `FeedPage`, `ContractsPage`).

**Regra de dependência:** Um nível NUNCA pode importar de um nível superior (ex: `atoms` não importam `molecules`).

### 2. Estilização e Design Tokens (Tailwind CSS)
- NUNCA utilize cores hexadecimais hardcoded (ex: `bg-[#123456]`) ou tamanhos arbitrários em pixels nos componentes.
- Utilize exclusivamente os tokens semânticos definidos no tema:
  - `bg-ocean-abyss` (fundo principal escuro)
  - `bg-ship-deck` (cards e superfícies elevadas)
  - `text-parchment` (texto principal claro)
  - `text-mist-gray` (textos secundários)
  - `bg-treasure-gold` (destaques principais, botões primários, recompensas)
  - `bg-log-pose-cyan` (links ativos, badges de informação)
  - `bg-crimson-bounty` (alertas, perigo, cartazes de procurado)

### 3. Qualidade e Acessibilidade
- Todo componente criado deve possuir um arquivo de teste colocalizado (`ComponentName.test.tsx`) validando renderização básica e ausência de violações de acessibilidade (`jest-axe` / WCAG 2 AA).

---

## Regras de Arquitetura — Back-end (`apps/api`)

### 1. Padrão NestJS e Princípios REST
- Organize cada domínio em `Module`, `Controller`, `Service` e `DTOs` (com `class-validator` e `@nestjs/swagger`).
- URLs devem usar substantivos no plural (`/users`, `/auth/login`, `/chronicles`, `/contracts`).
- Status codes semânticos obrigatórios (`201 Created`, `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`).
- Endpoints de listagem devem suportar paginação via query params (`?page=1&limit=10`) e busca (`?search=termo`).

### 2. Segurança
- NUNCA retorne hashes de senha nas respostas da API.
- NUNCA faça hardcode de secrets JWT ou credenciais de banco; utilize variáveis de ambiente (`.env`).
- Rotas de criação, edição, exclusão e interação exigem autenticação via `JwtAuthGuard`. Visitantes não autenticados podem apenas realizar requisições `GET` públicas.

---

## Regras de Git
- Todo commit deve seguir **Conventional Commits**: `<type>(<scope>): <descrição>`
- Scopes permitidos: `web`, `api`, `root`, `docs`.
- Exemplos: `feat(api): add jwt authentication endpoints`, `feat(web): create auth layout template`.