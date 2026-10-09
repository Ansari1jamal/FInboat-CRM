#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/finboat}"
COMPOSE_FILE="${COMPOSE_FILE:-$APP_DIR/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env.production}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/finboat}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DATE="$(date +"%Y-%m-%d_%H-%M-%S")"
BACKUP_FILE="$BACKUP_DIR/finboat_$DATE.sql.gz"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Environment file not found: $ENV_FILE" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Starting PostgreSQL backup..."
docker compose \
  --env-file "$ENV_FILE" \
  -f "$COMPOSE_FILE" \
  exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  | gzip > "$BACKUP_FILE"

if [[ ! -s "$BACKUP_FILE" ]]; then
  rm -f "$BACKUP_FILE"
  echo "Backup failed or produced an empty file" >&2
  exit 1
fi

find "$BACKUP_DIR" \
  -type f \
  -name "*.sql.gz" \
  -mtime "+$RETENTION_DAYS" \
  -delete

echo "Backup successful: $BACKUP_FILE"
