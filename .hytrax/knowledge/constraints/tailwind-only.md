---
id: con-001
type: constraint
title: Tailwind CSS Only
description: "All styling must use Tailwind utility classes. No plain CSS files."
tags:
  - frontend
  - constraint
  - styling
files:
  - src/app/globals.css
  - src/app/page.tsx
status: active
timestamp: 2026-07-17T14:00:00Z
---

Use Tailwind CSS v4 utility classes for all styling. The only exception is `globals.css` which contains:
- Tailwind imports
- Custom animation keyframes
- shadcn/ui theme variables
- Small utility classes (glass-card, mesh-bg, etc.)
