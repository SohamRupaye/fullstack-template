# Fullstack Monorepo Template

A **production-ready** full-stack monorepo using **pnpm workspaces**, **tRPC**, **Prisma**, **React + Vite**, and **Tailwind CSS v4**.

## Stack

| Layer          | Tech                                         |
| -------------- | -------------------------------------------- |
| API            | [tRPC](https://trpc.io) + Express            |
| Database       | PostgreSQL + [Prisma](https://www.prisma.io) |
| Frontend       | React 19 + Vite + Tailwind CSS v4            |
| Monorepo       | pnpm workspaces                              |
| Build          | tsup (server) + Vite (web)                   |
| Env management | [dotenvx](https://dotenvx.com)               |

## Project Structure

```
fullstack-template/
├── packages/
│   ├── prisma/         # Prisma schema + generated client (package: "database")
│   ├── server/         # Express + tRPC backend
│   │   ├── src/
│   │   │   ├── common/
│   │   │   │   ├── trpc.ts            ← tRPC init, context, publicProcedure, protectedProcedure
│   │   │   │   ├── config/            ← JWT config, RSA options
│   │   │   │   ├── const/             ← Error codes
│   │   │   │   ├── middleware/        ← Logging + Prisma error handling
│   │   │   │   └── runtime-variable/  ← RSA key pair parsing
│   │   │   ├── router/
│   │   │   │   ├── router.ts          ← Main tRPC router (AppRouter lives here)
│   │   │   │   └── auth.router.ts     ← Auth routes (replace stub with real logic)
│   │   │   └── utils/
│   │   │       ├── jwt.util.ts        ← signJWT / verifyJWT
│   │   │       ├── log.util.ts        ← JSONL file logging
│   │   │       └── prisma.util.ts     ← Prisma error → tRPC error mapping
│   │   ├── .env.dev    ← Development environment variables
│   │   └── .env.prod   ← Production environment variables
│   ├── shared/         # Shared utilities (superjson transformer, etc.)
│   └── web/            # React frontend
│       └── src/
│           └── lib/
│               ├── trpc.ts        ← tRPC React client (typed against AppRouter)
│               └── query-client.ts ← Singleton React Query client
├── Docker/
│   └── development/    # docker-compose for local Postgres + pgAdmin
└── pnpm-workspace.yaml
```

## Quick Start

### 1. Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (`npm i -g pnpm`)
- Docker (for local Postgres)

### 2. Start the database

```bash
cd Docker/development
docker compose up -d
```

This starts Postgres on **port 5433** (to avoid conflicts with a local install).

### 3. Install dependencies

```bash
pnpm install
```

### 4. Configure environment

Edit `packages/server/.env.dev`. The database URL is pre-configured for the Docker setup.

If you want JWT auth (Strategy 1), generate an RSA key pair:

```bash
node -e "
  const crypto = require('crypto');
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding:  { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  });
  const pair = { privateKey: privateKey.replace(/\n/g,'\\\\n'), publicKey: publicKey.replace(/\n/g,'\\\\n') };
  console.log('RSA_PAIR=' + JSON.stringify(JSON.stringify(pair)));
"
```

Paste the output into `.env.dev`.

### 5. Push schema & generate Prisma client

```bash
pnpm db:push
pnpm db:generate
```

### 6. Run in development

```bash
# Terminal 1 — backend (port 4000)
pnpm server:local

# Terminal 2 — frontend (port 5173, proxied to backend)
pnpm web
```

The Vite dev server proxies `/api` → `http://localhost:4000`, so no CORS config is needed.

---

## Auth Strategy

The server supports three auth patterns. Pick one and implement it in `packages/server/src/common/trpc.ts`:

### Strategy 1 — Self-contained JWT (default scaffolding)

- Generate an RSA key pair (see step 4 above)
- Use `signJWT()` in your login mutation
- The `Authorization: Bearer <token>` header is automatically verified in `createContext`

### Strategy 2 — Shared RSA microservice

- Your standalone auth service signs JWTs with its private key
- Store **only the public key** in `RSA_PAIR` — no code changes needed
- `verifyJWT()` handles verification

### Strategy 3 — Clerk / NextAuth / third-party

- Remove the `if (token && RUNTIME_VARIABLES.RSA_PAIR)` block in `createContext`
- Replace with your provider's token verification call
- Remove `RSA_PAIR` from `.env.dev`

---

## Scripts

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `pnpm server:local` | Start backend in dev mode (hot reload)        |
| `pnpm web`          | Start frontend in dev mode                    |
| `pnpm build`        | Build all packages                            |
| `pnpm db:push`      | Push Prisma schema to database                |
| `pnpm db:generate`  | Regenerate Prisma client after schema changes |
| `pnpm db:seed`      | Run database seed script                      |
