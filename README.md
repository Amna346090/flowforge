# FlowForge

FlowForge is a multi-tenant workflow automation platform that allows teams to define, run, and manage AI-powered workflows with secure execution pipelines, role-based access control, and async job processing.

---

##  Overview

FlowForge enables teams to build and execute workflows where each workflow can trigger AI operations, background jobs, or integrations. It is designed as a scalable backend-first system with strict workspace isolation and secure API access.

Each workspace operates independently with its own members, permissions, workflows, and execution history.

---

##  Core Features

- Multi-tenant workspace system
- Role-based access control (OWNER, ADMIN, MEMBER)
- Workflow creation and management
- Async workflow execution using job queues
- Workflow run tracking and logs
- Secure API key authentication per workspace
- Scalable service-layer architecture

---

##  Architecture

- **Frontend:** Next.js (App Router)
- **Backend:** Next.js API Routes + Service Layer
- **Database:** PostgreSQL (via Prisma ORM)
- **Queue System:** BullMQ + Redis
- **Auth:** Workspace-based RBAC system
- **Architecture Pattern:** Service-oriented backend with strict separation of concerns

---

##  Tech Stack

- Next.js 14+
- TypeScript
- Prisma ORM
- PostgreSQL
- BullMQ
- Redis
- Zod (validation)
- Tailwind CSS

---

##  Project Structure

- `/app` → Frontend + API routes
- `/services` → Business logic layer
- `/queue` → Async job processing
- `/prisma` → Database schema
- `.cursor/rules` → System architecture + AI constraints

---

##  Security Model

- Every resource is scoped to a workspace
- Users can belong to multiple workspaces
- Permissions are enforced via RBAC (role-based access control)
- API keys are hashed and tied to workspaces
- No cross-workspace data access is allowed

---

##  Getting Started

### 1. Install dependencies

```bash
npm install