# Components

## Page Components

| Route | File | Description |
|-------|------|-------------|
| `/` | `page.tsx` | Landing page: URL shortener form, QR code, FAQ list |
| `/login` | `login/page.tsx` | Email + password login form |
| `/register` | `register/page.tsx` | Registration form |
| `/dashboard` | `dashboard/page.tsx` | Overview stats + recent links table |
| `/dashboard/links` | `dashboard/links/page.tsx` | Full link table with delete action |
| `/dashboard/keys` | `dashboard/keys/page.tsx` | API key management (create/copy/revoke) |
| `/pricing` | `pricing/page.tsx` | 3-tier pricing cards (Free/Pro/Enterprise) |
| `/docs` | `docs/page.tsx` | API documentation with curl/JS examples |

## Layout

- **Root layout** (`layout.tsx`): Geist font, Tailwind, minimal wrapper
- **Dashboard layout** (`dashboard/layout.tsx`): Dark slate-900 sidebar + content area, responsive hamburger menu on mobile

## UI Components (shadcn/ui)

Located in `src/components/ui/`:
- `button.tsx` — Variants: default, destructive, outline, secondary, ghost, link
- `card.tsx` — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `input.tsx` — Styled input with focus ring
- `label.tsx` — Form label
- `table.tsx` — Table, TableHeader, TableBody, TableRow, TableCell, TableHead
- `dropdown-menu.tsx` — Dropdown with items
- `dialog.tsx` — Modal dialog
- `use-toast.ts` / `toast.tsx` — Toast notifications
