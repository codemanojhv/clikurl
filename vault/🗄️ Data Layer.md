# Data Layer

## Database Connection (`src/lib/db.ts`)

Singleton SQLite connection via Drizzle ORM. Uses WAL mode, enables foreign keys.

- Local path: `./data/clikurl.db`
- Vercel path: `/tmp/clikurl.db`
- Tables auto-created on first `init()` call

## Schema (`src/lib/schema.ts`)

### `users` — user accounts
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | `crypto.randomUUID()` |
| email | text (unique) | Normalized .toLowerCase() |
| passwordHash | text | bcrypt (10 salt rounds) |
| createdAt | text | ISO timestamp |

### `links` — shortened URLs
| Column | Type | Notes |
|--------|------|-------|
| code | text PK | 6-char alphanumeric or custom alias |
| url | text | Destination URL |
| clicks | integer (default 0) | Denormalized count for speed |
| ownerId | text? | FK → users.id (null = anonymous) |
| createdAt | text | ISO timestamp |

### `clicks` — individual click events
| Column | Type | Notes |
|--------|------|-------|
| id | integer PK | Auto-increment |
| linkCode | text | FK → links.code |
| ip | text | From `x-forwarded-for` |
| userAgent | text | Browser UA string |
| referrer | text | HTTP Referer header |
| country | text | (future: GeoIP) |
| device | text | mobile/desktop/tablet |
| timestamp | text | ISO timestamp |

### `apiKeys` — programmatic access
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | `crypto.randomUUID()` |
| userId | text | FK → users.id |
| name | text | Human-readable label |
| keyHash | text | SHA-256 of full API key |
| lastChars | text | Last 8 chars for UI display |
| createdAt | text | ISO timestamp |
| revokedAt | text? | Null = active, set on revoke |

## Data Access Functions (`src/lib/db-store.ts`)

### User operations
- `createUser(email, password)` → user object
- `authenticateUser(email, password)` → user or null
- `getUserFromSession(request)` → user or null (reads cookie)
- `getUserByEmail(email)` → user or null

### Link operations
- `createLink(url, ownerId?, customAlias?)` → link object
- `getLink(code)` → link or null
- `getLinksForUser(userId, page?, limit?)` → { links, total }
- `deleteLink(code, userId)` → boolean
- `getAllLinks()` → array (admin)

### Click operations
- `recordClick(linkCode, ip, userAgent, referrer)` → void
- `getAnalytics(code)` → analytics object

### API key operations
- `createApiKey(userId, name)` → key object (full key shown once)
- `getApiKeysForUser(userId)` → array (no revoked)
- `getApiKeyByHash(keyHash)` → key or null
- `revokeApiKey(id, userId)` → boolean
