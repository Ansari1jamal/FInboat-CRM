# Production deployment

This repository deploys the API, PostgreSQL, Redis, and BullMQ worker with Docker Compose. Nginx runs on the host: one site serves the Vite frontend, and another proxies the API. Production has not been deployed by this repository change; supply the real domains, server, and secrets before following this runbook.

## 1. Prepare the host and DNS

Use a supported Linux VPS with Docker Engine, Docker Compose v2, Nginx, and Certbot. Permit inbound SSH, HTTP, and HTTPS only. Configure DNS records for the frontend (`finboat.com` and `www.finboat.com`) and API (`api.finboat.com`) to resolve to the host.

Clone the repository into `/var/www/finboat`. Do not copy developer `.env` files or upload credentials to source control.

## 2. Configure backend secrets

From the backend directory, create a private production environment file:

```sh
cd /var/www/finboat/backend
cp .env.production.example .env.production
chmod 600 .env.production
openssl rand -hex 64
```

Edit `.env.production` with unique values. Set strong independent `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `JWT_SECRET`, `CSRF_SECRET`, and `SEED_ADMIN_PASSWORD` values; do not use example placeholders. `SEED_ADMIN_PASSWORD` must be at least 16 characters and include uppercase, lowercase, a number, and a symbol. Set the real administrator email and the frontend origin. Ensure `DATABASE_URL` matches the PostgreSQL user, password, and database in this file; URL-encode reserved characters in the database password.

Keep the environment file readable only by the deployment account. Do not paste secrets into chat, issue trackers, build logs, or Git.

## 3. Start backend dependencies and apply migrations

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml exec api npx prisma migrate deploy
docker compose --env-file .env.production -f docker-compose.prod.yml exec api npx prisma migrate status
```

The API is bound to `127.0.0.1:5000`. PostgreSQL and Redis are private to the Compose network; do not publish ports `5432` or `6379`. The API and worker share a persistent storage volume for uploaded documents and generated files.

## 4. Create the initial admin safely

The regular Prisma seed is for development/demo data and deliberately refuses to run when `NODE_ENV=production`. It creates demo users and a demo team; do not run `prisma db seed` in production.

Create only the configured administrator:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml exec api npm run seed:admin
```

This command is idempotent: an existing active admin is left unchanged; it fails rather than changing a non-admin or reactivating an inactive account. It never prints the password. Remove access to the seed credentials after initial login and rotate the admin password through the approved account-management process.

Verify successful login over HTTPS. Never place the initial password in this document or in a shell command saved to history.

## 5. Build and publish the frontend

On a trusted build host, from `frontend/`:

```sh
cp .env.production.example .env.production
```

Set `VITE_API_URL` to the real API base URL ending in `/api`, then build and publish only `dist/` to `/var/www/finboat/frontend/dist`:

```sh
npm ci
npm run build
```

Vite embeds `VITE_API_URL` at build time. Rebuild after changing it. `.env.production` is ignored by Git; only the example file should be committed.

## 6. Configure Nginx and HTTPS

Install the site configurations:

```sh
sudo cp deploy/nginx/finboat-api.conf /etc/nginx/sites-available/finboat-api
sudo cp deploy/nginx/finboat-web.conf /etc/nginx/sites-available/finboat-web
sudo ln -s /etc/nginx/sites-available/finboat-api /etc/nginx/sites-enabled/finboat-api
sudo ln -s /etc/nginx/sites-available/finboat-web /etc/nginx/sites-enabled/finboat-web
sudo nginx -t
sudo systemctl reload nginx
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.finboat.com
sudo certbot --nginx -d finboat.com -d www.finboat.com
sudo certbot renew --dry-run
```

Update `server_name` and the frontend document root in the Nginx configs if the actual hostnames or install directory differ. Confirm TLS is valid and HTTP redirects to HTTPS before UAT.

## 7. Smoke checks

```sh
curl --fail https://api.finboat.com/api/health/live
curl --fail https://api.finboat.com/api/health/ready
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 api
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 worker
```

`/api/health/ready` must report the database and Redis as up. Then perform the manual role-based and business-flow checks in [the UAT checklist](../docs/UAT-CHECKLIST.md). Swagger is available at `/api-docs`; restrict it at the proxy or disable it for production if public API documentation is not intended.

## 8. Updates

Take and verify a backup before deploying:

```sh
git pull --ff-only
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml exec api npx prisma migrate deploy
docker compose --env-file .env.production -f docker-compose.prod.yml exec api npx prisma migrate status
```

Rebuild and republish the frontend when frontend source or its production API URL changes. Review service health and logs after every release.

## 9. Backups and recovery

Use [the backup script](scripts/backup-db.sh) with encrypted off-host storage and retention configured for the business. The script's local gzip output is not an off-host backup. Back up uploaded documents from the persistent storage volume separately. Periodically restore both the database and documents into an isolated environment and verify representative records before considering a backup recoverable. See [the disaster recovery runbook](docs/DISASTER_RECOVERY.md).
