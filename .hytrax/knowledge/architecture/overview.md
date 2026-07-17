---
id: arc-001
type: architecture
title: clikurl System Overview
description: "Full-stack URL shortener with Next.js 16, SQLite/Drizzle, cookie auth, and API key support"
tags:
  - architecture
  - overview
  - nextjs
files:
  - src/
status: active
timestamp: 2026-07-17T14:00:00Z
---

# clikurl Architecture

## Stack
- **Framework:** Next.js 16.2.9 (Turbopack)
- **React:** 19.2.4
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** SQLite + Drizzle ORM
- **Deployment:** Vercel

## Directory Structure
```
src/
  app/
    page.tsx                  # Landing page (shortener + QR + FAQ)
    layout.tsx                # Root layout with Geist fonts
    login/page.tsx            # Login form
    register/page.tsx         # Register form
    dashboard/page.tsx        # Dashboard overview
    dashboard/layout.tsx      # Sidebar layout
    dashboard/links/page.tsx  # Link management table
    dashboard/keys/page.tsx   # API key management
    pricing/page.tsx          # Pricing tiers
    docs/page.tsx             # API documentation
    [code]/route.ts           # Redirect handler
    api/
      shorten/route.ts        # POST - Create short link
      analytics/route.ts      # GET - Click analytics
      auth/route.ts           # POST - Login/register
      auth/me/route.ts        # GET - Session check
      auth/logout/route.ts    # POST - Clear session
      me/links/route.ts       # GET - List user links
      me/links/[code]/route.ts# GET/DELETE - Single link
      me/keys/route.ts        # GET/POST - API keys
      me/keys/[id]/route.ts   # DELETE - Revoke key
  lib/
    db.ts                     # SQLite connection singleton
    schema.ts                 # Drizzle ORM schema (4 tables)
    db-store.ts               # Data access layer
    store.ts                  # Legacy JSON store (deprecated)
    userStore.ts              # Legacy user store (deprecated)
    auth.ts                   # Legacy auth (deprecated)
    utils.ts                  # cn() utility
  components/ui/              # shadcn/ui components
    button.tsx, card.tsx, input.tsx
extension/                    # Chrome extension (Manifest V3)
vault/                        # Obsidian vault
```

## Data Flow
1. User submits URL on landing page or via API
2. Server generates short code (6 char alphanumeric) or uses custom alias
3. Link stored in SQLite `links` table
4. Redirect: GET /[code] → 302 to original URL + click tracking in `clicks` table
5. Analytics aggregated from `clicks` table

## Auth Flow
1. User registers with email + password (bcrypt hashed)
2. Server sets httpOnly `auth_token` cookie
3. API routes read cookie via `getUserFromSession(request)`
4. Programmatic access via API keys in `Authorization: Bearer` header
