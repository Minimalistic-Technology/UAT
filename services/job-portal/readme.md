# Job Portal

Welcome to the Minimalistic-Learning Job Portal! This project is a full-stack web application designed to connect employers and job seekers seamlessly.

The repository consists of a modern frontend built with Next.js & React Query, and a robust backend powered by Node.js & GraphQL.

## Project Structure

This project follows a feature-driven architectural pattern on the frontend and an MVC-style pattern on the backend. Here is an overview of the key directories and their contents.

### 📁 Root Directory

```text
.
├── backend/            # Node.js + Express + GraphQL Backend Service
├── frontend/           # Next.js + React Query Frontend Application
├── docker-compose.yml  # Docker setup for local development/deployment
└── readme.md           # Project documentation (this file)
```

### 🎨 Frontend (`/frontend`)

The frontend leverages a modular structure where each feature is self-contained. It strictly separates concerns between UI, services, data hooks, skeletons, and error boundaries.

```text
frontend/
├── app/                        # Next.js App Router definitions
│   ├── (auth)/                 # Authentication routes (Login, Signup)
│   ├── (public-routes)/        # Public-facing pages (Landing page, Find-Jobs, etc.)
│   ├── admin-dashboard/        # Admin views and sub-routes
│   ├── employer-dashboard/     # Employer-specific views and sub-routes
│   └── user-dashboard/         # Job-seeker views and sub-routes
├── components/                 # Global, reusable UI components (Shadcn UI, Navbars)
├── constants/                  # Global application constants
├── errors/                     # Domain-specific error boundary components
│   ├── admin/                  # Admin dashboard error states
│   └── employer/               # Employer dashboard error states
├── features/                   # Core business logic and components, grouped by domain
│   ├── admin/                  # Admin feature logic & config
│   ├── auth/                   # Authentication & verification features
│   ├── companies/              # Global company-related logic
│   ├── employer/               # Employer feature logic (hooks, services, UI components)
│   ├── landing/                # Landing page specific features
│   └── user/                   # Job seeker specific features
├── hooks/                      # Global React hooks
├── lib/                        # Library configurations (Axios, NextAuth, Utilities)
├── services/                   # Global API fetching services
├── skeletons/                  # Reusable loading skeletons
│   ├── admin/                  # Admin dashboard loading states
│   └── employer/               # Employer dashboard loading states
├── tests/                      # Frontend testing suites
├── types/                      # TypeScript global type definitions & enums
├── utils/                      # Global utility functions
└── validations/                # Form validation schemas (Zod/Yup)
```

### ⚙️ Backend (`/backend`)

The backend serves an Express + GraphQL API that connects to our database and handles complex query projections.

```text
backend/
├── src/
│   ├── config/           # Environment and DB configuration
│   ├── constants/        # Backend-specific constants
│   ├── controllers/      # REST API handlers
│   ├── graphql/          # GraphQL schemas, queries, and resolvers
│   ├── middleware/       # Express middlewares (Auth, Error handling)
│   ├── models/           # Mongoose Database schemas
│   ├── routes/           # REST endpoint definitions
│   ├── scripts/          # Helper scripts (Database seeding, migrations)
│   ├── services/         # Core backend business logic
│   ├── types/            # TypeScript backend type definitions
│   ├── utils/            # Helper functions
│   └── validations/      # Request validation schemas
├── tests/                # Backend unit and integration tests
└── Dockerfile            # Docker configuration for backend service
```

## Setup & Running Locally

1. **Install Dependencies:**
   Navigate into both `backend/` and `frontend/` folders and run `npm install`.

2. **Environment Variables:**
   Ensure `.env` files are configured in both `backend/` and `frontend/` appropriately.

3. **Start the Applications:**
   - For backend: `npm run dev` in the `backend/` directory.
   - For frontend: `npm run dev` in the `frontend/` directory.
   - Alternatively, use Docker: `docker-compose up` at the project root.

## Code Quality (Husky & Prettier)

This project strictly enforces code quality through automated Git hooks using **Husky** and code formatting using **Prettier**.

> **Note**: Currently, Husky and Prettier are configured and active **only for the `frontend/` directory**.

- **Prettier**: Pre-configured to ensure a consistent, clean code style across the frontend.
  - To manually format your files, navigate to the `frontend/` directory and run:
    ```bash
    npm run format
    ```
  - To just check formatting without writing changes, run:
    ```bash
    npm run format:check
    ```
- **Husky**: Before you commit (`pre-commit`), Husky automatically triggers Prettier (and other linters) to format and validate your staged files. This guarantees that unformatted or broken code never makes it into the repository.
