---
id: arc-002
type: architecture
title: Database Schema
description: "SQLite schema with Drizzle ORM - users, links, clicks, api_keys tables"
tags:
  - database
  - schema
  - sqlite
  - drizzle
files:
  - src/lib/schema.ts
  - src/lib/db.ts
  - src/lib/db-store.ts
status: active
timestamp: 2026-07-17T14:00:00Z
---

# Database Schema

## Tables

### users
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | crypto.randomUUID() |
| email | text (unique) | Normalized lowercase |
| passwordHash | text | bcrypt, 10 salt rounds |
| createdAt | text | ISO timestamp |

### links
| Column | Type | Notes |
|--------|------|-------|
| code | text PK | 6 char alphanumeric or custom |
| url | text | Original destination URL |
| clicks | integer (default 0) | Total click count |
| ownerId | text (nullable) | FK → users.id |
| createdAt | text | ISO timestamp |

### clicks
| Column | Type | Notes |
|--------|------|-------|
| id | integer PK | Auto increment |
| linkCode | text | FK → links.code |
| ip | text | From x-forwarded-for |
| userAgent | text | Browser UA |
| referrer | text | HTTP referer |
| country | text | Geo IP |
| device | text | mobile/desktop/tablet |
| timestamp | text | ISO timestamp |

### apiKeys
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | crypto.randomUUID() |
| userId | text | FK → users.id |
| name | text | Human label |
| keyHash | text | SHA-256 of full key |
| lastChars | text | Last 8 chars for display |
| createdAt | text | ISO timestamp |
| revokedAt | text (nullable) | Null = active |

## Key Patterns
- Singleton DB connection via getDb()
- Auto-creates tables on first init
- WAL mode enabled for performance
- Foreign keys enforced
