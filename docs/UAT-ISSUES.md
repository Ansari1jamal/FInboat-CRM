# FinBoat CRM — UAT issues and release gates

This register separates verified findings from checks that still require the deployed UAT/production environment. No client UAT results were supplied, so no business issue is represented as user-reported or closed.

## Verified findings

### Critical

| ID | Module | Issue | Status |
| --- | --- | --- | --- |
| — | — | No verified critical issue recorded by the local checks below. | — |

### High

| ID | Module | Issue | Status |
| --- | --- | --- | --- |
| SEC-HIGH-001 | User registration | Public registration accepted a caller-supplied role, including `ADMIN`. Registration now requires authenticated `ADMIN` access and validates roles against the database enum. Automated test confirms unauthenticated requests return 401; verify non-admin 403 and admin user creation during UAT. | RETEST |
| SEC-HIGH-002 | Lead authorization | `GET /api/leads?assignedToId=...` could overwrite the telecaller's own assignment scope. The service now rejects another user's ID and rejects unknown roles; focused tests cover both behaviors. Verify all four roles directly against the deployed API. | RETEST |

### Medium

| ID | Module | Issue | Status |
| --- | --- | --- | --- |
| API-MED-001 | Background exports | The export worker imported `exportLeads` and `createLeadExcel` from the import service, where neither is exported. The worker now imports the export service and has a processing test. | RETEST |
| FIN-MED-001 | EMI and repayment | EMI/repayment business arithmetic used JavaScript `Number`. Schedule and payment balance calculations now use Prisma Decimal with cent rounding; repayment updates use a conditional balance check to reject concurrent stale writes. Unit tests cover EMI rounding, partial/full payment, and stale balance rejection. | RETEST |
| API-MED-002 | Financial reports | Non-admin report queries used relation names (`lead`, `loanAccount`) that do not exist in the Prisma schema (`leads`, `loan_accounts`), which causes Prisma query-validation errors and HTTP 500s. Report scopes now use the schema relation names; scope regression tests pass. Restart the API and verify the four report endpoints with each non-admin role in UAT. | RETEST |

### Low

| ID | Module | Issue | Status |
| --- | --- | --- | --- |
| QA-LOW-001 | Frontend quality | Full Oxlint run exits successfully but reports 23 React warnings, primarily effect state updates and missing hook dependencies, across existing pages. Review and remove these warnings in a separate scoped cleanup. | OPEN |
| UI-LOW-001 | Frontend coverage | There are no frontend pages/routes for user listing, teams, targets, master data, or audit logs, although backend APIs exist. Add and verify these screens before marking the corresponding UI/UAT checklist items complete. | OPEN |

Allowed statuses: `OPEN`, `IN_PROGRESS`, `FIXED`, `RETEST`, `CLOSED`.

## Local automated verification (2026-10-06)

| Check | Result | Notes |
| --- | --- | --- |
| Backend tests | PASS | 11 suites, 30 tests, including registration authorization, lead scope, financial report scopes, export worker, Decimal repayment checks, and `--detectOpenHandles`; no lingering handle detected. |
| Prisma schema | PASS | `npx prisma validate` succeeds. |
| Prisma migrations | BLOCKED | `npx prisma migrate status` found one unapplied migration (`20260920191121_add_lead_status_history_note`) in the configured local database. It was not applied. |
| Financial report services by role | PASS | Summary, repayment, EMI, and collection services all executed successfully against the configured local database for each role (ADMIN, MANAGER, TL, TELECALLER). Restart the API and recheck the HTTP endpoints in the browser. |
| Frontend production build | PASS | Vite emits the existing large-chunk-size warning. |
| Frontend lint | PASS WITH WARNINGS | 23 React warnings; tracked as `QA-LOW-001`. |
| Production Compose config | PASS | Parsed using the example environment only; this does not start services or validate real secrets. |
| Demo seed production guard | PASS | Production-mode execution refuses to seed demo accounts. |
| Initial-admin seed validation | PASS | Unit tests cover strong-password validation; no real database/admin was created. |

## Required before production release

The following cannot be confirmed by local checks and remain release gates:

- [ ] Configure real production secrets and hostnames in protected deployment environments.
- [ ] Deploy API, worker, database, Redis, Nginx, TLS, and frontend to the approved host.
- [ ] Apply production migrations and verify database/Redis readiness.
- [ ] Create and verify the initial admin in the production database.
- [ ] Run direct API authorization and role-scope tests for all four roles.
- [ ] Apply and verify pending database migrations in the intended environment.
- [ ] Complete missing management/audit frontend screens or explicitly defer them from release scope.
- [ ] Complete the business workflow and responsive checks in [UAT-CHECKLIST.md](./UAT-CHECKLIST.md).
- [ ] Take off-host database and document backups and perform a restore test.
- [ ] Obtain client/business sign-off.
- [ ] Run final release tests on the exact release candidate; do not tag or publish until approved.

Record newly reproduced issues above with evidence, priority, owner, and status. Keep production credentials, tokens, and customer data out of this register.

## Step 82–83 local verification (2026-10-09)

These are local checks only; they do not replace execution of the target-host UAT checklist.

| Check | Result | Evidence / notes |
| --- | --- | --- |
| Backend automated tests | PASS WITH WARNING | 11 suites, 30 tests passed. Standard Jest run still prints an open-handle warning; a separate `--detectOpenHandles` run reported no open handle. |
| Prisma schema | PASS | `npx prisma validate` succeeds. |
| Prisma migrations | BLOCKED | The configured local database still reports `20260920191121_add_lead_status_history_note` unapplied. No migration was applied or reset. |
| Frontend production build | PASS WITH WARNING | `npm run build` succeeds; Vite reports a JavaScript chunk larger than 500 kB. |
| Frontend API URL in this build | FAIL FOR PRODUCTION | The local frontend `.env` points to `http://localhost:5000`, and that value is embedded in the generated `dist` bundle. Build with the approved production API URL before publishing. |
| Production frontend URL template | TEMPLATE ONLY | `.env.production.example` contains a production hostname example; no target-specific production environment file or deployment was verified. |
| Local backend health | NOT AVAILABLE | No listener responded on port 5000 at `/health`, `/api/health`, `/api/health/live`, or `/api/health/ready`. |
| Docker Compose services | NOT AVAILABLE | Docker daemon was unavailable; no service status or logs were collected. |
| Production dependency audit | FAIL / RELEASE GATE | After updating `proxy-addr` to 2.0.8, `npm audit --omit=dev` still reports 12 vulnerabilities (7 high, 5 moderate), including `xlsx` advisories with no fix reported by npm. |
| Manual authentication, role permissions, CRM workflows, responsive UI, and business UAT | NOT TESTED | No deployed target environment or test accounts were available. All corresponding boxes remain unchecked in [UAT-CHECKLIST.md](./UAT-CHECKLIST.md). |
| Backups, restore, initial admin, HTTPS, and production readiness | NOT VERIFIED | No production host, database, backup artifact, or restore environment was accessed. |

### Release decision

**NOT YET VERIFIED — do not sign off for production.** The production frontend
build must use a production API URL, the local migration is pending, the
production dependency audit has unresolved high-severity findings, and target
environment health, role authorization, backup/restore, HTTPS, and UAT have
not been verified. The API Nginx configuration also remains HTTP-only until a
valid HTTPS listener/redirect is configured and tested on the deployment host.

## Step 86 observability review (2026-10-09)

| Check | Result | Evidence / notes |
| --- | --- | --- |
| Existing logger and request ID | PASS | Winston logger, request-ID middleware, request logger, and centralized error handler already exist; no duplicate middleware was added. |
| Sensitive request logging | FIXED / TESTED | Request and 404 logs now use the path without query strings. Login/auth 401 and authorization 403 request events are structured warnings; 5xx events are errors. Unsafe inbound request IDs are replaced with a generated ID. |
| Production exception logging | FIXED / TESTED | Production error logs omit raw message and stack; readiness responses expose dependency status without internal error text. Test setup no longer prints the test account email. |
| Environment template | FIXED / REVIEWED | Backend `.env.example` now uses placeholders and non-real demo addresses/password placeholders instead of credential-looking sample values. Actual `.env` contents were not read or disclosed. |
| Backend regression tests | PASS | `npm test -- --detectOpenHandles`: 12 suites, 34 tests passed; no open-handle report. Includes request ID, query-string log redaction, and production readiness/error detail tests. |
| Prisma schema | PASS | `npx prisma validate` succeeds. |
| Production dependency audit | FAIL / RELEASE GATE | `npm audit --omit=dev` reports 12 findings (7 high, 5 moderate). |
| Alert rules and incident guidance | DOCUMENTED, NOT ACTIVE | See [SECURITY-MONITORING.md](./SECURITY-MONITORING.md). It describes recommended signals and example thresholds. No provider, receiver, destination, or delivery drill is configured or verified. |

This observability review does not change the prior release decision:
production health, live role access, backups/restores, HTTPS, monitoring
delivery, and business UAT remain unverified.
