# Architecture

## System Design

```
┌─────────────────────────────────────────────────┐
│                   Browser                         │
│  Landing │ Dashboard │ Docs │ Pricing │ Login/R   │
└──────────┬───────────────────────┬───────────────┘
           │                       │
           │ cookies               │ Authorization: Bearer
           │ (auth_token)          │ (API key)
           ▼                       ▼
┌─────────────────────────────────────────────────┐
│              Next.js 16 App Router                │
│  ┌──────────┐ ┌────────────────────────────────┐ │
│  │ Routes   │ │ API Routes                     │ │
│  │ /[code]  │ │ /api/shorten                   │ │
│  │ /login   │ │ /api/auth*                     │ │
│  │ /register│ │ /api/me/links*                 │ │
│  │ /dashboard│ │ /api/me/keys*                  │ │
│  │ /pricing │ │ /api/analytics                 │ │
│  │ /docs    │ └──────────┬─────────────────────┘ │
│  └──────────┘            │                         │
└──────────────────────────┼─────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────┐
│          Data Access Layer (db-store.ts)             │
│  getUserFromSession │ createUser │ createLink        │
│  getLinksForUser    │ createApiKey │ getApiKeyByHash │
└──────────────────────────┬─────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────┐
│               SQLite (Drizzle ORM)                   │
│  users │ links │ clicks │ api_keys                  │
└───────────────────────────────────────────────────┘
```

## Auth Flow

1. **Web Auth (cookie):** Register → server sets httpOnly `auth_token` cookie. All dashboard routes read cookie via `getUserFromSession(request)`.
2. **API Auth (key):** `Authorization: Bearer <key>` header → server hashes key with SHA-256 → matches against `api_keys.key_hash`.

## Key Design Decisions

- **Cookie-based auth** (not localStorage Bearer tokens) — more secure against XSS
- **SQLite** instead of JSON files — proper querying, WAL mode, auto-increment IDs for clicks
- **API keys are SHA-256 hashed** — full key shown once on creation, only last 8 chars stored
- **Async params** — Next.js 16 requires `{ params }: { params: Promise<{...}> }`
