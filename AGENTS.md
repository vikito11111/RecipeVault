# RecipeVault — AI Agent Instructions

## Project Overview
RecipeVault is a full-stack recipe sharing platform built as a monorepo with:
- `web/` — Next.js 15 web app + backend API
- `mobile/` — Expo React Native mobile app

## Architecture

### Monorepo Structure
```
/
├── web/         Next.js app (frontend + backend API)
├── mobile/      Expo mobile app
├── AGENTS.md    This file
└── README.md    Documentation
```

### Client-Server Communication
- **Web app**: React components → Next.js Server Actions and API routes
- **Mobile app**: React Native → RESTful API (`/api/*` routes in Next.js)
- **Auth**: JWT tokens stored in httpOnly cookies (web) / SecureStore (mobile)

## Database

### Tech Stack
- **ORM**: Drizzle ORM (always use Drizzle migrations, never raw SQL)
- **DB**: Neon serverless PostgreSQL (`@neondatabase/serverless`)
- **Schema**: `web/src/db/schema.ts`
- **Config**: `web/drizzle.config.ts`

### Tables
1. `users` — id, name, email, password_hash, role (user|admin), bio, avatar_url
2. `categories` — id, name, slug, description, image_url
3. `recipes` — id, title, description, ingredients, instructions, category_id, user_id, image_url, prep_time, cook_time, servings, difficulty, is_published, views
4. `reviews` — id, recipe_id, user_id, rating (1-5), comment
5. `favorites` — id, recipe_id, user_id

### Migration Rules
- **ALWAYS use Drizzle migrations** for schema changes: `npm run db:generate && npm run db:migrate`
- Never modify the DB schema directly
- Migration files go in `web/drizzle/`

## Authentication
- JWT tokens signed with `JWT_SECRET` env var
- Passwords hashed with bcrypt (12 rounds)
- Web: httpOnly cookies (`auth_token`)
- Mobile: `expo-secure-store`
- Middleware at `web/src/middleware.ts` enforces auth on protected routes
- Admin routes require `role === "admin"`

## API Routes (web/src/app/api/)
All RESTful, return JSON:
- `POST /api/auth/register` — register user
- `POST /api/auth/login` — login
- `POST /api/auth/logout` — clear cookie
- `GET /api/auth/me` — current user (requires auth)
- `GET /api/recipes` — list with pagination & filters (`?page, search, category, difficulty`)
- `POST /api/recipes` — create (auth required)
- `GET /api/recipes/:id` — recipe details + reviews
- `PUT /api/recipes/:id` — update (owner or admin)
- `DELETE /api/recipes/:id` — delete (owner or admin)
- `GET /api/categories` — list all categories
- `POST /api/reviews` — add/update review (auth required)
- `GET /api/favorites` — user favorites (auth required)
- `POST /api/favorites` — toggle favorite (auth required)
- `GET/PUT /api/users/:id` — user profile
- `GET/PUT/DELETE /api/admin/users` — admin user management
- `GET/PUT /api/admin/recipes` — admin recipe management
- `POST /api/seed` — seed DB with 10,000+ records

## Web App Pages (web/src/app/)
- `/` — Home (hero, categories, popular recipes)
- `/auth/login` — Login
- `/auth/register` — Register
- `/recipes` — Recipe listing with search/filter/pagination
- `/recipes/new` — Add recipe (protected)
- `/recipes/[id]` — Recipe details + reviews
- `/recipes/[id]/edit` — Edit recipe (owner/admin)
- `/categories` — All categories
- `/categories/[slug]` — Category recipes
- `/dashboard` — User dashboard (protected)
- `/dashboard/favorites` — Saved recipes (protected)
- `/profile` — Edit profile (protected)
- `/admin` — Admin dashboard (admin only)
- `/admin/users` — Manage users (admin only)
- `/admin/recipes` — Manage recipes (admin only)
- `/about` — About page

## Mobile App Screens (mobile/app/)
- `(tabs)/index` — Home feed
- `(tabs)/search` — Search & browse
- `(tabs)/favorites` — Saved recipes
- `(tabs)/profile` — User profile / auth
- `recipe/[id]` — Recipe details
- `login` — Login screen
- `register` — Register screen

## Key Conventions
1. **Server Components by default** — only use `"use client"` when needed (forms, interactivity)
2. **Drizzle queries** — use relations/joins, not separate queries when possible
3. **Pagination** — always paginate large lists (`limit`, `offset`, return `total` and `pages`)
4. **Error handling** — API routes return `{ error: string }` with appropriate status codes
5. **Role checks** — always verify `session.role === "admin"` for admin endpoints
6. **TypeScript** — all files must be TypeScript; avoid `any` except where necessary

## Environment Variables
```
DATABASE_URL=           # Neon PostgreSQL connection string
JWT_SECRET=             # Min 32 chars, random
NEXT_PUBLIC_APP_URL=    # App URL (http://localhost:3000 in dev)
```

## Running Locally
```bash
# Web
cd web && npm run dev     # http://localhost:3000

# Mobile
cd mobile && npm start    # Expo dev server
```

## Seeding
POST to `/api/seed` once to insert 10,000 recipes + 51 users + reviews.
Admin credentials: `admin@recipevault.com` / `demo123`
