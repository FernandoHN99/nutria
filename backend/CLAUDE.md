# CLAUDE.md — Backend

This file provides guidance to Claude Code when working on the NutrIA backend (Node.js + Express + TypeORM).

## Quick Start

**Development:**
```bash
npm run dev          # Start with file watching (tsx watch)
```

**Build & Production:**
```bash
npm run build        # Compile to build/ directory using tsup
npm start            # Run compiled output (for production)
```

**Database Migrations (TypeORM):**
```bash
npm run typeorm migration:generate -- src/database/migrations/MyMigrationName
npm run typeorm migration:run
```

## Environment Setup

Create `.env` in `backend/` with:
```
DB_USUARIO=postgres
DB_HOST=db.example.com
DB_DATABASE=nutria
DB_SENHA=yourpassword
DB_PORTA=5432

JWT_SECRET=your-secret-key
OPEN_AI_API_KEY=sk-...

ANON_KEY=supabase-anon-key        (optional, for direct client access)
SERVICE_KEY=supabase-service-key  (optional)
API_EXTERNAL_URL=https://api.example.com
```

Port: Backend runs on **port 5001** (hardcoded in `config/variaveis.ts`).

## Code Architecture

### Entry Point → Server Initialization

```
app.ts
  └─> Servidor class (app/servidor.ts)
       ├─ Express app setup
       ├─ Middleware (CORS, JSON parser, JWT auth)
       ├─ Route registration
       └─ Database init (AppDataSource.initialize())
```

### Request Handling Pattern

**All routes follow this flow:**

1. **Route Class** (`app/rotas/*.ts`): Extends `Rota` interface
   - Property: `caminho` (path, e.g., `/usuario`)
   - Property: `roteador` (Express Router instance)
   - Constructor: Registers HTTP methods with controllers

2. **Controller** (`app/controllers/*Controller.ts`): Handles HTTP requests
   - Receives `req: Request, res: Response` (Express)
   - Parses & validates JSON with Zod schema
   - Calls Service layer for business logic
   - Returns `JsonReponseSucesso` on success or throws `JsonReponseErro` on failure

3. **Service** (`app/services/*Service.ts`): Business logic
   - Contains domain rules, calculations, API calls (OpenAI, Supabase)
   - Calls Repository for data access

4. **Repository** (`app/repositories/*Repository.ts`): Database access
   - Wraps TypeORM's repository
   - Provides custom query methods specific to the Entity

5. **Entity** (`app/entities/*.ts`): TypeORM model
   - Defines table schema (columns, relations)
   - Auto-mapped to PostgreSQL tables

**Example Flow:**
```
POST /nutria/usuario/login
  → UsuarioRotas.roteador
  → UsuarioController.fazerLogin()
     ├─ Zod validation (efetuarLoginSchema)
     → UsuarioService.fazerLogin()
        └─ UsuarioRepository.findByEmail()
           └─ TypeORM query via AppDataSource
```

### Error Handling

- **Util.envolveFuncTryCatch()** wraps all route handlers
- Controllers **throw `JsonReponseErro`** on validation/business logic failures
- `JsonReponseSucesso` & `JsonReponseErro` have `codigo`, `mensagem`, `erro` fields
- **500 errors** are caught globally and returned with generic message

**Usage in Controller:**
```typescript
if (!resultadoParse.success) {
   JsonReponseErro.lancar(400, 'JSON inválido', resultadoParse.error);
}
```

### Authentication & Authorization

- **JWT Bearer tokens** issued on login; stored in frontend's AsyncStorage
- **Middleware** in `Servidor.authenticarTokenBearer()` validates all requests
- **Whitelist** in `config/variaveis.ts`: `listaRotasSemAuth` (routes that skip auth)
  - Currently: `/nutria/usuario/criar`, `/nutria/usuario/login`, `/nutria/usuario/refresh-token`
- **User ID** extracted from JWT `sub` claim → injected into `req.body.id_usuario`

### Validation Layer

**All controllers use Zod schemas** from `app/schemas/`:

```typescript
const resultadoParse = criarUsuarioSchema.safeParse(req.body);
if (!resultadoParse.success) {
   JsonReponseErro.lancar(400, 'JSON inválido', resultadoParse.error);
}
// resultadoParse.data is now typed & safe to use
```

**Why Zod:**
- Runtime validation (catches frontend bugs)
- Type-safe post-validation (`resultadoParse.data` is typed)
- Clear error messages

### Database & ORM

**Provider:** PostgreSQL via Supabase  
**ORM:** TypeORM (v0.3.20)

**Key Settings:**
- `synchronize: false` — Do NOT auto-sync schema; use migrations
- Entities manually registered in `data-source.ts`
- Repositories extend TypeORM's base repository

**Common Queries (via Repository):**
```typescript
const user = await userRepo.findOne({ where: { id: userId } });
const users = await userRepo.find({ where: { status: 'active' } });
const result = await userRepo.createQueryBuilder('user')
   .where('user.email = :email', { email })
   .getOne();
```

### OpenAI Integration

The ChatBot feature calls OpenAI's API:
- Service layer handles API calls
- Use `OPEN_AI_API_KEY` from env
- Ensure chat payloads match current OpenAI API schema

## Domains (Entity Groups)

| Entity | Purpose |
|--------|---------|
| **Usuario** | User account & profile |
| **Perfil** | User goals, dietary preferences, measurements |
| **Dia** | Daily nutrition log |
| **Refeicao** | Meal (breakfast, lunch, etc.) |
| **AlimentoConsumido** | Food item logged in a meal |
| **Alimento** | Food database entry (macros, cals) |
| **AlimentoFavorito** | User's bookmarked foods |
| **Prato** | Recipe/meal template |
| **AlimentoPrato** | Food item in a recipe |
| **TabelaNutricional** | Nutrition data (deprecated or reference?) |
| **Cartao** | User's goal card (MACROS, CALORIAS, DIETA FLEXIVEL) |
| **CodigoDeBarras** | Barcode lookup (optional feature) |

## Key Utilities

- **`utils/rota.ts`**: Interface defining route structure
- **`utils/util.ts`**: 
  - `envolveFuncTryCatch()` — wraps controllers with error handling
  - Validation helpers (`validarString()`, `validarNumero()`, etc.)
  - `exportarColecaoInstancias()` — dynamic route loading (unused, routes are hardcoded)
- **`utils/jsonReponses.ts`**: `JsonReponseSucesso` & `JsonReponseErro` classes
- **`utils/eventos.ts`**: Likely event handling (TBD—check if used)
- **`config/variaveis.ts`**: All env vars, constants, meal/gender/activity enums

## Adding a New Feature

**1. Create Entity** (`app/entities/MyEntity.ts`):
   - Define TypeORM columns, relations
   - Add to `data-source.ts` entities list

**2. Create Repository** (`app/repositories/MyRepository.ts`):
   - Custom query methods for MyEntity

**3. Create Service** (`app/services/MyService.ts`):
   - Use repository for DB access
   - Implement business logic

**4. Create Zod Schema** (`app/schemas/my/mySchema.ts`):
   - Define input validation

**5. Create Controller** (`app/controllers/MyController.ts`):
   - Import schema & service
   - Validate → call service → return response

**6. Create Route** (`app/rotas/MyRotas.ts`):
   - Extend `Rota` interface
   - Register HTTP methods with controllers

**7. Register Route** in `app.ts`:
   - Add to `listaRotas` array

## Response Format

All responses are JSON:

**Success (200, 201, etc.):**
```json
{
  "sucesso": true,
  "codigo": 200,
  "mensagem": "Descrição do sucesso",
  "dados": { ... }
}
```

**Error (4xx, 5xx):**
```json
{
  "sucesso": false,
  "codigo": 400,
  "mensagem": "Descrição do erro",
  "erro": { ... }
}
```

## Deployment Notes

- On Render, the server binds to `0.0.0.0` (checked via `'RENDER' in process.env`)
- PostgreSQL connection pooling: check Supabase settings if scaling
- OpenAI API key must be kept secret; never commit to git
- JWT refresh token logic exists but may need enhancements (see `usuarioController.obterNovoTokenAcesso()`)
