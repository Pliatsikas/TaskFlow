# TaskFlow 🗂️

A full-stack task management SaaS built with Next.js, Node.js, PostgreSQL, and Socket.io.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express, TypeScript, Socket.io |
| Database | PostgreSQL (Prisma ORM) |
| Cache / Sessions | Redis |
| DevOps | Docker Compose, GitHub Actions |

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop

### 1. Clone & install dependencies
```bash
git clone <repo-url>
cd taskflow
npm install
```

### 2. Start the database services
```bash
docker compose up -d
# Starts: PostgreSQL on :5432, Redis on :6379, pgAdmin on :5050
```

### 3. Configure environment
```bash
cp apps/server/.env.example apps/server/.env
# Edit .env if needed (defaults work with docker-compose)
```

### 4. Run database migrations + seed
```bash
cd apps/server
npm run db:migrate    # Creates tables
npm run db:seed       # Adds demo user + sample data
```

### 5. Start development servers
```bash
cd ../..  # back to root
npm run dev
# Server: http://localhost:4000
# Client: http://localhost:3000
```

### Demo account
Email: `demo@taskflow.dev`
Password: `demo1234`

## Project Structure

```
taskflow/
├── apps/
│   ├── server/          # Express API
│   │   ├── prisma/      # Database schema & migrations
│   │   └── src/
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── routes/
│   │       ├── middleware/
│   │       └── lib/     # prisma, redis, jwt, socket
│   └── client/          # Next.js app
├── packages/
│   └── shared/          # Shared TypeScript types
└── docker-compose.yml
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Create account |
| POST | /api/auth/login | — | Login |
| POST | /api/auth/refresh | cookie | Refresh access token |
| POST | /api/auth/logout | ✅ | Logout |
| GET | /api/auth/me | ✅ | Current user |
| GET | /api/workspaces | ✅ | List workspaces |
| POST | /api/workspaces | ✅ | Create workspace |
| GET | /api/boards/:id | ✅ | Get board with columns & tasks |
| POST | /api/tasks | ✅ | Create task |
| PATCH | /api/tasks/:id | ✅ | Update task |
| PATCH | /api/tasks/:id/move | ✅ | Move task (drag & drop) |

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `board:join` | client→server | Join a board room |
| `TASK_CREATED` | server→client | Broadcast new task |
| `TASK_MOVED` | server→client | Broadcast task move |
| `TASK_UPDATED` | server→client | Broadcast task update |
