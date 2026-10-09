# FinBoat CRM handover

## Deployment status

This repository includes deployment configuration and runbooks, but the production deployment has **not** been performed or verified by this change. Production domains, hosting access, DNS, TLS, database credentials, and business UAT approval must be supplied and verified by the deployment owner.

## Application components

- Frontend: React 19 and Vite
- API: Node.js and Express
- Database: PostgreSQL with Prisma migrations
- Queue and worker: Redis and BullMQ
- Reverse proxy/TLS: Nginx and Certbot (host setup)

## Production URL placeholders

Replace with the approved production hostnames before launch:

- Frontend: `https://finboat.com`
- API: `https://api.finboat.com`
- API health: `/api/health/live` and `/api/health/ready`
- API documentation: `/api-docs` (restrict or disable if it should not be public)

## Roles

- `ADMIN`
- `MANAGER`
- `TL`
- `TELECALLER`

API authorization and record-level data scoping must be validated on the backend. Frontend route guards are user experience controls, not a security boundary.

## Product areas

Authentication, dashboard, leads, calls, follow-ups, documents, applications, loans, EMI, repayments, collections, reports, global search, notifications, and lead timeline are present in the application. Confirm actual role permissions, integration availability, and workflows against the UAT checklist; do not infer production readiness from a successful frontend build.

## Initial administrator

Use the dedicated production-safe seed command documented in [the deployment runbook](../backend/DEPLOYMENT.md). The development/demo Prisma seed is blocked in production. Keep admin credentials in a secret manager or protected deployment environment; never store them in handover documents.

## Operations and ownership

Before launch, record the accountable owner and escalation contact for each:

| Responsibility | Owner/contact |
| --- | --- |
| Application deployment | To be assigned |
| Database, backups, and restore tests | To be assigned |
| DNS, Nginx, and TLS renewal | To be assigned |
| User and role administration | To be assigned |
| Business UAT approval | To be assigned |

Use [the deployment runbook](../backend/DEPLOYMENT.md) for releases and [the disaster recovery runbook](../backend/docs/DISASTER_RECOVERY.md) for recovery. Keep encrypted database backups and document storage backups off-host, and test restores periodically.

See [security monitoring and incident response](./SECURITY-MONITORING.md) for structured log events and operator-owned alerting setup. No external monitoring destination is configured by the application.
