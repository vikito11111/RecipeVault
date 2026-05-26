<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# RecipeVault Web App

See the root `AGENTS.md` for full project instructions.

## Web-Specific Notes
- App Router (not Pages Router). All pages in `src/app/`.
- Server Components by default — only `"use client"` for interactive components.
- API routes in `src/app/api/` — all RESTful, return JSON.
- DB schema in `src/db/schema.ts` — use Drizzle migrations always.
- Auth via `src/lib/auth.ts` — JWT + bcrypt.
- Route protection via `src/middleware.ts`.
