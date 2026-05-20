# DDTEC - Premium Full-Stack E-Commerce Platform

DDTEC ek state-of-the-art **Industrial Tools & Equipments E-Commerce Platform** hai, jise modern standard architecture ke sath build kiya gaya hai. Yeh platform users ko high-quality tools browse karne, select karne, purchase karne aur digital bills/invoices instantly collect karne ki functionality deta hai.

---

## 🏗️ Architecture & Tech Stack

DDTEC ko ek decoupled structure (Frontend aur Backend separate) me develop kiya gaya hai jo highly scalable aur performant hai:

### 1. Frontend (Client-Side)
- **Framework**: [Next.js](https://nextjs.org/) (React 19, Next.js 16+) with App Router support.
- **Styling**: [TailwindCSS](https://tailwindcss.com/) & [PostCSS](https://postcss.org/) for beautiful, responsive and modern dark-themed glassmorphism interface.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth transitions and hover micro-animations.
- **Icons**: [Lucide React](https://lucide.dev/) for premium and modern vector icon designs.
- **API Client**: [Axios](https://axios-http.com/) configured with global interceptors for request/response handling, loading timeout, and cross-site secure credentials (`withCredentials: true`).

### 2. Backend (Server-Side)
- **Runtime & Language**: [Node.js](https://nodejs.org/) & [TypeScript](https://www.typescriptlang.org/) for strong compilation types and zero developer errors.
- **Web Framework**: [Express.js](https://expressjs.com/) with TypeScript definitions.
- **Database**: [MongoDB](https://www.mongodb.com/) powered by [Mongoose ODM](https://mongoosejs.com/) for structured schemas, relationships, and queries.
- **Security & Session**: Cookie-based sessions using [JSON Web Tokens (JWT)](https://jwt.io/) and `cookie-parser`.
- **Encryption**: [bcryptjs](https://www.npmjs.com/package/bcryptjs) for secure password hashing.
- **Communication (Emails)**: [Nodemailer](https://nodemailer.com/) + [SendGrid API](https://sendgrid.com/) fallback system for sending verification codes and order PDFs.
- **Document Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) for real-time beautiful invoice PDF generation.

---

## 🌟 Key Features Implemented

### 🔒 1. Unified Authentication with Secure OTP Loop
- Naye users email ya phone enter karke signup proceed karte hain.
- Backend, [SendGrid API] ya fallback system se instant **6-digit Verification OTP** send karta hai.
- OTP verification complete hone ke bad password setup and extra signup details screen open hoti hai.
- Login session secure httpOnly standard HTTP-cookie par base hai, jo unauthorized token access (XSS) se project ko robust banata hai.

### 🛍️ 2. Dynamic Premium Product Catalog & Shop
- Beautiful responsive filters (Categories: Wood Cutters, Grinding Tools, Fasteners, Safety Gear).
- Dynamic searching (instant character index search) and custom sort (price high-to-low, low-to-high, rating, sales).
- Product detailed pages with real-time dynamic ratings and reviews.
- Dynamic cart drawer overlay with custom [Framer Motion] slides.

### 🧾 3. Checkout, Cart & Auto-Emailing Invoices
- Multiple items adding with live tax (GST 18%) calculation.
- Order place hone par instant server-side memory buffer me custom **jsPDF Invoice PDF** generate hota hai.
- Generated PDF automatically user ke mail address par attach hokar **Order Confirmation Email** ke roop me send ho jata hai.

### ⚙️ 4. Global System Administration (Admin Panel)
- **Role-Based Access Control (RBAC)**: Admins have complete granular permission levels (`users` -> view, add, edit, delete; `products` -> edit, etc.).
- Admin panel dynamic controllers for:
  - Activating/deactivating user accounts directly with immediate toggle effect.
  - Adding/adjusting user credit balance (credit wallets).
  - Editing company and user granular permissions.
  - Toggling dynamic page modules (Hero, ShopSection, WhoWeAre) via database-linked [Settings] model to implement instant maintenance mode.

---

## 📂 Project Structure Details

```
ddtec/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection config
│   │   ├── controllers/     # Controller logic (Auth, Product, Orders, Bill)
│   │   ├── middleware/      # Auth, Permissions, CORS, Cookie parsers
│   │   ├── models/          # Mongoose Schemas (User, Product, Category, OTP, Settings, Bill)
│   │   ├── routes/          # Express API route mapping
│   │   ├── services/        # SendGrid Email OTP & jsPDF auto-generation services
│   │   ├── app.ts           # Express App initialization & env injector
│   │   └── server.ts        # Server entry point (starts listening on Port 5000)
│   ├── scripts/             # Admin resets, role verifiers, & seed scripts
│   ├── .env                 # Server environmental configurations
│   └── tsconfig.json        # TypeScript configuration options
│
├── frontend/
│   ├── app/                 # Next.js App Router (Layouts, Shop, Login, Checkout)
│   │   ├── _components/     # Modular client UI components (Navbar, Hero, Footer)
│   │   ├── _context/        # React Context providers (AuthContext, CartContext, ToastContext)
│   │   └── globals.css      # Core Tailwind CSS tokens and layout styles
│   ├── lib/                 # Core API Axios client setup
│   ├── public/              # Static vector illustrations and client images
│   ├── .env.local           # Next.js local environment endpoints
│   └── package.json         # Client side third party libraries
```

---

## ⚡ Current Local Setup & Health Status

1. **Database**: Local MongoDB (`mongodb://localhost:27017/ddtec`) connected successfully and running fine.
2. **Backend**: Express Service successfully initialized, running in development watch mode (`nodemon`) on **`http://localhost:5000`**.
3. **Frontend**: Next.js Dev Server successfully running on **`http://localhost:3000`**.
4. **Data Seeding**: Seeding is 100% complete! Database is loaded with:
   - **Admin Account**: `admin@ddtec.com` (password: `adminpassword123`).
   - **Active Categories**: Wood Cutters, Grinding Tools, Fasteners, Safety Gear.
   - **Premium Sample Tools**: High Impact Safety Helmet, Professional Angle Grinder, Titanium Screws, and Heavy Duty Circular Saw are successfully seeded with real-world price values, reviews, ratings, and gorgeous illustration visual representations!
