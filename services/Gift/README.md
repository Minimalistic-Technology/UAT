# Smart Product Sharing Platform

A modern B2B SaaS platform for sharing curated product collections securely.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, Framer Motion, Zustand, React Hook Form, Axios
- **Backend**: Node.js, Express, TypeScript, Mongoose, Multer, JWT
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary

## Features
- **Admin Dashboard**: Secure JWT-protected portal.
- **Product Management**: Full CRUD capabilities and Cloudinary multiple image uploads.
- **Share Link Generation**: Bundle specific products, set limits or passwords, and generate tokens.
- **Analytics Tracking**: Log IP, browser, and total views of shared links.
- **Client Facing UI**: A sleek, dark/glassmorphic view that only shows selected products securely.

## Environment Variables Setup

### Backend (`/backend/.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-product-sharing
CLIENT_URL=http://localhost:3000
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`/frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Running Locally

1. **Database Setup**
   Ensure MongoDB is running locally or provide a MongoDB Atlas URI in `backend/.env`.

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run build  # ensure tsc is available
   npm start      # or run `npx ts-node src/server.ts` for dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

## Deployment Guide

### Backend (Render/Railway)
1. Add environment variables to Render portal.
2. Build command: `npm install && npx tsc`
3. Start command: `node dist/server.js`

### Frontend (Vercel)
1. Import repository to Vercel.
2. Root directory: `frontend`
3. Add `NEXT_PUBLIC_API_URL` pointing to backend live URL.
4. Framework preset: Next.js.

## Security Features Included
- JWT Authentication & HttpOnly ready approach.
- Route Protection (Middleware + Higher Order Checks).
- Helmet & CORS in Express.
- Express Rate Limiting.
