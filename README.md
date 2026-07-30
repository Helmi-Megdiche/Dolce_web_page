# Dolce.tn — Crêperie Website

Dynamic website for **Dolce** crêperie (Ariana, Tunisia), built with Next.js 14, MongoDB, and Tailwind CSS.

## Features

- **Public pages:** Home, Menu, Reservation, About/Contact
- **Admin dashboard:** manage menu, opening hours, reservations, and site settings
- **Auth:** JWT in HTTP-only cookie + bcrypt passwords
- All content loaded from MongoDB (no static content)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Fonts | Playfair Display + Inter |
| Hosting | Vercel |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
MONGODB_URI=mongodb://localhost:27017/dolce_db
JWT_SECRET=your_super_secret_key_change_this
ADMIN_EMAIL=admin@dolce.tn
ADMIN_PASSWORD=admin123
```

For production (MongoDB Atlas), use your remote connection string.

### 3. Seed the database

```bash
npm run seed
```

This creates the admin user, default opening hours, site settings, and sample menu items.

### 4. Run locally

```bash
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin/login

Default credentials: `admin@dolce.tn` / `admin123`

## Deploy on Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set environment variables: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
4. Deploy
5. Run the seed script once against your production DB (locally with the Atlas URI)

## Project structure

```
app/
  (public)/          # Home, Menu, Reservation, About
  admin/             # Login + Dashboard
  api/               # REST API routes
components/          # UI + admin tabs
lib/                 # MongoDB, auth, data helpers
models/              # Mongoose schemas
scripts/seed.ts      # DB seed
```
