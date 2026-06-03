# Roadmap

## Phase 1: Foundation & Project Setup
**Goal:** Initialize applications, configure databases, and setup basic UI structures.
**Status:** Completed
**Plans:**
- [x] Initial Next.js + Tailwind + Node.js scaffold
- [x] Configure Prisma Schema and Docker Compose
- [ ] Setup shadcn/ui components in frontend
- [ ] Create basic backend server health routes

## Phase 2: Authentication & Database
**Goal:** Complete Microsoft OAuth flow.
**Status:** Completed
**Plans:**
- [x] Integrate MSAL / Passport for Microsoft OAuth.
- [x] Setup JWT Middleware for Backend.
- [x] Connect and migrate Prisma MySQL database.

## Phase 3: Graph API Integration
**Goal:** Connect OneDrive and fetch user files.
**Status:** Completed
**Plans:**
- [x] Setup Graph API Service in Backend.
- [x] Pagination & Fetch APIs for frontend.
- [x] Sync OneDrive Dashboard Button integration.

## Phase 4: Designation & Dashboard Features
**Goal:** Enable classification of files and detect duplicates/large ones.
**Status:** Completed
**Plans:**
- [x] Add Inline Editable Designations.
- [x] Bulk update feature for files.
- [x] Duplicate and large file calculation algorithms.

## Phase 5: Excel Export
**Goal:** Add functional Export to Excel button.
**Status:** Completed
**Plans:**
- [x] Create ExcelJS service.
- [x] Generate standard and grouped worksheets.

## Phase 6: Polish & SaaS Prep
**Goal:** Finalize application logic, handling edge cases.
**Status:** Completed
**Plans:**
- [x] Implement refresh token auto-renewal.
- [x] Add rate limiting and error toast messages.
