# Learning API Microservice

Learning-focused microservice for the MinAI platform. It exposes REST endpoints to manage lessons, sell access using MinAI points, and issue API keys for trusted internal clients.

## Stack

- **Runtime**: Node.js 20+, TypeScript
- **Framework**: Fastify (CORS, Helmet, Sensible plugins)
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: JWT verification (shared with main app) + hashed API keys
- **HTTP Client**: `undici` for calling the MinAI points API

## Getting Started

```bash
cp .env.example .env
npm install
npm run dev
```

The service listens on `PORT` (default `4100`).

## Important Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` or `JWT_PUBLIC_KEY` | Secret (HS256) or PEM public key (RS256/ES256) used to verify auth tokens |
| `POINTS_API_BASE_URL` | Base URL (including locale + `/api`, e.g. `https://app/en/api`) for point deductions |
| `POINTS_SERVICE_API_KEY` | Service-to-service token (must match MinAI `LEARNING_SERVICE_API_KEY`) |

## Database & Migrations

```bash
npm run db:generate   # generates SQL from Drizzle schema
npm run db:push       # pushes schema to the configured database
```

Generated files are written to `./drizzle`.

## Testing

```bash
npm test            # single run
npm run test:watch  # watch mode
```

Tests rely on Fastify's in-memory injector and do not require a real database connection.

## Docker

The repository includes a multi-stage `Dockerfile` and a development-oriented `docker-compose.yml` (Postgres + API). Adjust volumes and secrets before production use.
