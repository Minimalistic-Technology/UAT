# Lynktree

A Linktree clone: users sign up with email + password, verify via OTP, claim a
unique username, then manage a public page of links and PDFs at
`https://<domain>/u/<username>`.

## Stack

- **Backend**: Node.js, TypeScript, Express, MongoDB (Mongoose), Zod
  validation, JWT access/refresh tokens, Cloudinary uploads, Brevo (prod) /
  Nodemailer Ethereal sandbox (dev) for OTP email.
- **Frontend**: Next.js (App Router, TypeScript), Tailwind CSS, Axios (with a
  refresh-token interceptor), Zod validation.
- Package manager: **pnpm** in both `backend/` and `frontend/`.

## Getting started

### Backend

```bash
cd backend
pnpm install
cp .env.example .env   # fill in MONGO_URI, JWT secrets, Cloudinary, Brevo
pnpm dev                # http://localhost:5010, runs src/index.ts directly via tsx

# Production:
pnpm build              # tsc -> dist/
pnpm start              # node dist/index.js
```

In development, OTP emails are sent through a Nodemailer Ethereal sandbox
account — no real email is delivered. Watch the server console for a
"Preview URL" link to read the code.

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL should point at the backend
pnpm dev                      # http://localhost:3000
```

## Auth flow

1. `POST /api/auth/signup` — creates an unverified user, sends a 6-digit OTP.
2. `POST /api/auth/verify-otp` — verifies the account and issues an access
   token (returned in the JSON body) plus a refresh token (httpOnly cookie,
   scoped to `/api/auth`).
3. `POST /api/users/username` — one-time username claim.
4. `POST /api/auth/refresh` — rotates the refresh token and mints a new
   access token; the frontend's Axios instance calls this automatically on a
   401.
5. `POST /api/auth/logout` — revokes the current refresh token.

## Public profile

`GET /api/public/:username` returns the profile and active links for anyone,
no auth required — this powers the Next.js `/u/[username]` page.
