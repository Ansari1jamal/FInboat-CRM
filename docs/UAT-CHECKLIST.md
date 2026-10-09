# FinBoat CRM UAT checklist

Record the environment, build/release identifier, tester, date, result, and evidence for each test. Do not mark a check complete without running it in the target environment.

## Environment readiness

- [ ] Production DNS resolves to the approved host.
- [ ] Frontend and API load over valid HTTPS; HTTP redirects to HTTPS.
- [ ] `/api/health/live` succeeds.
- [ ] `/api/health/ready` reports database and Redis up.
- [ ] API, worker, database, Redis, and frontend logs have no unexplained startup failures.
- [ ] A pre-launch database backup exists, is stored off-host, and has a documented restore test.
- [ ] Uploaded document storage has a separate backup and restore procedure.

## Authentication and authorization

- [ ] Admin login, invalid password handling, and logout.
- [ ] Expired/invalid access token redirects to login and clears local authentication.
- [ ] Role tests performed for `ADMIN`, `MANAGER`, `TL`, and `TELECALLER`.
- [ ] Direct unauthorized frontend route shows 403 where a role route is configured.
- [ ] API authorization tested directly, not only through hidden UI controls.
- [ ] Admin sees permitted global scope; manager, TL, and telecaller queries return only their authorized scope.
- [ ] A telecaller cannot read another telecaller's lead or timeline (expected 403/not found per endpoint policy).
- [ ] Users and roles are provisioned only through the approved admin process.

## Leads, calls, and follow-ups

- [ ] Create a lead and verify required-field validation.
- [ ] Duplicate mobile handling is correct.
- [ ] Edit lead, assign/reassign, and update status.
- [ ] Search, filters, pagination, and CSV/Excel exports work with current filters.
- [ ] Create calls for connected, not connected, busy, and wrong-number outcomes with remarks.
- [ ] Create, update, complete, and review missed/due follow-ups and reminders.
- [ ] Lead details and unified timeline show expected activity in newest-first order.

## Documents and lending workflow

- [ ] Upload and view a document; verify file access permissions.
- [ ] Verify/reject documents and record rejection reason.
- [ ] Create and update an application through submit/login/approve/reject/disburse.
- [ ] Confirm loan account and LAN values are correct after disbursement.
- [ ] Generate EMI schedule and verify outstanding amount.
- [ ] Record partial and full repayments; verify paid/outstanding amounts and overdue behavior.
- [ ] Review collection list, details, and update flow.

## Reporting and notifications

- [ ] Dashboard totals and role-scoped telecaller performance are reasonable.
- [ ] Financial/conversion reports and supported exports match expected records.
- [ ] Notification bell opens notifications and displays unread count.
- [ ] Mark one notification read and mark all read; unread count updates.
- [ ] Notification action links open the intended record.

## Responsive and accessibility checks

- [ ] Test widths 375, 390, 768, 1024, and 1440 px.
- [ ] Navbar, mobile sidebar, cards, forms, dialogs, filters, and pagination remain usable.
- [ ] Wide tables scroll inside their container without page-level horizontal overflow.
- [ ] Icon-only controls have accessible names; interactive controls work with keyboard.
- [ ] Browser console and network contain no unexplained errors, failed API requests, CORS, or mixed-content failures.

## Sign-off

| Role | Name | Date | Decision/notes |
| --- | --- | --- | --- |
| Business owner |  |  |  |
| Admin/security reviewer |  |  |  |
| Deployment operator |  |  |  |
