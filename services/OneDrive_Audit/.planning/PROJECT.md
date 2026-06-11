# Project Context

## What This Is
OneDrive Audit & Export Tool is an enterprise-grade web application ensuring Microsoft 365 users can easily audit, classify, and export their OneDrive files into Excel via Microsoft Graph API. It focuses on detecting duplicates, large files, and ensuring data governance.

## Success Criteria
- User OneDrive connect kare | OAuth success rate > 95%
- Files fetch ho jayen | < 10 sec for up to 1,000 files
- Excel export kaam kare | Export under 5 sec, all columns populated
- Designation save ho | Persist across sessions (MySQL)
- Dashboard load time | < 2 sec (FCP)

## Constraints & Assumptions
- Constraints: Microsoft Graph API limits (10,000 requests/10 min).
- Assumptions: OneDrive structure focuses on standard user/business accounts initially. OAuth requires Azure Entra ID mapping.

## Requirements

### Validated
(None yet — ship to validate)

### Active
- [ ] Microsoft OAuth 2.0 login (MSAL / NextAuth)
- [ ] OneDrive file listing (flat + recursive)
- [ ] File dashboard with search & filter
- [ ] Designation system (Low / Medium / High / Critical)
- [ ] Export to Excel (ExcelJS)
- [ ] MySQL persistence for user data & designations
- [ ] Storage quota display
- [ ] Large file & duplicate file detection (basic)

### Out of Scope
- [Sensitive data scanning] — Delayed to Phase 2+
- [SharePoint integration] — Delayed to Phase 2+
- [Multi-user / Team collaboration] — Delayed to Phase 2+
- [CSV / PDF export] — Delayed to Phase 2+

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router | Modern frontend SSR/API handling | Pending |
| MySQL w/ Prisma | Relational mapping for files/users | Pending |
| ExcelJS | Streaming bulk file data efficiently | Pending |
| Microsoft Graph API | Native OneDrive connectivity | Pending |

## Evolution
This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-05-31 after initialization*
