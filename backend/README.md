# FinBoat CRM backend

Express API and BullMQ worker for FinBoat CRM.

## Requirements

- Node.js 22
- PostgreSQL
- Redis

## Local setup

From this directory:

```powershell
npm ci
Copy-Item .env.example .env
```

Set local PostgreSQL, Redis, JWT, CSRF, and frontend-origin values in `.env`.
Never copy production credentials into a local environment.

For local development with Docker Desktop, start an unauthenticated Redis
instance bound only to loopback:

```powershell
docker run --detach --name finboat-local-redis --restart unless-stopped --publish 127.0.0.1:6379:6379 redis:7-alpine
```

This matches the default local Redis settings. Do not use this configuration
for production.

Validate the Prisma schema and inspect migrations:

```powershell
npx prisma validate
npx prisma migrate status
```

Apply migrations only to the intended development database:

```powershell
npx prisma migrate dev
```

Run the API and worker in separate terminals:

```powershell
npm run dev
npm run worker
```

The API listens on port `5000` by default. Health endpoints are
`/api/health`, `/api/health/live`, and `/api/health/ready`.

## Tests

Configure a disposable test database and Redis instance. Put test-only
`TEST_USER_EMAIL` and `TEST_USER_PASSWORD` values in `.env.test`, or provide
them through the test process environment. Tests never require production
credentials.

```powershell
npm test
npx jest --runInBand --detectOpenHandles
```

## API and deployment

- OpenAPI: [`src/docs/swagger.yaml`](./src/docs/swagger.yaml)
- Swagger UI while the API is running: `/api-docs`
- Production deployment: [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- Database/document recovery: [`docs/DISASTER_RECOVERY.md`](./docs/DISASTER_RECOVERY.md)

Production secrets belong only in a protected environment or secret manager.
Do not commit `.env`, `.env.test`, tokens, or customer data.
