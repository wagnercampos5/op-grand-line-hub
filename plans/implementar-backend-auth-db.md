# Plano de Implementação — Base do Back-end, Banco de Dados e Autenticação (`apps/api`)

## 1. Contexto e Diagnóstico Atual

Após inspeção do monorepo e de `apps/api`, este é o estado atual encontrado:

- **Stack base existente em `apps/api`:**
  - **NestJS v12** (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` `^12.0.1`), **TypeScript `^6.0.2`** (`"module": "nodenext"`, `"strict": true`, CommonJS no `package.json`), **Node.js `v24.18.0`** e **pnpm `11.18.0`**.
  - **Qualidade já configurada:** Jest 30 (`ts-jest` com `--experimental-vm-modules`), `oxlint --type-aware` e Prettier. Todos os checks baseline (`pnpm api:test`, `pnpm api:build`, `pnpm --filter api lint`) estão passando.
  - **Docker disponível no ambiente:** `Docker version 29.9.2`.
- **Alinhamento com o Front-end já implementado (`apps/web`):**
  - O formulário `AuthForm` em `apps/web/src/components/organisms/AuthForm/AuthForm.tsx` já define:
    - **Login:** `email`, `password`.
    - **Cadastro:** `name` (mín. 2 chars), `affiliation` (`PIRATE | MARINE | REVOLUTIONARY | BOUNTY_HUNTER`), `email`, `password` (mín. 8 chars).
  - O front-end roda em `http://localhost:5173`.
- **Lacunas a construir nesta etapa:**
  1. Infraestrutura Docker com PostgreSQL 16 (`docker-compose.yml` na raiz) e gestão segura de variáveis de ambiente (`apps/api/.env`, `apps/api/.env.example` e atualização do `.gitignore`).
  2. Camada de persistência com ORM, schema/modelagem da tabela `users` e fluxo de migrations.
  3. Módulos `UsersModule` (`/users`) e `AuthModule` (`/auth/login`, `/auth/me`, `JwtAuthGuard`) com `bcrypt`, `@nestjs/jwt` e DTOs validados com `class-validator` + `@nestjs/swagger`.
  4. Bootstrap da API (`ValidationPipe` global, CORS para `http://localhost:5173`, Swagger em `/api/docs`, shutdown hooks) e suíte de testes unitários em Jest.

---

## 2. Escolha e Justificativa do ORM: Prisma (v7) vs TypeORM (v1.1)

| Critério | **Prisma 7** (`@prisma/client` + `@prisma/adapter-pg`) — **Escolhido** | **TypeORM 1.1** (`@nestjs/typeorm` + `typeorm`) |
| :--- | :--- | :--- |
| **Modelagem & Fonte da Verdade** | Schema declarativo único (`prisma/schema.prisma`) com enums nativos do PostgreSQL, índices, constraints e relações legíveis e fáceis de auditar. | Classes decoradas espalhadas por módulo (`@Entity`, `@Column`), propensas a imports circulares conforme novas entidades (`Chronicle`, `Contract`) forem criadas. |
| **Type-Safety & Proteção de `passwordHash`** | Tipos gerados exatamente a partir do schema e de cada `select`. Usar `USER_PUBLIC_SELECT` garante em tempo de compilação que `passwordHash` **nunca** entra no objeto retornado. | `findOne`/`find` retorna todas as colunas por padrão; ocultar `passwordHash` exige `select: false` + `QueryBuilder.addSelect()` manual no login, com menor inferência de tipos. |
| **Migrations no PostgreSQL 16** | Fluxo declarativo (`prisma migrate dev` / `prisma migrate deploy`) gera SQL versionado automaticamente sem precisar compilar `dist/` nem manter `data-source.ts` paralelo. | Exige arquivo `data-source.ts` separado para o CLI fora do container DI do NestJS e exige `nest build` antes de gerar/aplicar migrations. |
| **Suporte a `BigInt` (`bounty`)** | Tipagem nativa `bigint` no TypeScript para colunas PostgreSQL `BIGINT` (essencial para recompensas de One Piece acima de 2,14 bilhões de Berries, limite de `Int` 32-bit). | Driver `pg` retorna `bigint` como `string` por padrão, exigindo configuração global `parseInt8` ou transformers manuais por coluna. |
| **Compatibilidade com NestJS 12 + Windows/pnpm** | Prisma 7 reescreveu o client em TypeScript puro (sem engine binário Rust), integrando diretamente com o pool oficial `pg` via `@prisma/adapter-pg` e gerando client CJS (`moduleFormat = "cjs"`) compatível com `apps/api`. | First-party (`@nestjs/typeorm` v12), porém depende fortemente de `emitDecoratorMetadata` e configuração manual de CLI/migrations. |
| **Testabilidade Unitária (Jest)** | Um único `PrismaService` injetável, trivial de mockar em `Test.createTestingModule` com `jest.fn()`. | Exige mockar `getRepositoryToken(User)` e métodos encadeados de `QueryBuilder` quando há colunas com `select: false`. |

### Decisão Arquitetural
Adotaremos **Prisma 7** com o adaptador oficial do PostgreSQL (`@prisma/adapter-pg` + `pg`) encapsulado em um único `PrismaService` (singleton com pool compartilhado e desconexão limpa no `onModuleDestroy`).

> **Decisão sobre `bounty` (`BigInt`) na serialização JSON:**
> Em One Piece, recompensas ultrapassam facilmente o limite de inteiro 32-bit (`2.147.483.647` — ex.: Monkey D. Luffy tem `3.000.000.000` e Gol D. Roger `5.564.800.000`). Por isso, a coluna no banco será **`BigInt` (`BIGINT` 64-bit, default `0`)**. Como `JSON.stringify` não serializa `bigint` nativo do JavaScript diretamente, o mapper público (`toUserResponse`) converterá `bounty` para `number` (seguro até `Number.MAX_SAFE_INTEGER` ≈ 9 quatrilhões de Berries, facilitando formatação numérica no front-end e documentação no Swagger).

---

## 3. Arquitetura de Módulos e Fluxo de Autenticação

```mermaid
flowchart TD
  Client["Front-end (http://localhost:5173) / Swagger (/api/docs)"] --> Main["main.ts (ValidationPipe + CORS + Swagger)"]
  Main --> AppModule["AppModule"]

  subgraph Core["Infraestrutura Global"]
    ConfigModule["ConfigModule (validação .env)"]
    PrismaModule["PrismaModule (PrismaService + pg Pool)"]
  end

  subgraph Users["UsersModule (/users)"]
    UsersController["UsersController (POST /users)"]
    UsersService["UsersService (bcrypt hash + Prisma + mapper seguro)"]
  end

  subgraph Auth["AuthModule (/auth)"]
    AuthController["AuthController (POST /auth/login, GET /auth/me)"]
    AuthService["AuthService (credenciais timing-safe + JwtService)"]
    JwtAuthGuard["JwtAuthGuard (CanActivate: Bearer -> verifyAsync -> User)"]
    JwtModule["JwtModule.registerAsync (ConfigService)"]
  end

  AppModule --> ConfigModule
  AppModule --> PrismaModule
  AppModule --> Users
  AppModule --> Auth

  UsersController --> UsersService
  UsersService --> PrismaModule

  AuthController --> AuthService
  AuthController --> JwtAuthGuard
  AuthService --> UsersService
  AuthService --> JwtModule
  JwtAuthGuard --> JwtModule
  JwtAuthGuard --> UsersService
```

*A dependência entre módulos é estritamente unidirecional (`AuthModule -> UsersModule -> PrismaModule`), sem dependências circulares. Nos próximos módulos (`ChroniclesModule` e `ContractsModule`), bastará importar `AuthModule` para aplicar `@UseGuards(JwtAuthGuard)`.*

---

## 4. Estrutura de Arquivos Planejada

```text
docker-compose.yml                              # PostgreSQL 16 + volume persistente + healthcheck
.gitignore                                      # Ignora .env, dist, coverage, *.tsbuildinfo e Prisma gerado
pnpm-workspace.yaml                             # allowBuilds para pacotes nativos necessários (ex.: bcrypt)
apps/api/
├── .env                                        # Variáveis locais reais (NUNCA versionado)
├── .env.example                                # Template documentado sem segredos reais (versionado)
├── .oxlintrc.json                              # Adiciona ignorePatterns para src/generated/**
├── prisma.config.ts                            # Configuração Prisma 7 (schema, migrations, DATABASE_URL)
├── prisma/
│   ├── schema.prisma                           # Enum Affiliation + Model User
│   └── migrations/
│       └── <timestamp>_init_users/
│           └── migration.sql                   # Migration inicial versionada
└── src/
    ├── main.ts                                 # ValidationPipe global, CORS, Swagger (/api/docs), shutdown hooks
    ├── app.module.ts                           # ConfigModule + PrismaModule + UsersModule + AuthModule
    ├── app.controller.ts                       # Mantido (GET /)
    ├── app.controller.spec.ts                  # Mantido
    ├── app.service.ts                          # Mantido
    ├── config/
    │   └── env.validation.ts                   # Validação fail-fast das envs obrigatórias no startup
    ├── prisma/
    │   ├── prisma.module.ts                    # Fornece e exporta PrismaService
    │   └── prisma.service.ts                   # PrismaClient + PrismaPg(Pool) + onModuleInit/onModuleDestroy
    ├── users/
    │   ├── users.module.ts
    │   ├── users.controller.ts                 # POST /users (201 Created)
    │   ├── users.service.ts                    # create(), findById(), findByEmailWithPassword()
    │   ├── users.service.spec.ts               # Testes unitários Jest do UsersService
    │   ├── enums/
    │   │   └── affiliation.enum.ts             # Enum Affiliation compartilhado com DTOs e Swagger
    │   └── dto/
    │       ├── create-user.dto.ts              # Validação (class-validator) + @ApiProperty
    │       └── user-response.dto.ts            # Contrato público sem passwordHash + toUserResponse()
    └── auth/
        ├── auth.module.ts                      # Registra JwtModule.registerAsync, AuthService, JwtAuthGuard
        ├── auth.controller.ts                  # POST /auth/login (200 OK) e GET /auth/me (200 OK + JwtAuthGuard)
        ├── auth.service.ts                     # login() com verificação timing-safe e emissão JWT
        ├── auth.service.spec.ts                # Testes unitários Jest do AuthService
        ├── guards/
        │   ├── jwt-auth.guard.ts               # Valida Bearer token e carrega usuário atual sem passwordHash
        │   └── jwt-auth.guard.spec.ts          # Testes unitários Jest do JwtAuthGuard
        ├── decorators/
        │   └── current-user.decorator.ts       # Decorator @CurrentUser() tipado para Controllers
        ├── interfaces/
        │   └── jwt-payload.interface.ts        # Tipagem do payload JWT ({ sub, email })
        └── dto/
            ├── login.dto.ts                    # Validação (class-validator) + @ApiProperty
            └── auth-response.dto.ts            # { access_token: string } + @ApiProperty
```

---

## 5. Etapas Detalhadas de Execução

### Etapa 1 — Infraestrutura Docker, `.env` e `.gitignore`

1. **Criar `docker-compose.yml` na raiz do monorepo:**
   - Serviço `postgres` usando imagem oficial `postgres:16-alpine`.
   - `container_name: grand-line-hub-postgres`, `restart: unless-stopped`.
   - Variáveis com defaults seguros de desenvolvimento (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` na porta `5432`).
   - Volume nomeado persistente: `grand_line_postgres_data:/var/lib/postgresql/data`.
   - `healthcheck` com `pg_isready` para garantir prontidão antes das migrations.
2. **Atualizar `.gitignore` na raiz:**
   - Adicionar `.env`, `.env.local`, `.env.*.local` (garantindo que `.env.example` continue versionado), `dist`, `coverage`, `*.tsbuildinfo` e `apps/api/src/generated`.
3. **Criar `apps/api/.env.example` (commitado) e `apps/api/.env` (ignorado pelo Git):**
   ```env
   PORT=3000
   CORS_ORIGIN=http://localhost:5173
   DATABASE_URL="postgresql://grandline:grandline_dev_password@localhost:5432/grand_line_hub?schema=public"
   JWT_SECRET="troque-por-um-segredo-forte-com-no-minimo-32-caracteres"
   JWT_EXPIRES_IN="1d"
   BCRYPT_SALT_ROUNDS=10
   ```
   *(No `apps/api/.env` local será gerado um `JWT_SECRET` aleatório criptograficamente forte de 32+ bytes).*

---

### Etapa 2 — Dependências e Configuração de Ambiente (`apps/api`)

1. **Instalar dependências de produção em `apps/api`:**
   - `@nestjs/config`, `@nestjs/jwt`, `@nestjs/swagger`
   - `@prisma/client`, `@prisma/adapter-pg`, `pg`
   - `bcrypt`, `class-validator`, `class-transformer`
   - `dotenv` (para `prisma.config.ts`)
2. **Instalar dependências de desenvolvimento em `apps/api`:**
   - `prisma`, `@types/bcrypt`, `@types/pg`
3. **Atualizar `pnpm-workspace.yaml`:**
   - Liberar em `allowBuilds` apenas o estritamente necessário (ex.: `bcrypt`) para que o pnpm v11 compile/use o binário nativo no Windows sem avisos bloqueantes.
4. **Criar `apps/api/src/config/env.validation.ts` e registrar `ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })` no `AppModule`:**
   - Garante *fail-fast* no boot caso `DATABASE_URL` ou `JWT_SECRET` estejam ausentes ou `JWT_SECRET` tenha menos de 32 caracteres.
   - Converte e valida `PORT` e `BCRYPT_SALT_ROUNDS` com defaults seguros (`3000` e `10`).
5. **Adicionar scripts utilitários no `apps/api/package.json`:**
   - `"prisma:generate": "prisma generate"`
   - `"prisma:migrate": "prisma migrate dev"`
   - `"prisma:deploy": "prisma migrate deploy"`
   - `"prisma:studio": "prisma studio"`
   - Garantir que `.oxlintrc.json` ignore `src/generated/**` para não lintar código gerado pelo Prisma.

---

### Etapa 3 — Prisma 7, Modelagem da Entidade `User` e Migration Inicial

1. **Criar `apps/api/prisma.config.ts`:**
   - Carrega `.env` via `import 'dotenv/config'` e configura `schema: 'prisma/schema.prisma'`, `migrations.path: 'prisma/migrations'` e `datasource.url: env('DATABASE_URL')`.
2. **Criar `apps/api/prisma/schema.prisma`:**
   ```prisma
   generator client {
     provider     = "prisma-client"
     output       = "../src/generated/prisma"
     moduleFormat = "cjs"
   }

   datasource db {
     provider = "postgresql"
   }

   enum Affiliation {
     PIRATE
     MARINE
     REVOLUTIONARY
     BOUNTY_HUNTER
   }

   model User {
     id           String      @id @default(uuid()) @db.Uuid
     name         String
     email        String      @unique
     passwordHash String      @map("password_hash")
     affiliation  Affiliation
     bounty       BigInt      @default(0)
     createdAt    DateTime    @default(now()) @map("created_at") @db.Timestamptz

     @@map("users")
   }
   ```
   - **Mapeamento de banco:** Convenção `snake_case` nas colunas do PostgreSQL (`password_hash`, `created_at`) e nome da tabela no plural (`users`), mantendo `camelCase` idiomático no TypeScript (`passwordHash`, `createdAt`).
   - **UUID nativo (`@db.Uuid`):** Validação e armazenamento eficientes no PostgreSQL 16.
   - **Timestamp em UTC (`@db.Timestamptz`):** Evita ambiguidades de fuso horário.
3. **Criar `PrismaService` e `PrismaModule` (`src/prisma/`):**
   - Instancia `Pool` (`pg`) com `DATABASE_URL` lido via `ConfigService` e repassa `new PrismaPg(pool)` para `super({ adapter })`.
   - Implementa `OnModuleInit` (`$connect()`) e `OnModuleDestroy` (`$disconnect()` + `pool.end()`).
4. **Subir o container e rodar migration:**
   - `docker compose up -d`
   - `pnpm --filter api prisma:generate`
   - `pnpm --filter api prisma:migrate -- --name init_users`

---

### Etapa 4 — Módulo de Usuários (`POST /users`)

1. **`Affiliation` enum (`src/users/enums/affiliation.enum.ts`):**
   - Valores exatos: `PIRATE`, `MARINE`, `REVOLUTIONARY`, `BOUNTY_HUNTER` (alinhados ao schema Prisma e ao front-end `AuthForm`).
2. **`CreateUserDto` (`src/users/dto/create-user.dto.ts`):**
   - `name`: `@IsString()`, `@IsNotEmpty()`, `@MinLength(2)`, `@MaxLength(100)` + `@ApiProperty(...)`
   - `email`: `@IsEmail()`, `@MaxLength(255)` + `@ApiProperty(...)`
   - `password`: `@IsString()`, `@MinLength(8)`, `@MaxLength(72)` (limite real de entrada do bcrypt) + `@ApiProperty(...)`
   - `affiliation`: `@IsEnum(Affiliation)` + `@ApiProperty({ enum: Affiliation })`
   - *(Não aceita `bounty`, `id` ou `createdAt` — bloqueados por `whitelist: true, forbidNonWhitelisted: true` contra mass assignment).*
3. **`UserResponseDto` e mapper `toUserResponse()` (`src/users/dto/user-response.dto.ts`):**
   - Campos expostos: `id`, `name`, `email`, `affiliation`, `bounty` (`number`), `createdAt`.
   - **Garantia de segurança:** `passwordHash` nunca faz parte do DTO nem do `USER_PUBLIC_SELECT` usado nas consultas públicas.
4. **`UsersService` (`src/users/users.service.ts`):**
   - `create(dto: CreateUserDto): Promise<UserResponseDto>`:
     - Normaliza `email` (`trim().toLowerCase()`) e `name` (`trim()`).
     - Gera hash da senha com `bcrypt.hash(dto.password, saltRounds)`.
     - Insere no Prisma usando `select: USER_PUBLIC_SELECT`.
     - Captura erro `P2002` (unique constraint violation no PostgreSQL) e lança `ConflictException('Já existe um tripulante cadastrado com este e-mail.')` (`409 Conflict`) — evitando *race condition* de consulta prévia.
     - Retorna `toUserResponse(user)`.
   - `findById(id: string): Promise<UserResponseDto | null>`:
     - Consulta com `select: USER_PUBLIC_SELECT` e mapeia com `toUserResponse`.
   - `findByEmailWithPassword(email: string)`:
     - Uso estritamente interno pelo `AuthService` para validação de login (jamais exposto em controller).
5. **`UsersController` (`src/users/users.controller.ts`):**
   - `@ApiTags('users')`, `@Controller('users')`.
   - `POST /users` (`@HttpCode(HttpStatus.CREATED)`): cria usuário e documenta respostas `201`, `400` e `409` no Swagger.

---

### Etapa 5 — Módulo de Autenticação (`POST /auth/login`, `GET /auth/me` e `JwtAuthGuard`)

1. **DTOs e Interfaces (`src/auth/dto/` e `src/auth/interfaces/`):**
   - `LoginDto`: `email` (`@IsEmail()`), `password` (`@IsString()`, `@IsNotEmpty()`).
   - `AuthResponseDto`: `{ access_token: string }` documentado com `@ApiProperty`.
   - `JwtPayload`: `{ sub: string; email: string }`.
2. **`AuthService` (`src/auth/auth.service.ts`):**
   - `login(dto: LoginDto): Promise<AuthResponseDto>`:
     - Normaliza `email` e chama `usersService.findByEmailWithPassword(normalizedEmail)`.
     - **Proteção contra timing attack (enumeração de e-mails):** mesmo quando o usuário não existe, executa `bcrypt.compare(dto.password, DUMMY_PASSWORD_HASH)` antes de decidir, garantindo tempo de resposta uniforme e mensagem idêntica (`UnauthorizedException('E-mail ou senha inválidos.')` — `401`).
     - Quando válido, assina o token via `jwtService.signAsync({ sub: user.id, email: user.email })` e retorna `{ access_token }`.
3. **`JwtAuthGuard` (`src/auth/guards/jwt-auth.guard.ts`):**
   - Implementa `CanActivate` usando `JwtService` (`@nestjs/jwt`) + `UsersService`:
     - Extrai token do header `Authorization: Bearer <token>`.
     - Valida assinatura e expiração via `jwtService.verifyAsync<JwtPayload>(token)`.
     - Carrega o usuário atualizado do banco via `usersService.findById(payload.sub)` (se o usuário tiver sido removido, recusa imediatamente com `401 Unauthorized`).
     - Injeta `request.user` (já sanitizado, sem `passwordHash`) na requisição.
     - Qualquer falha de header, token ou usuário lança `UnauthorizedException` (`401`).
4. **`@CurrentUser()` (`src/auth/decorators/current-user.decorator.ts`):**
   - `createParamDecorator` que retorna `request.user` tipado como `UserResponseDto`.
5. **`AuthController` (`src/auth/auth.controller.ts`):**
   - `@ApiTags('auth')`, `@Controller('auth')`.
   - `POST /auth/login` com **`@HttpCode(HttpStatus.OK)`** (`200 OK`): recebe `LoginDto`, retorna `{ access_token }`. Documenta `200`, `400`, `401` no Swagger.
   - `GET /auth/me` protegido por `@UseGuards(JwtAuthGuard)` e `@ApiBearerAuth()`: retorna o perfil do `@CurrentUser()` (`200 OK`, sem `passwordHash`). Documenta `200`, `401` no Swagger.
6. **`AuthModule` (`src/auth/auth.module.ts`):**
   - Registra `JwtModule.registerAsync` lendo `JWT_SECRET` e `JWT_EXPIRES_IN` do `ConfigService`.
   - Exporta `AuthService`, `JwtAuthGuard` e `JwtModule` para uso futuro em `ChroniclesModule` e `ContractsModule`.

---

### Etapa 6 — Bootstrap da Aplicação (`src/main.ts` e `src/app.module.ts`)

1. **`ValidationPipe` Global:**
   ```ts
   app.useGlobalPipes(
     new ValidationPipe({
       whitelist: true,
       forbidNonWhitelisted: true,
       transform: true,
       transformOptions: { enableImplicitConversion: true },
     }),
   );
   ```
2. **CORS Restrito ao Front-end:**
   - Lê `CORS_ORIGIN` do `ConfigService` (padrão `http://localhost:5173`) e habilita `credentials: true` — evitando `origin: true` aberto para qualquer domínio.
3. **Swagger em `/api/docs`:**
   - Configurado com `DocumentBuilder` (título **Grand Line Hub API**, descrição temática, versão `1.0`, `.addBearerAuth()`).
   - Montado em `SwaggerModule.setup('api/docs', app, documentFactory)` (expondo UI em `/api/docs` e spec JSON em `/api/docs-json`).
4. **Graceful Shutdown:**
   - `app.enableShutdownHooks()` para encerrar corretamente o pool do PostgreSQL ao receber `SIGINT`/`SIGTERM`.

---

### Etapa 7 — Testes Unitários com Jest (`*.spec.ts`)

| Arquivo de Teste | Cenários Cobertos |
| :--- | :--- |
| `src/users/users.service.spec.ts` | - Criação de usuário com hash `bcrypt` (nunca salva senha crua).<br>- Normalização de `email` (`trim` + `lowercase`) e `name` (`trim`).<br>- Conversão de `bounty` (`0n` -> `0`) e garantia explícita de ausência de `passwordHash` no retorno.<br>- Erro `ConflictException` (`409`) ao capturar código Prisma `P2002` (e-mail duplicado).<br>- `findById` retornando perfil público ou `null`. |
| `src/auth/auth.service.spec.ts` | - Login com credenciais válidas retornando `{ access_token }` e chamando `jwtService.signAsync({ sub, email })`.<br>- Login com senha incorreta lançando `UnauthorizedException` (`401`).<br>- Login com e-mail inexistente lançando `UnauthorizedException` (`401`) **após** executar `bcrypt.compare` contra hash dummy (timing-safe). |
| `src/auth/guards/jwt-auth.guard.spec.ts` | - Header `Authorization: Bearer <token>` válido injeta `request.user` sem `passwordHash` e retorna `true`.<br>- Ausência de header ou esquema diferente de `Bearer` lança `UnauthorizedException` (`401`).<br>- Token inválido/expirado (`verifyAsync` rejeitado) lança `UnauthorizedException` (`401`).<br>- Token válido cujo usuário não existe mais no banco lança `UnauthorizedException` (`401`). |

---

## 6. Critérios de Aceite e Validação Final

Após sua aprovação e conclusão da implementação, validaremos cada ponto:

1. **Docker & Banco:** `docker compose up -d` com container `grand-line-hub-postgres` saudável (`healthy`) e migration aplicada na tabela `users`.
2. **Testes Unitários:** `pnpm api:test` — 100% das suítes Jest passando.
3. **Qualidade & Build:** `pnpm lint` e `pnpm api:build` concluídos com 0 erros e 0 warnings.
4. **Verificação E2E real (smoke test contra PostgreSQL 16):**
   - `GET /api/docs` e `GET /api/docs-json` -> `200 OK`.
   - `POST /users` inválido -> `400 Bad Request`.
   - `POST /users` válido -> `201 Created` sem `passwordHash` e com `bounty: 0`.
   - `POST /users` e-mail duplicado -> `409 Conflict`.
   - `POST /auth/login` credenciais inválidas -> `401 Unauthorized`.
   - `POST /auth/login` credenciais válidas -> `200 OK` retornando `{ access_token }`.
   - `GET /auth/me` sem Bearer token -> `401 Unauthorized`.
   - `GET /auth/me` com Bearer token -> `200 OK` retornando perfil sem `passwordHash`.
   - Header `Access-Control-Allow-Origin: http://localhost:5173` validado.
5. **Segurança Git:** `git status` confirmando que `apps/api/.env` não é rastreado pelo Git.

---

## 7. Pontos para Confirmação antes da Execução

Antes de iniciarmos a edição dos arquivos, confirme se está tudo de acordo com estas escolhas:
1. **ORM:** Prosseguir com **Prisma 7** (`@prisma/adapter-pg` + `pg`) conforme justificativa na Seção 2?
2. **Formato de `bounty` no JSON:** Armazenar como `BigInt` (`BIGINT`) no PostgreSQL e serializar como **`number`** nas respostas JSON (seguro até 9 quatrilhões de Berries e pronto para formatação no front-end), ou prefere `string`?
3. **Estratégia do `JwtAuthGuard`:** Implementar guard nativo NestJS (`CanActivate` com `@nestjs/jwt` + carregamento do usuário via `UsersService`), evitando a camada extra de `passport`/`passport-jwt`?
