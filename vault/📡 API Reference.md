# API Reference

## POST /api/shorten
Create a shortened URL.

**Auth:** Cookie (optional) or API key
**Request:**
```json
{
  "url": "https://example.com/very-long-url",
  "customAlias": "my-link"
}
```
**Response (200):**
```json
{
  "shortUrl": "https://clikurl.vercel.app/abc123",
  "originalUrl": "https://example.com/very-long-url",
  "shortCode": "abc123",
  "createdAt": "2026-07-17T..."
}
```
**Errors:** `400` (URL required / invalid alias), `409` (alias taken)

---

## GET /[code]
Redirect a short code. Tracks click (IP, UA, referrer, country, device).

**Response:** HTTP 302 redirect
**Errors:** `404` (not found)

---

## GET /api/analytics?code=<code>
Get analytics for a link.

**Response (200):**
```json
{
  "code": "abc123",
  "originalUrl": "https://...",
  "totalClicks": 42,
  "clicks24h": 5,
  "clicks7d": 20,
  "topReferrers": [{"referrer": "direct", "count": 30}],
  "topCountries": [{"country": "US", "count": 25}],
  "deviceBreakdown": {"mobile": 20, "desktop": 18, "tablet": 3, "other": 1},
  "recentClicks": [...]
}
```

---

## POST /api/auth
Register or login.

**Request:**
```json
{ "mode": "register", "email": "user@example.com", "password": "secret123" }
```
**Response (200):** Sets `auth_token` httpOnly cookie
**Errors:** `400` (missing fields), `409` (email taken)

---

## POST /api/auth/logout
Clear auth session.

**Response (200):** `{ "ok": true }` (sets cookie `maxAge: 0`)

---

## GET /api/auth/me
Check current session.

**Auth:** Cookie
**Response (200):** `{ "authenticated": true, "user": {...} }`
**Errors:** `401` (not logged in)

---

## GET /api/me/links
List user's links.

**Auth:** Cookie
**Response (200):**
```json
{ "links": [{"code":"abc123","url":"https://...","clicks":10,"createdAt":"..."}], "total": 5 }
```

---

## DELETE /api/me/links/[code]
Delete a user's link.

**Auth:** Cookie
**Errors:** `404` (not found / not owner)

---

## GET /api/me/keys
List user's API keys.

**Auth:** Cookie
**Response (200):**
```json
{ "keys": [{"id":"...","name":"my key","lastChars":"abcdefgh","createdAt":"..."}] }
```
(Note: full key is NOT returned)

---

## POST /api/me/keys
Create a new API key.

**Auth:** Cookie
**Request:** `{ "name": "my key" }`
**Response (200):**
```json
{ "id":"...","name":"my key","key":"clikurl_xxx...xxx","lastChars":"abcdefgh","createdAt":"..." }
```
(Full key shown ONLY on creation)

---

## DELETE /api/me/keys/[id]
Revoke an API key.

**Auth:** Cookie
**Response (200):** `{ "success": true }`

---

## POST /api/domains
Register a new custom brand domain.

**Auth:** Cookie or API key (Bearer token)
**Request:**
```json
{
  "domain": "go.kfc.in"
}
```
**Response (200):**
```json
{
  "domain": "go.kfc.in",
  "status": "pending",
  "dns": {
    "type": "CNAME",
    "name": "go",
    "value": "cname.clikurl.vercel-dns.com"
  }
}
```

---

## POST /api/domains/[id]/verify
Verify domain DNS CNAME mapping.

**Auth:** Cookie or API key (Bearer token)
**Query Parameters:** `bypass=true` (optional, to bypass CNAME DNS check)
**Response (200):**
```json
{
  "id": "domain-uuid-here",
  "status": "verified"
}
```

---

## POST /api/links
Unified link shortening endpoint for developer integrations.

**Auth:** Cookie or API key (Bearer token)
**Request:**
```json
{
  "destination": "https://kfc.in/skjefsbrjybrd",
  "domain": "go.kfc.in",
  "slug": "rgdgv",
  "clickLimit": 100,
  "expiresAt": "2026-08-17T00:00:00.000Z"
}
```
(Supports parameter aliases: `destination`/`url`, `slug`/`customAlias`, `domain`/`customDomain`)

**Response (200):**
```json
{
  "shortUrl": "https://go.kfc.in/rgdgv",
  "originalUrl": "https://kfc.in/skjefsbrjybrd",
  "shortCode": "rgdgv",
  "createdAt": "2026-07-17T..."
}
```

---

## PATCH /api/me/links/[code]
Toggle active link's archive status.

**Auth:** Cookie
**Request:**
```json
{
  "isArchived": true
}
```
**Response (200):**
```json
{
  "success": true
}
```
