# Directory Structure

```
E:\clikurl\
├── .hytrax/                        # Hytrax knowledge store
│   ├── config.toml
│   ├── knowledge/
│   │   ├── architecture/
│   │   │   ├── overview.md
│   │   │   └── database.md
│   │   ├── constraints/
│   │   │   └── tailwind-only.md
│   │   └── patterns/
│   │       └── api-patterns.md
│   ├── context/handoffs/
│   │   └── current-state.md
│   └── outcomes/
│       └── outcomes.jsonl
├── .planning/                      # GSD planning (if initialized)
├── data/                           # SQLite database
│   └── clikurl.db                  # (gitignored)
├── public/                         # Static assets
│   └── icon.svg / og-image.png
├── src/
│   ├── app/
│   │   ├── globals.css             # Tailwind + theme + animations
│   │   ├── layout.tsx              # Root layout (Geist fonts)
│   │   ├── page.tsx                # Landing page
│   │   ├── login/page.tsx          # Login form
│   │   ├── register/page.tsx       # Register form
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Sidebar layout
│   │   │   ├── page.tsx            # Overview stats
│   │   │   ├── links/page.tsx      # Link management
│   │   │   └── keys/page.tsx       # API key management
│   │   ├── pricing/page.tsx        # Pricing page
│   │   ├── docs/page.tsx           # API documentation
│   │   ├── [code]/route.ts         # Redirect handler
│   │   └── api/
│   │       ├── shorten/route.ts    # Create short link
│   │       ├── analytics/route.ts  # Click analytics
│   │       ├── auth/
│   │       │   ├── route.ts        # Login/register
│   │       │   ├── me/route.ts     # Session check
│   │       │   └── logout/route.ts # Logout
│   │       └── me/
│   │           ├── links/
│   │           │   ├── route.ts    # List user links
│   │           │   └── [code]/route.ts # Delete link
│   │           └── keys/
│   │               ├── route.ts    # List/create keys
│   │               └── [id]/route.ts # Revoke key
│   ├── lib/
│   │   ├── db.ts                   # SQLite connection singleton
│   │   ├── schema.ts               # Drizzle ORM schema
│   │   ├── db-store.ts             # Data access layer
│   │   ├── store.ts                # (deprecated) JSON store
│   │   ├── userStore.ts            # (deprecated) JSON user store
│   │   ├── auth.ts                 # (deprecated) legacy auth
│   │   └── utils.ts                # cn() helper
│   └── components/ui/              # shadcn/ui components
├── extension/                      # Chrome Extension (Manifest V3)
├── vault/                          # Obsidian vault
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```
