# CLAUDE.md — NutrIA

NutrIA is a calorie/nutrition tracker: an Express + TypeORM API backend and an Expo/React Native mobile frontend, with an OpenAI-powered chat assistant tied into the user's daily log.

`backend/` and `frontend/` are independent Node packages, each with their own `node_modules`, `.env`, and commands — the root `package.json` only holds the `dev` orchestration script below, it has no dependencies of its own. Run `npm install` inside each package before working on it directly.

## Repo Layout

```
nutria/
├── backend/    # Node.js + TypeScript + Express + TypeORM (Postgres) — see backend/CLAUDE.md
│   └── docker-compose.yml   # local Postgres for backend dev
├── frontend/   # React Native + Expo + TypeScript — see frontend/CLAUDE.md
├── scripts/dev.js   # one-command local dev bootstrap, see Quick Start below
└── package.json      # just the `dev` script, no dependencies
```

Read [backend/CLAUDE.md](backend/CLAUDE.md) or [frontend/CLAUDE.md](frontend/CLAUDE.md) for the details of whichever side you're working on — this file only covers what's shared between them.

## Quick Start

```bash
npm run dev
```

Runs [scripts/dev.js](scripts/dev.js) (plain Node, no bash — works on Windows/Mac/Linux): installs backend/frontend deps if missing, creates `backend/.env`/`frontend/.env` if missing (generating JWT secrets for you), starts local Postgres via Docker, runs migrations + seed, starts the backend in the background, then starts Expo in the foreground. Ctrl+C stops both. Safe to re-run any time — migrations/seed are idempotent. Requires Docker running and no `BACKEND_DATABASE_URL` set in `backend/.env` (if it is set, the script targets that remote DB instead of Docker).

## How the two sides connect

- Backend listens on port **5001** locally (hardcoded, overridden by `PORT` on Render); all routes are mounted under `/nutria`.
- Frontend builds its base URL from `EXPO_PUBLIC_BACKEND_URL` + `EXPO_PUBLIC_BACKEND_PORTA` (see `frontend/.env.example`) and appends `/nutria` itself.
- Every response envelope is `{ sucesso, codigo, mensagem, dados|erro }` — both sides rely on this shape (frontend service functions always read `response.data.data`).
- Auth is JWT Bearer: frontend stores `access_token`/`refresh_token` in `AsyncStorage` and an axios interceptor auto-refreshes on 401; backend validates the bearer token and injects the user id (`sub` claim) into `req.body.id_usuario`.

## Env & Deployment

- Backend: copy `backend/.env.example` → `backend/.env`. Local dev uses `BACKEND_DB_*` against the Docker Postgres (`docker compose up -d`); production uses `BACKEND_DATABASE_URL` instead. Both need `BACKEND_JWT_SECRET`, `BACKEND_REFRESH_SECRET`, and `BACKEND_OPEN_AI_API_KEY` (chatbot only).
- Frontend: copy `frontend/.env.example` → `frontend/.env`.
- Backend deploys to Render (binds `0.0.0.0` when `'RENDER' in process.env`); DB via Neon/Supabase Postgres. Never commit `.env` or the OpenAI key.
