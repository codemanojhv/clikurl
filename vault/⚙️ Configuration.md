# Configuration

## Environment Variables

None required for local development. All configuration is in code.

## next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("better-sqlite3"); // 🚩 Vercel workaround
    return config;
  },
};

export default nextConfig;
```

`better-sqlite3` is externalized in Webpack because it's a native module. On Vercel, it runs from `/tmp/` rather than the function's read-only filesystem.

## Database Path

- **Local:** `data/clikurl.db` (auto-created)
- **Vercel:** `/tmp/clikurl.db` (ephemeral — resets on cold start)

Defined in `src/lib/db.ts`:
```typescript
import Database from "better-sqlite3";

const getDb = () => {
  const dbPath = process.env.VERCEL
    ? "/tmp/clikurl.db"
    : path.join(process.cwd(), "data", "clikurl.db");
  // ...
};
```

## Port

Dev server: port 3001 (configured in `package.json` scripts).

## TypeScript

- `strict: true`
- `target: "ES2017"`
- Path alias: `@/` → `src/*`
