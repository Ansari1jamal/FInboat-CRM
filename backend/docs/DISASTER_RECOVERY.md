# FinBoat Disaster Recovery Runbook

This runbook restores the application after a VPS or host failure. Keep encrypted database and document backups outside the failed server.

## Recovery targets

Define these values with the business before production launch:

- **RTO:** maximum acceptable time to restore service.
- **RPO:** maximum acceptable amount of data loss, based on backup frequency.

## Recovery procedure

1. Provision a new Ubuntu VPS and restrict the firewall to SSH, HTTP, and HTTPS.
2. Install Docker, Docker Compose, Nginx, and Certbot.
3. Create the deployment user and clone the repository into `/var/www/finboat`.
4. Restore the private `/var/www/finboat/.env.production` file.
5. Restore the latest PostgreSQL backup to a temporary database or the new PostgreSQL service.
6. Restore document/object-storage data separately; database metadata alone does not restore uploaded files.
7. Start the production services:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

8. Apply and verify migrations:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml exec api npx prisma migrate deploy
docker compose --env-file .env.production -f docker-compose.prod.yml exec api npx prisma migrate status
```

9. Restore Nginx, DNS, and TLS configuration from [the deployment runbook](../DEPLOYMENT.md), then verify the certificate renewal dry run.
10. Verify API liveness/readiness, admin login, lead access, application/loan access, document access, and worker startup.
11. Monitor logs and failed BullMQ jobs closely after cutover.

## Restore test

At least periodically, restore a backup into an isolated PostgreSQL database and verify representative records:

```sh
gunzip -c finboat_backup.sql.gz | docker compose exec -T postgres psql -U finboat -d finboat_test_restore
```

Run checks for users, leads, applications, loan accounts, repayments, notifications, and audit logs. A backup is not considered verified until a restore test succeeds.

## Backup requirements

Run `scripts/backup-db.sh` from cron or a systemd timer. Keep local retention short and upload successful archives to private, encrypted, access-restricted object storage. Test remote uploads and periodically perform a full restore test. Database backups do not include documents stored outside PostgreSQL.
