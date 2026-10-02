# MoneyApp

Sign in with Google, sync your Gmail for transaction/payment emails, browse
them, and export to Excel.

## Setup

1. `cp .env.example .env.local` and fill in:
   - `MONGODB_URI` — a MongoDB connection string (Atlas or local).
   - `AUTH_SECRET` — generate with `npx auth secret`.
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — from Google Cloud Console:
     1. Create/select a project, enable the **Gmail API**.
     2. Configure the OAuth consent screen and add scope
        `https://www.googleapis.com/auth/gmail.readonly`.
     3. Create an OAuth Client ID (Web application) with authorized redirect
        URI `http://localhost:3000/api/auth/callback/google`.

2. `npm install`
3. `npm run dev`

## How it works

- **Auth**: `src/auth.ts` — NextAuth (Google provider) requests Gmail
  readonly scope at consent. On first sign-in the refresh token is saved to
  the `User` document in MongoDB (`src/models/User.ts`) so we can sync Gmail
  later without prompting again.
- **Sync**: `POST /api/transactions/sync` exchanges the stored refresh token
  for an access token (`src/lib/googleToken.ts`), searches Gmail with a
  keyword query tuned for bank/payment alerts (`src/lib/gmail.ts`), and runs
  a local regex-based classifier (`src/lib/transactionParser.ts`) to extract
  amount, currency, debit/credit, merchant, and last-4 account digits.
  Parsed results are upserted into the `Transaction` collection.
- **Dashboard**: `/dashboard` lists synced transactions and offers a
  "Sync from Gmail" button and a "Download Excel" button
  (`GET /api/transactions/export`, built with `exceljs`).

## Not included yet

Swipe-to-categorize gestures were scoped out of this first version — only
listing transactions and Excel export are implemented.
