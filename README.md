# Dolce.tn — Crêperie Website

Dynamic website for **Dolce** crêperie (Ariana, Tunisia), built with Next.js 14, MongoDB, and Tailwind CSS.

## Features

### Public site
- **Home, Menu, Reservation, About (Find us), Feedback** — content from MongoDB
- **Special offers** — responsive grid with featured (highlighted) cards; CTA deep-links to reservation with the offer attached
- **French / English** — `next-intl` with locale routes (`/fr/...`, `/en/...`)
- **Light / dark theme** — `next-themes` with a Dolce warm palette
- **Reservation** — 8-digit Tunisian phone validation, optional email, guest stepper, offer banner, admin email + WhatsApp alerts
- **Feedback** — anonymous by default; optional contact; 8-digit phone when provided
- **Find us / Footer** — Call, WhatsApp (`wa.me`), Directions, map, hours (today highlighted), social links
- Brand logo, Playfair Display + Inter typography

### Admin dashboard (`/[locale]/admin/dashboard?tab=...`)
- **Login** with JWT in an HTTP-only cookie + bcrypt passwords
- **Forgot / reset password** — choose **Email** or **WhatsApp** for the reset link
- **Menu** — CRUD; auto display order; **Uploadthing** cloud images
- **Offers** — dates, discount badge presets, highlight, CTA text (destination always Reservation + offer)
- **Hours** — per-day schedule; copy Monday → weekdays / apply to all
- **Reservations** — list, status updates, offer badge when attached
- **Feedback** — view; mark resolved / dismiss
- **Settings** — hero, contact, Instagram / TikTok / Facebook / **WhatsApp** / Glovo
- **Profile** — change password; create / remove other admins
- Password visibility toggles; active tab kept in the URL

### Notifications (Email + WhatsApp)
On new **reservation** or **reclamation**, admins receive:
- **Email** (nodemailer / Gmail) to `ADMIN_EMAIL` **and** `EMAIL_USER` (fallback so alerts are never lost)
- **WhatsApp** (UltraMsg) to `WHATSAPP_ADMIN_NUMBER`

Offer reservations include a clear **offer block** in email and WhatsApp. Password reset can also use WhatsApp.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| i18n | next-intl (FR / EN) |
| Theme | next-themes |
| Email | nodemailer (Gmail App Password) |
| WhatsApp | UltraMsg API |
| Image uploads | Uploadthing (cloud) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Fonts | Playfair Display + Inter |
| Tests | Vitest (`testing/`) |
| Hosting | Vercel (recommended) |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
MONGODB_URI=mongodb://localhost:27017/dolce_db
JWT_SECRET=your_super_secret_key_change_this
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me_after_seed

# Used in emails / reset & admin deep links
APP_URL=http://localhost:3000

# Gmail SMTP — no spaces around =
# Use a Google App Password (not your normal Gmail password):
# https://myaccount.google.com/apppasswords
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_SERVICE=gmail
EMAIL_FROM=Dolce <your@gmail.com>

# Uploadthing — https://uploadthing.com/dashboard
UPLOADTHING_TOKEN=your_uploadthing_token

# UltraMsg WhatsApp — https://ultramsg.com/
# WHATSAPP_ADMIN_NUMBER = country code + number, no + (e.g. 216XXXXXXXX)
ULTRA_MSG_INSTANCE_ID=
ULTRA_MSG_API_TOKEN=
ULTRA_MSG_BASE_URL=
WHATSAPP_ADMIN_NUMBER=
```

For production (MongoDB Atlas), use your remote URI and set `APP_URL` to the live domain. Use a strong unique `JWT_SECRET`.

### 3. Seed the database

```bash
npm run seed
```

Creates the admin user, default opening hours, site settings (including WhatsApp URL), and sample menu items.

### 4. Run locally

```bash
npm run dev
```

- Site (FR): http://localhost:3000/fr  
- Site (EN): http://localhost:3000/en  
- Admin login: http://localhost:3000/fr/admin/login  
- Feedback: http://localhost:3000/fr/reclamation  
- Find us: http://localhost:3000/fr/about  

Default credentials (after seed): `admin@dolce.tn` / `admin123` — **change in production**.

## Testing (pre-deploy)

```bash
npm test              # unit + security + scalability (Vitest)
npm run test:watch    # watch mode
```

See [`testing/README.md`](testing/README.md) for the full suite layout, API smoke tests, and the UX / security deploy checklist.

## Admin overview

| Tab | What you can do |
|-----|-----------------|
| Menu | Manage items, categories, prices, availability; upload images |
| Offers | Promotions with dates, badges, highlight; guests go to Reservation + offer |
| Hours | Weekly opening hours |
| Reservations | Bookings, status, attached offers |
| Feedback | Reclamations; resolve / dismiss |
| Settings | Site content, socials, WhatsApp URL |
| Profile | Password; admin accounts |

## API routes (main)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/logout` | Logout |
| GET/PUT | `/api/admin/profile` | Current admin / change password |
| GET/POST/DELETE | `/api/admin/accounts` | List / create / delete admins |
| POST | `/api/auth/forgot-password` | Reset link via email or WhatsApp |
| POST | `/api/auth/reset-password` | Reset with token |
| GET/POST | `/api/menu` | List / create menu items |
| PUT/DELETE | `/api/menu/[id]` | Update / delete item |
| GET/POST | `/api/uploadthing` | Uploadthing images (admin JWT) |
| GET | `/api/offers` | Public active offers (in date range) |
| GET/POST | `/api/admin/offers` | Admin list / create offers |
| PUT/DELETE | `/api/admin/offers/[id]` | Update / delete offer |
| GET/PUT | `/api/hours` | Opening hours |
| GET/POST | `/api/reservations` | Public create (+ notify, offer) / admin list |
| PUT/DELETE | `/api/reservations/[id]` | Update status / delete |
| POST | `/api/reclamations` | Public feedback (+ notify) |
| GET | `/api/admin/reclamations` | Admin list feedback |
| PUT | `/api/admin/reclamations/[id]` | Update feedback status |
| GET/PUT | `/api/settings` | Site settings |

## Project structure

```
app/
  [locale]/
    (public)/           # Home (+ offers), Menu, Reservation, Feedback, About
    admin/              # Login, forgot/reset password, dashboard
  api/                  # REST API
components/
  admin/                # Dashboard tabs
  public/               # OffersCarousel, …
  ui/                   # Logo, ThemeToggle, ImageUploadField, …
lib/                    # MongoDB, auth, validation, email, whatsapp, …
messages/               # en.json, fr.json
models/                 # Mongoose schemas
testing/                # Vitest suites + deploy checklists
scripts/seed.ts
i18n/
```

## Deploy on Vercel

This project is ready for [Vercel](https://vercel.com). Framework preset: **Next.js**.

### 1. Prepare

```bash
npm test
npm run build
```

Both should succeed locally before you push.

### 2. Push to GitHub

Commit and push `main` (this repo). Do **not** commit `.env.local`.

### 3. Create the Vercel project

1. [vercel.com/new](https://vercel.com/new) → import this GitHub repo  
2. Framework: **Next.js** (auto-detected)  
3. Root directory: `.` (default)  
4. Build command: `npm run build` · Output: default  

### 4. Environment variables (Project → Settings → Environment Variables)

Add every key from `.env.example` for **Production** (and Preview if you want):

| Variable | Notes |
|----------|--------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random secret (not the example value) |
| `ADMIN_EMAIL` | Inbox that receives reservation/feedback alerts |
| `ADMIN_PASSWORD` | Only used by seed; change admin password after seed |
| `APP_URL` | Your live URL, e.g. `https://your-app.vercel.app` (no trailing slash) |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail + App Password |
| `EMAIL_SERVICE` | `gmail` |
| `EMAIL_FROM` | e.g. `Dolce <your@gmail.com>` |
| `UPLOADTHING_TOKEN` | Required for menu/offer images on Vercel |
| `ULTRA_MSG_*` / `WHATSAPP_ADMIN_NUMBER` | WhatsApp alerts |

Redeploy after saving env vars.

### 5. Seed production data (once)

From your machine, pointing at Atlas:

```bash
# temporarily set MONGODB_URI to Atlas in the shell, then:
npm run seed
```

Then log into `/fr/admin/login` and change the admin password.

### 6. Post-deploy checks

- Open `/fr` and `/en` — home, menu, offers, reservation, feedback, about  
- Submit a test reservation — confirm **email** + **WhatsApp**  
- Walk through [`testing/ux/pre-deploy-checklist.md`](testing/ux/pre-deploy-checklist.md)  
- Optional API smoke: `DOLCE_TEST_URL=https://your-domain npm run test:api`  

Images use **Uploadthing** (not Vercel’s filesystem), so uploads survive serverless deploys.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build (same as Vercel) |
| `npm run start` | Production server (local) |
| `npm run lint` | ESLint |
| `npm test` | Automated tests (Vitest) |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:api` | Live API smoke (`DOLCE_TEST_URL` optional) |
| `npm run seed` | Seed MongoDB |

## License

This project is licensed under the [MIT License](LICENSE).
