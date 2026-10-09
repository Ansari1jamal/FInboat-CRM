# FinBoat CRM security monitoring and incident response

## Current state

The API writes structured JSON through Winston to stdout/stderr. Each request
has an `X-Request-ID`; request logs include method, path (not query string),
status, duration, request ID, user ID/role when authenticated, and IP address.
HTTP 401/403 responses are warnings and 5xx responses are errors.

No monitoring vendor, alert receiver, or production destination is configured
by this repository. The events and alert conditions below are recommendations,
not active alerts. Do not claim monitoring coverage until an operator connects
the production log stream to an approved destination, provisions access, and
tests delivery.

## Events to collect

- API request events, grouped by `event`, `statusCode`, route/path, and time.
- Authentication failures from login endpoints (401), without request bodies,
  email addresses, passwords, tokens, or cookies.
- Authorization denials (403), with request ID, route, role, and user ID only
  where policy permits.
- API 5xx events and request duration.
- Database and Redis readiness failures.
- BullMQ failed-job counts and repeat failures.
- Backup job result, backup age, and restore-test result.

Do not ingest request/response bodies, authorization headers, cookies, query
strings, connection URLs, document contents, PAN/Aadhaar, or payment secrets.
Keep IP/user identifiers access-controlled and retain them only according to
the organization's approved retention policy.

## Alert rules to tune in staging

Set thresholds against the actual request volume and baseline before enabling
production paging. Suggested starting signals (not production defaults):

- API 5xx rate exceeds 5% over 5 minutes with at least 20 requests.
- API p95 latency exceeds the agreed SLO for 10 minutes.
- Database or Redis readiness remains down for 2 consecutive checks.
- Failed-login rate exceeds the agreed per-account and per-IP baseline over
  10 minutes; do not page for a single 401.
- Queue failed jobs rise continuously or oldest waiting-job age exceeds the
  agreed processing SLO.
- Latest successful encrypted off-host backup is older than the agreed RPO.

Route alerts to the approved on-call channel using a secret-managed webhook or
provider integration. Test with a staging-only event and record delivery,
acknowledgment, escalation, and recovery. Do not put alert credentials in
source control or application logs.

## Incident response

1. Record the alert, timestamp, affected service, and request IDs; preserve
   relevant access-controlled logs.
2. Triage API, database, Redis, worker, and host health without copying
   credentials or customer payloads into tickets or chat.
3. For suspected account compromise, disable/rotate affected credentials using
   the approved procedure and review audit records for the affected time
   window.
4. For data integrity or availability incidents, follow
   [the disaster recovery runbook](../backend/docs/DISASTER_RECOVERY.md).
   Restore only into an isolated recovery environment until approved.
5. Notify the named incident owner and business contact; record impact,
   containment, recovery, and follow-up actions.
6. Close the incident only after service health and representative CRM
   workflows are re-verified.

## Operator-owned release tasks

- Select and configure the log/metrics/alert destination.
- Set access controls, retention, alert ownership, escalation, and maintenance
  coverage.
- Run a staging alert-delivery drill and document evidence.
- Verify database/Redis/queue alerts and backup-age alerts.
- Document service SLOs, escalation contacts, and incident authority in the
  deployment environment.
