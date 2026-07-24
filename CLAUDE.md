# CLAUDE.md — NutrIA

NutrIA is a calorie/nutrition tracker: an Express + TypeORM API backend and an Expo/React Native mobile frontend, with an OpenAI-powered chat assistant tied into the user's daily log.

This repo has **no root `package.json`** — `backend/` and `frontend/` are independent Node packages, each with their own `node_modules`, `.env`, and commands. Run `npm install` inside each before working on it.

## Repo Layout

```
nutria/
├── backend/    # Node.js + TypeScript + Express + TypeORM (Postgres) — see backend/CLAUDE.md
├── frontend/   # React Native + Expo + TypeScript — see frontend/CLAUDE.md
└── docker-compose.yml   # local Postgres for backend dev
```

Read [backend/CLAUDE.md](backend/CLAUDE.md) or [frontend/CLAUDE.md](frontend/CLAUDE.md) for the details of whichever side you're working on — this file only covers what's shared between them.

## How the two sides connect

- Backend listens on port **5001** locally (hardcoded, overridden by `PORT` on Render); all routes are mounted under `/nutria`.
- Frontend builds its base URL from `EXPO_PUBLIC_BACKEND_URL` + `EXPO_PUBLIC_BACKEND_PORTA` (see `frontend/.env.example`) and appends `/nutria` itself.
- Every response envelope is `{ sucesso, codigo, mensagem, dados|erro }` — both sides rely on this shape (frontend service functions always read `response.data.data`).
- Auth is JWT Bearer: frontend stores `access_token`/`refresh_token` in `AsyncStorage` and an axios interceptor auto-refreshes on 401; backend validates the bearer token and injects the user id (`sub` claim) into `req.body.id_usuario`.

## Env & Deployment

- Backend: copy `backend/.env.example` → `backend/.env`. Local dev uses `BACKEND_DB_*` against the Docker Postgres (`docker compose up -d`); production uses `BACKEND_DATABASE_URL` instead. Both need `BACKEND_JWT_SECRET`, `BACKEND_REFRESH_SECRET`, and `BACKEND_OPEN_AI_API_KEY` (chatbot only).
- Frontend: copy `frontend/.env.example` → `frontend/.env`.
- Backend deploys to Render (binds `0.0.0.0` when `'RENDER' in process.env`); DB via Neon/Supabase Postgres. Never commit `.env` or the OpenAI key.
