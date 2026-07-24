# CLAUDE.md — Backend

Express + TypeORM API. Layered architecture, Zod validation at the controller boundary, JWT auth, and an OpenAI-backed chatbot that can call back into the app's own services.

## Commands

```bash
npm run dev                 # dev server (tsx watch src/app.ts)
npm run build                # compile with tsup → build/, copies data/seeds/*.csv along
npm start                    # run compiled build/app.js (production)
npm run db:migrate           # run pending TypeORM migrations (dev, src/*.ts via tsx)
npm run db:migrate:revert    # revert last migration
npm run db:migrate:prod      # same, against compiled build/database/data-source.js
npm run db:seed / db:seed:prod   # populate verified foods from data/seeds/*.csv (idempotent)
npm run db:setup / db:setup:prod # migrate + seed in one go
```

## Env

Copy `.env.example` → `.env`. All vars are prefixed `BACKEND_`:
- `BACKEND_DB_HOST/PORTA/USUARIO/SENHA/DATABASE` — local Postgres (Docker). Ignored if `BACKEND_DATABASE_URL` is set (production/Neon/Supabase takes precedence — see `src/database/data-source.ts`).
- `BACKEND_JWT_SECRET` / `BACKEND_REFRESH_SECRET` — sign access (1h) and refresh (7d) tokens independently.
- `BACKEND_OPEN_AI_API_KEY` — only needed for the chatbot.
- `BACKEND_NODE_ENV=production` switches the migrations glob from `src/database/migrations/*.ts` to `build/database/migrations/*.js`.

Port is hardcoded to **5001** in `src/config/variaveis.ts` (`PORTA_BACKEND`); Render's `PORT` env var overrides it at listen-time (see `servidor.ts`).

## How a request flows

```
app.ts (registers Rota[] + Servidor) → Servidor (Express app, middleware, auth)
  → Rota (per-domain router, e.g. UsuarioRotas)
     → Controller (Zod-validates req.body, calls Service, returns JsonReponseSucesso)
        → Service (business logic, orchestrates repositories)
           → Repository (thin wrapper around TypeORM's repository/query builder)
              → Entity (TypeORM model, decorators define the table)
```

Concrete example — `POST /nutria/usuario/login`:
```
UsuarioRotas → UsuarioController.fazerLogin()
   ├─ efetuarLoginSchema.safeParse(req.body)   // Zod
   → UsuarioService.fazerLogin()
      → ContaRepositorio.obterContaPorEmail() → bcrypt.compare() → jwt.sign()
```

### `Servidor` (`src/app/servidor.ts`)

One class that wires everything: `configurarMiddlewares()` sets up `cookie-parser`, `cors`, JSON body parsing (50mb limit for base64 photos/images), request logging, and a global auth gate; `ativarSubRotas()` mounts every `Rota` under `/nutria`; `iniciarServicos()` calls `AppDataSource.initialize()` then starts listening.

The auth gate is a single middleware run on **every** request before routing: if `req.url` is in `listaRotasSemAuth` (`config/variaveis.ts`) it calls `next()`, otherwise it goes through `authenticarTokenBearer()`, which verifies the `Authorization: Bearer <token>` header with `jsonwebtoken` and injects the decoded `sub` claim as `req.body.id_usuario`. Every authenticated controller reads the caller's id from `req.body.id_usuario`, never from a route param — controllers never trust a client-supplied user id.

Currently whitelisted (no auth required): `/nutria/health`, `/nutria/usuario/criar`, `/nutria/usuario/login`, `/nutria/usuario/refresh-token`.

### Controllers, `Util.envolveFuncTryCatch`, and error handling

Controllers are plain classes with async methods bound as Express handlers via `Util.envolveFuncTryCatch(this, this.metodo)` (see each `*Rotas.ts`). That wrapper:
- awaits the handler, and if it resolves, writes `res.status(codigo).json(jsonReponseSucesso)`;
- if the handler throws a `JsonReponseErro`, writes that error's own `codigo`/`mensagem`;
- any other thrown error becomes a generic `500`.

So controllers never call `res.json()` themselves — they either `return new JsonReponseSucesso(codigo, mensagem, dados)` or call `JsonReponseErro.lancar(codigo, mensagem, erro?)` (which just `throw`s). Response envelope is always `{ sucesso, codigo, mensagem, dados }` on success or `{ sucesso, codigo, mensagem, erro }` on failure (`src/utils/jsonReponses.ts`).

Validation is always the controller's first move: `algumSchema.safeParse(req.body)`, and on failure `JsonReponseErro.lancar(400, 'JSON inválido', resultadoParse.error)`. Schemas live in `app/schemas/<dominio>/` and each also exports the inferred TS type (e.g. `criarUsuarioObject`) used by services/entities.

### Services & Repositories

Services hold business logic and are the only layer allowed to compose multiple repositories or call external APIs (OpenAI). Repositories wrap TypeORM — either `Repository<Entity>` methods or `createQueryBuilder`. Entities extend TypeORM's `ActiveRecord`-style `BaseEntity`, so services also call `.save()` directly on entity instances in places (e.g. `UsuarioService.criarUsuario`).

### Events (`src/utils/eventos.ts`)

A tiny singleton wrapping Node's `EventEmitter`, used to decouple side effects from the request that triggered them. Currently one listener: on `'usuarioCriado'` (emitted by `UsuarioService.criarUsuario`), it creates the user's default `Cartao`s (goal cards) and `Refeicao`s (meals) via `CartaoService`/`RefeicaoService`. Add new cross-cutting side effects here instead of chaining them inline in a service.

### Database & migrations

- TypeORM (`v0.3.20`), Postgres, **`synchronize: false`** always — every schema change is a migration under `src/database/migrations/`, generated/run via the `typeorm` CLI (through `tsx`, see scripts above). Never hand-edit the schema outside a migration.
- Entities are registered by hand in the `entities: [...]` array in `src/database/data-source.ts` — a new entity file alone does nothing until it's added there.
- Two custom TypeORM column transformers in `Util` (`src/utils/util.ts`): `transformerStringNumber` (numeric columns come back from `pg` as strings — parses to `number`) and `transformerByteaString` (bytea photo blobs → string). Reuse these on any new numeric/bytea column instead of re-parsing in services.
- Seeding (`src/database/seed.ts`, `data/seeds/*.csv`, ~1607 foods): idempotent (skips if data already present), batch-inserts 200 rows/transaction, CSV parser handles quoted/comma-containing fields.

### Chatbot / OpenAI (`app/services/chatBotService.ts`)

`ChatBotService` wraps the `openai` SDK (`gpt-4o-mini` normally, `gpt-4o` when the message text matches a "please add this" verb from `comandosDeFuncoes`, so it can pass a tool/function schema). Two entry points:
- `perguntar()` — sends the chat history with a system prompt tuned to short, nutrition-only answers; if the model responds with a `tool_calls[0]`, it's routed through `chamarAcaoBackend()`, which currently handles one function (`add_consumo_alimento`) by calling straight into `AlimentoConsumidoService.cadastrarAlimentosConsumidos()` — i.e. the chatbot can write to the user's log itself, not just talk about it.
- `analisarFoto()` — sends a food photo to `gpt-4o-mini` with a vision-style prompt to extract foods/macros/calories as text, then feeds that text back through `perguntar()` so the same tool-calling path can log it.

Function schemas for tool-calling live in `src/utils/modelosFuncoesOpenAI/`.

## Adding a feature

1. **Entity** (`app/entities/MiEntidade.ts`) — TypeORM decorators, then register it in `src/database/data-source.ts`'s `entities` array.
2. **Repository** (`app/repositories/`) — query methods specific to the entity.
3. **Service** (`app/services/`) — business logic, calls repositories.
4. **Zod schema** (`app/schemas/<dominio>/`) — request validation + inferred type export.
5. **Controller** (`app/controllers/`) — parse → call service → return `JsonReponseSucesso` / throw `JsonReponseErro`.
6. **Rota** (`app/rotas/`) — implements the `Rota` interface (`caminho`, `roteador`, `controller`), wraps each handler in `Util.envolveFuncTryCatch`.
7. **Register** the new `Rota` instance in `listaRotas` in `src/app.ts`.
8. If it changes the schema, generate/write a migration — never rely on `synchronize`.

## Domains (entities)

| Entity | Purpose |
|---|---|
| **Conta** | Login credentials (email + bcrypt hash), separate from `Usuario` profile data |
| **Usuario** | User profile (name, birth date, country, sex, unit system, diet type) |
| **Perfil** | Goals/measurements used for calorie & macro targets |
| **Dia** | Daily log entry: weight, abdomen measurement, progress photo |
| **Refeicao** | A meal slot (Café, Almoço, Jantar, Lanche, or user-defined) |
| **AlimentoConsumido** | A food entry logged against a `Refeicao` |
| **Alimento** | Food database entry (macros/calories), verified (seeded) or user-created |
| **AlimentoFavorito** | User's bookmarked foods |
| **Prato** / **AlimentoPrato** | User-defined recipe and its ingredient lines |
| **Cartao** | Goal card per user: type is `MACROS`, `CALORIAS`, or `DIETA FLEXIVEL` |
| **CodigoDeBarras** | Barcode → food lookup |
| **TabelaNutricional** | Nutrition table data backing `Alimento` |

## Project structure

```
backend/
├── src/
│   ├── app/
│   │   ├── controllers/   # HTTP handlers, Zod validation, JsonReponse* returns
│   │   ├── services/      # business logic, orchestration, OpenAI calls
│   │   ├── repositories/  # TypeORM data access
│   │   ├── entities/      # TypeORM models (BaseEntity)
│   │   ├── rotas/         # Express routers, one per domain, implement Rota
│   │   └── schemas/       # Zod schemas + inferred types, one folder per domain
│   ├── database/
│   │   ├── data-source.ts # DataSource config, entities list, migrations glob
│   │   ├── migrations/    # TypeORM migration files (only source of schema truth)
│   │   └── seed.ts        # CSV-based food seeding
│   ├── config/variaveis.ts # env vars + shared enums/constants (both sides mirror the enum values)
│   └── utils/             # Util (helpers/transformers), Rota interface, JsonReponse*, Eventos
├── data/seeds/             # CSV food data consumed by seed.ts
└── build/                  # tsup output (git-ignored)
```
