# CLAUDE.md — Frontend

Expo (React Native + TypeScript) app. Screen-based navigation, TanStack Query for both server cache and local auth state, and a thin axios wrapper that handles JWT refresh transparently.

## Commands

```bash
npm start      # expo start — scan the QR code or press i/a for simulator
npm run ios    # expo start --ios
npm run android
npm run web
```

Env: copy `.env.example` → `.env`. Only two variables matter — `EXPO_PUBLIC_BACKEND_URL` and `EXPO_PUBLIC_BACKEND_PORTA` — combined in `src/config/variaveis.ts` into `URL_BACKEND` (`${DOMINIO}${:PORTA}/nutria`). On a physical device, `localhost` must be swapped for the machine's LAN IP (see the file's commented example) since the device isn't the same host as the backend.

## App shell & navigation

`App.tsx` loads custom fonts, wraps everything in `QueryClientProvider` (single shared `queryClient` from `src/lib/react-query.ts`), and renders `MainStackNavigator`.

`MainStackNavigator` (`src/navigation/MainStackNavigator.tsx`) is the auth switch: it reads `getUserTokens()` (a `useQuery` over `AsyncStorage`, see below) and renders `AuthenticatedNavigator` or `UnauthenticatedNavigator` — there's no splash/loading state here, the token check is synchronous against the query cache.

`AuthenticatedNavigator` is also where all of the user's core data is **prefetched up front**: it calls `useUsuarioInfo`, `usePerfisUsuario`, `useConsumoAlimentos`, `useRefeicoesUsuario`, `useAlimentosFavoritos`, `useDiasUsuario` and blocks on a `LoadingScreen` until all resolve, showing a retry screen on any error. Only once all six are loaded does it mount `TopTabNavigator`. New screens that need user data at startup should read it from these existing caches (by query key) instead of re-fetching.

Navigation nesting: `MainStackNavigator` → `AuthenticatedNavigator` (stack) → `TopTabNavigator` → `BottomTabNavigator` → per-tab stack navigators (`HomeNavigator`, `SettingsNavigator`, `DiarioNavigator`) → screens under `src/screens/AuthenticadedScreens/*`.

## API layer — three-tier pattern

```
src/api/
├── schemas/    # plain TS interfaces describing request/response shapes (no runtime validation — unlike the backend's Zod)
├── services/   # raw axios calls via `api` (src/config/apiService.ts), one file per domain, always try/catch → throw error.response.data
└── httpState/  # + hooks/  — React Query hooks (useQuery/useMutation) wrapping the services, one hook per data need
```

Example chain for a screen needing the user's profile: `usePerfisUsuario()` (`httpState/usuarioData.ts`) → `obterPerfilService()` (`services/perfilService.ts`) → `api.get(...)` → backend. Query keys are plain strings (`'usuarioInfo'`, `'perfisUsuario'`, `'consumoAlimentos'`, `'refeicoesUsuario'`, `'alimentosFavoritos'`, `'diasUsuario'`) — reuse the existing key when invalidating/updating a cache instead of inventing a new one, since `AuthenticatedNavigator` and other screens read these same keys.

`src/api/hooks/` holds imperative (non-cache-key) hooks, e.g. `useConversarChatbot` — plain `useState`-based loading/error/data, not a `useQuery`, because a chat exchange isn't something to cache/refetch by key. It does still reach into the shared `queryClient` to patch other caches after a response (e.g. appending a food the chatbot just logged into the `consumoAlimentos` cache) — follow this pattern when a mutation needs to keep other screens' caches in sync.

## Auth & the axios client (`src/config/apiService.ts`)

- Tokens live in `AsyncStorage` (`authToken`, `refreshToken`), read/written via `getTokensStorage`/`setTokensStorage` in `src/api/httpState/usuarioAuth.ts`. `getUserTokens()` exposes them as a `useQuery(['usuarioTokens'], ...)` so token presence is reactive across the app (that's what `MainStackNavigator` reads to decide which navigator to mount).
- Request interceptor attaches `Authorization: Bearer <token>` from storage on every call.
- Response interceptor: on a `401` from a route that isn't in `listaRotasSemAuth` (`/usuario/criar`, `/usuario/login`), it calls `refreshAuthTokens()` once (deduped via a shared in-flight `refreshPromise` so concurrent 401s don't trigger parallel refreshes), retries the original request, and if the refresh itself fails calls `logoutSessaoExpirada()` — which clears storage, cancels in-flight queries, and wipes every cache except `['usuarioTokens']`. This is the automatic-logout-on-expired-session behavior; don't duplicate 401 handling in individual services.
- Both console-log requests/responses for local debugging (`📤`/`✅`/`❌` prefixes) — harmless in dev, but be aware they're there if you're chasing noisy logs.

Sign-up (`fazerSignUpService` in `services/usuarioService.ts`) is two backend calls chained on the frontend: create the account (`criarUsuarioService`, stores the returned tokens immediately) then create the profile (`criarPerfilService`) using data merged from the sign-up form via `utils/criaUsuarioJSON.ts` / `utils/criaPerfilJSON.ts` — those two files are where raw form/chat input gets mapped into the exact payload shape the backend schemas expect (including the label→enum maps below).

## Shared enums & constants (`src/config/variaveis.ts`)

Mirrors the backend's `config/variaveis.ts` enums (`tiposDeCartao`, `listaEstadosAlimentos`, `listaUnidadesMedida`, `listaSistemasMedidas`) so payloads validate. It also carries UI-facing label→value maps the backend doesn't have (`mapSexosBiologicos`, `mapPerfisAlimentares`, `mapNiveisDeAtividade`, `mapObjetivos`, `mapUnidadesDeMedida`) for translating Portuguese picker labels into the exact enum strings the API expects — plus `mapMultNiveisDeAtividade`, the activity multiplier table used with `utils/utils.ts`'s `calcularTMB`/`calcularTMT` (Harris-Benedict) for local calorie-goal estimates. When adding a new picker tied to a backend enum, add the label here rather than hardcoding strings in the screen.

## UI conventions

- `src/styles/theme.ts` — single source for colors, font sizes, border radius; import `theme` rather than hardcoding hex values or sizes.
- Responsive sizing goes through `getResponsiveSizeWidth`/`getResponsiveSizeHeight` (`utils/utils.ts`, percentage of `Dimensions.get('window')`) instead of fixed dp — used throughout `theme.ts` and screen styles.
- Fonts are the custom `NotoSans-*` family loaded in `App.tsx` via `expo-font`; reference by family name string in styles, there's no wrapper Text component enforcing it.
- Components are organized by the screen/feature that owns them (`components/Home/`, `components/ChatBotSignUp/`) plus a `components/Common/` for truly shared pieces (currently just `Button`).

## Project structure

```
frontend/
├── App.tsx                 # fonts, QueryClientProvider, mounts MainStackNavigator
├── src/
│   ├── api/
│   │   ├── schemas/         # plain TS interfaces for request/response payloads
│   │   ├── services/        # axios calls, one file per backend domain
│   │   ├── httpState/       # React Query hooks (cache-keyed) + token storage helpers
│   │   └── hooks/            # imperative hooks not tied to a query key (e.g. chatbot)
│   ├── components/           # feature-grouped presentational components
│   ├── config/                # apiService.ts (axios instance), variaveis.ts (env + enums)
│   ├── lib/react-query.ts     # the single shared QueryClient
│   ├── navigation/             # stack/tab navigators, auth-gated at MainStackNavigator
│   ├── screens/                 # AuthenticadedScreens/ + UnauthenticadedScreens/
│   ├── styles/                   # theme.ts, globalStyles.ts
│   └── utils/                     # formatters, form→payload mappers, responsive-size/math helpers
```
