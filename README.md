# RecipeVault

A full-stack recipe sharing and discovery platform built with Next.js, React Native/Expo, and Neon PostgreSQL.

## Project Description

RecipeVault is a community-driven recipe platform where users can discover, share, and save recipes from cuisines around the world. Users can browse 10,000+ recipes, filter by category and difficulty, leave reviews and ratings, and save their favorites. Admins have a dedicated panel to manage users and moderate recipes.

## Architecture

```
┌─────────────────────┐     REST API      ┌──────────────────┐
│  Next.js Web App    │◄─────────────────►│   Neon           │
│  (React + Server    │   Server Actions  │   PostgreSQL     │
│   Components)       │                   │   (Drizzle ORM)  │
└─────────────────────┘                   └──────────────────┘
          ▲                                        ▲
          │ REST API                               │
          │                                        │
┌─────────────────────┐                            │
│  Expo Mobile App    │────────────────────────────┘
│  (React Native)     │
└─────────────────────┘
```

### Technologies
| Layer | Tech |
|---|---|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Server Actions |
| Mobile | React Native, Expo, Expo Router |
| Database | Neon (serverless PostgreSQL) |
| ORM | Drizzle ORM |
| Auth | JWT + bcrypt |

## Database Schema

```
users ──────┐
  id         │
  name       │
  email      │
  password   │
  role       │
             │
categories  │    recipes ──────────── reviews
  id         ├──► id                    id
  name       │    title                 recipe_id ──►
  slug       │    description           user_id ────►
             │    ingredients           rating
             └──► category_id          comment
                  user_id
                  difficulty
                  views              favorites
                                       id
                                       recipe_id ──►
                                       user_id ────►
```

## Repo Structure

```
/
├── web/                    Next.js app (web + backend)
│   ├── src/
│   │   ├── app/            App Router pages + API routes
│   │   │   ├── api/        REST API endpoints
│   │   │   ├── auth/       Login + Register pages
│   │   │   ├── recipes/    Recipe pages
│   │   │   ├── categories/ Category pages
│   │   │   ├── dashboard/  User dashboard
│   │   │   ├── profile/    User profile
│   │   │   ├── admin/      Admin panel
│   │   │   └── about/      About page
│   │   ├── components/     Reusable UI components
│   │   ├── db/             Drizzle schema + db client
│   │   ├── lib/            Auth utilities, helpers
│   │   └── middleware.ts   Route protection
│   └── drizzle/            DB migration files
├── mobile/                 Expo React Native app
│   ├── app/
│   │   ├── (tabs)/         Tab screens (Home, Search, Favorites, Profile)
│   │   ├── recipe/[id].tsx Recipe detail screen
│   │   ├── login.tsx       Login screen
│   │   └── register.tsx    Register screen
│   └── lib/                API client + auth helpers
├── AGENTS.md               AI agent instructions
└── README.md               This file
```

## Local Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- A Neon PostgreSQL database (free tier at neon.tech)
- Expo Go app on your phone (for mobile)

### 1. Clone and install
```bash
git clone <repo-url>
cd <project-dir>

cd web && npm install
cd ../mobile && npm install
```

### 2. Configure environment
```bash
cp web/.env.example web/.env.local
```
Edit `web/.env.local`:
```
DATABASE_URL=<your-neon-connection-string>
JWT_SECRET=<random-32-char-string>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialize database
```bash
cd web
npm run db:generate   # Generate migrations
npm run db:migrate    # Run migrations
```

### 4. Seed database
Start the web server, then POST to seed:
```bash
cd web && npm run dev
# In another terminal:
curl -X POST http://localhost:3000/api/seed
```

### 5. Run apps
```bash
# Web app (terminal 1)
cd web && npm run dev

# Mobile app (terminal 2)
cd mobile && npm start
```

## Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@recipevault.com | demo123 |
| User | user1@recipevault.com | demo123 |

## Features

### Web App (10+ screens)
- **Home** — Hero, featured categories, popular recipes
- **Recipes** — Search, filter by category/difficulty, paginated list
- **Recipe Detail** — Full recipe with ingredients, instructions, reviews
- **Add/Edit Recipe** — Recipe form for authenticated users
- **Categories** — Browse by cuisine type
- **Category Detail** — Recipes filtered by category
- **Dashboard** — Personal recipe list, stats, favorites
- **Favorites** — Saved recipes
- **Profile** — Edit name, bio, avatar
- **Admin Dashboard** — Platform stats overview
- **Admin Users** — Search, promote/demote, delete users
- **Admin Recipes** — Moderate, publish/hide recipes
- **About** — Platform info

### Mobile App (7 screens)
- **Home** — Popular recipes feed, categories horizontal scroll
- **Search** — Full-text search with infinite scroll
- **Favorites** — Saved recipes (auth required)
- **Profile** — Auth state, stats, logout
- **Recipe Detail** — Full recipe with review list
- **Login** — Email/password login
- **Register** — Account creation

## Deployment

### Web (Netlify / Vercel)
1. Push to GitHub
2. Connect repo to Netlify/Vercel
3. Set environment variables (DATABASE_URL, JWT_SECRET)
4. Deploy

### Mobile (Expo)
```bash
cd mobile
npx expo build:web   # Web export
```
Or build APK with Expo EAS.
