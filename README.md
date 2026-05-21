# FlowForge

Multi-tenant workflow automation platform — teams create workspaces, define workflows, trigger async runs, and track execution history with role-based access control.

## Features

- Auth.js credentials auth (register / login)
- Multi-tenant workspaces with RBAC (OWNER, ADMIN, MEMBER)
- Workflow CRUD and run history
- Async execution via BullMQ + Redis (separate worker process)
- Zod validation on API request bodies
- Service-layer architecture with unit tests

## Tech stack

- Next.js 16 (App Router) + TypeScript
- PostgreSQL + Prisma ORM
- Auth.js v5 (JWT sessions)
- BullMQ + Redis (Upstash)
- Zod, Tailwind CSS, shadcn/ui

## Project structure

```
app/           Next.js pages and API routes
services/      Business logic (RBAC enforced here)
lib/           DB client, queue, validations
worker/        BullMQ worker (run separately from dev server)
prisma/        Schema and migrations
tests/         Vitest unit tests
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. Supabase) |
| `AUTH_SECRET` | Random secret for Auth.js — `openssl rand -base64 32` |
| `REDIS_URL` | Redis connection string (e.g. Upstash) |

### 3. Database

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Run the app

Terminal 1 — Next.js dev server:

```bash
npm run dev
```

Terminal 2 — workflow worker (required for runs to complete):

```bash
npm run worker
```

Open [http://localhost:3000](http://localhost:3000), register an account, create a workspace, add a workflow, and trigger a run.

### 5. Tests

```bash
npm test
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run worker` | Start BullMQ worker |
| `npm test` | Run Vitest unit tests |
| `npm run db:seed` | Seed database (dev) |
| `npm run build` | Production build |

## Security model

- Every resource is scoped to a workspace
- API routes authenticate via session; services enforce membership and role checks
- No cross-workspace data access
