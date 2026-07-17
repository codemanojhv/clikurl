# clikurl

**clikurl** is a fast, accessible URL shortener with QR code generation, user accounts, API keys, and a Chrome extension. Built with Next.js 16 and SQLite.

## Quick Facts

| Property | Value |
|----------|-------|
| **Framework** | Next.js 16.2.9 (Turbopack) |
| **React** | 19.2.4 |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Database** | SQLite + Drizzle ORM (`data/clikurl.db`) |
| **Deployment** | Vercel (SQLite → /tmp on serverless) |
| **Package Manager** | npm |
| **Auth** | httpOnly cookie (`auth_token`) + API keys (SHA-256 hashed) |

## Key Features

- URL shortening with optional custom aliases
- QR code generation for every short link
- Click analytics (24h, 7d, top referrers, countries, devices)
- User accounts with cookie-based auth
- Dashboard (overview stats, link management, API keys)
- API key management (create, copy once, revoke)
- 3-tier pricing (Free / Pro / Enterprise)
- API documentation page with code examples
- Chrome extension for one-click shortening
- Hytrax knowledge store for agent handoffs
- Obsidian vault for reference docs

## Tech Stack

| Category | Libraries |
|----------|-----------|
| **UI** | React 19, shadcn/ui, lucide-react |
| **Styling** | Tailwind v4, tw-animate-css, class-variance-authority, clsx |
| **Data** | Drizzle ORM, better-sqlite3, Zod |
| **QR** | qrcode.react |
| **Auth** | bcryptjs, crypto (SHA-256 for API keys) |
| **Dev** | TypeScript, ESLint, Vitest |

## Scripts

```bash
npm run dev    # Start dev server (port 3001)
npm run build  # Production build
npm start      # Start production server
npm run lint   # ESLint
```
