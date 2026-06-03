# Project Requirements

## Core Problem
Organizations lack a centralized tool to audit, classify, and export OneDrive file structures.

## Target Users
IT Admins, Compliance Officers, Small Business Owners.

## Requirements

### Must Have (MVP)
- [ ] M1: Microsoft OAuth 2.0 login integration.
- [ ] M2: Fetch user's OneDrive files using Microsoft Graph API (flat + recursive).
- [ ] M3: File dashboard displaying all files with search and filters.
- [ ] M4: Update file designation (Unclassified, Low, Medium, High, Critical) and persist to MySQL.
- [ ] M5: Basic duplicate and large file detection (>50MB).
- [ ] M6: Export files list to Excel format with multiple sheets using ExcelJS.

### Should Have (Fast Follow)
- [ ] S1: Interactive charts (Recharts) for file statistics.
- [ ] S2: Delta sync / incremental file sync from Graph API.

### Won't Have (Out of Scope for MVP)
- [ ] W1: Sensitive data scanning (e.g., PAN, Aadhaar).
- [ ] W2: SharePoint drive integration.
- [ ] W3: Team/multi-user collaboration portal.

## Acceptance Criteria
- Auth: Users are prompted to log into Microsoft and grant Graph API permissions.
- Fetch: 1000 files fetch in <10 seconds.
- Storage: Valid Token & User Data saved encryptedly to MySQL database.
- Export: 5+ columns accurately represent file data in Excel.
