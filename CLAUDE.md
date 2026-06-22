# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NutrIA** is an intelligent nutrition tracking app with a chatbot assistant. The project is a monorepo with separate frontend (React Native) and backend (Node.js) directories.

- **Frontend**: React Native with Expo for iOS/Android/web
- **Backend**: Express.js + TypeORM + PostgreSQL (Supabase) + OpenAI API
- **API Communication**: Bearer token JWT authentication via Authorization header

## Monorepo Structure

```
NutrIA/
├── frontend/          # React Native app (Expo)
│   ├── src/
│   │   ├── api/       # API client hooks (React Query)
│   │   ├── components/# Reusable UI components
│   │   ├── screens/   # Full-screen components
│   │   ├── navigation/# React Navigation setup
│   │   ├── config/    # API service & env variables
│   │   ├── styles/    # Theme & global styles
│   │   └── utils/     # Formatters, interfaces, helpers
│   ├── app.json       # Expo config
│   └── package.json
│
├── backend/           # Node.js Express API
│   ├── src/
│   │   ├── app/
│   │   │   ├── controllers/     # Route handlers
│   │   │   ├── entities/        # TypeORM models
│   │   │   ├── repositories/    # Database access layer
│   │   │   ├── rotas/           # Express Router definitions
│   │   │   ├── schemas/         # Zod validation schemas
│   │   │   ├── services/        # Business logic
│   │   │   └── servidor.ts      # Express app setup
│   │   ├── config/              # Environment config
│   │   ├── database/            # TypeORM data source
│   │   ├── utils/               # Shared utilities
│   │   └── app.ts               # Entry point
│   └── package.json
│
└── CLAUDE.md
```

## Backend Architecture

**Key Classes & Patterns:**
- **Servidor**: Express app wrapper; initializes middleware, routing, database
- **Rota** (base class): Each route handler extends this to define `caminho` (path) and `roteador` (Router)
- **Authentication**: JWT Bearer token middleware validates all requests except whitelisted routes (defined in `listaRotasSemAuth`)
- **Database**: TypeORM with PostgreSQL; entities auto-mapped to tables
- **Validation**: Zod schemas in `app/schemas/` before controller execution

**Request Flow:**
1. Request → Middleware (JWT verification if not whitelisted)
2. Route handler (e.g., `UsuarioRotas`) → Controller
3. Controller calls Service → Repository
4. Repository queries database via TypeORM

## Frontend Architecture

- **React Query** (`@tanstack/react-query`): Data fetching & caching for API calls
- **React Navigation**: Bottom tabs + native stack navigation
- **API Layer** (`src/api/`): Custom hooks that wrap React Query for backend endpoints
- **Async Storage**: Persists user data & auth tokens
- **Camera & Image**: Expo Camera and Image Picker for photo uploads
- **Chat**: `react-native-gifted-chat` for chatbot UI

## Common Development Tasks

### Backend

**Start development server** (with watch mode):
```bash
cd backend
npm run dev
```

**Build for production**:
```bash
cd backend
npm run build
```

**Run TypeORM CLI** (migrations, schema sync):
```bash
cd backend
npm run typeorm migration:generate -- src/database/migrations/MigrationName
npm run typeorm migration:run
```

**Environment setup**:
- Copy `.env.example` to `.env` in `backend/`
- Required: `USUARIO`, `SENHA`, `HOST`, `PORTA_DB`, `DATABASE`, `JWT_SECRET`, `OPENAI_API_KEY`

### Frontend

**Start with Expo**:
```bash
cd frontend
npm start
```

**Run on specific platform**:
```bash
cd frontend
npm run android   # Android
npm run ios       # iOS
npm run web       # Web
```

**Environment setup**:
- Copy `.env.example` to `.env` in `frontend/`
- Required: Backend API URL (update for local development vs. production)
- Note: If testing on multiple devices, replace `localhost` with the host machine's IP

## Key Configuration Files

- **Backend**: `src/config/variaveis.ts` — loads env variables (port, JWT secret, DB creds, OpenAI key, whitelisted routes)
- **Frontend**: `src/config/variaveis.ts`, `src/config/apiService.ts` — API base URL and axios instance

## Database & ORM

- **Provider**: Supabase (PostgreSQL)
- **ORM**: TypeORM with `synchronize: false` (use migrations, not auto-sync)
- **Entities** (`app/entities/`): Define schema; each has a corresponding Repository
- **Repositories** (`app/repositories/`): Wrap TypeORM repos for custom queries

## Authentication Flow

1. User logs in via `/nutria/usuario/login` → backend returns JWT token
2. Frontend stores token in `AsyncStorage` + `axios` Authorization header
3. All subsequent requests include `Authorization: Bearer <token>`
4. Backend middleware verifies signature and extracts `sub` (user ID) into `req.body.id_usuario`
5. Token expiration: handled by frontend on 401 response

## Key Dependencies

**Backend:**
- `express` — HTTP server framework
- `typeorm` — ORM for PostgreSQL
- `jsonwebtoken` — JWT signing/verification
- `zod` — Schema validation
- `openai` — ChatGPT integration
- `@supabase/supabase-js` — Database client

**Frontend:**
- `expo` — Development & build platform
- `react-native` — Cross-platform UI framework
- `@tanstack/react-query` — Server state management
- `@react-navigation/*` — Navigation library
- `axios` — HTTP client

## Git & Deployment

- **Target**: Render deployment (see env var `RENDER` check in `servidor.ts` for host binding)
- **Branches**: Main branch for production; dev for development
- **Environment**: Production uses Render-hosted PostgreSQL and bound to `0.0.0.0`

## Notes for Contributors

1. **Controllers**: Keep thin; move business logic to Services
2. **Repositories**: One per Entity; always query through the repo layer
3. **Validation**: Use Zod schemas before calling controllers; catch & return `{ sucesso: false, ... }` on error
4. **Frontend**: API calls go through React Query hooks in `src/api/`; avoid direct `axios` calls
5. **Token Refresh**: Currently no refresh token logic; consider adding if extending session handling
