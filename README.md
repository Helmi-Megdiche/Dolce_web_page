# Dolce.tn — Crêperie Website

Dynamic website for **Dolce** crêperie (Ariana, Tunisia), built with Next.js 14, MongoDB, and Tailwind CSS.

## Features

### Public site
- **Home, Menu, Reservation, About** — all content loaded from MongoDB
- **French / English** — `next-intl` with locale routes (`/fr/...`, `/en/...`)
- **Light / dark theme** — `next-themes` with a Dolce warm palette
- **Reservation form** — phone digits-only, custom email validation, time slots (no native browser tooltips)
- Brand logo, expressive typography (Playfair Display + Inter)

### Admin dashboard (`/[locale]/admin/...`)
- **Login** with JWT in an HTTP-only cookie + bcrypt passwords
- **Forgot / reset password** via Gmail SMTP (nodemailer)
- **Menu** — create, edit, delete items; auto display order; image upload from device (or paste URL)
- **Hours** — per-day schedule with 15‑min selects, open/closed toggles, copy Monday → weekdays / apply to all
- **Reservations** — list and update status
- **Settings** — hero text, contact, social links
- **Profile** — change own password; create / remove other admin accounts
- Password **visibility toggles** on every password field
- Active tab kept in the URL (`?tab=...`) so language/theme changes stay on the same section
- Admin UI tuned for dark-mode contrast

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| i18n | next-intl (FR / EN) |
| Theme | next-themes |
| Email | nodemailer (Gmail App Password) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Fonts | Playfair Display + Inter |
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
ADMIN_EMAIL=admin@dolce.tn
ADMIN_PASSWORD=admin123

# Used in password-reset emails
APP_URL=http://localhost:3000

# Gmail SMTP — no spaces around =
# Use a Google App Password (not your normal Gmail password):
# https://myaccount.google.com/apppasswords
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_SERVICE=gmail
EMAIL_FROM=Dolce <your@gmail.com>
```

For production (MongoDB Atlas), use your remote connection string and set `APP_URL` to the live domain.

### 3. Seed the database

```bash
npm run seed
```

Creates the admin user, default opening hours, site settings, and sample menu items.

### 4. Run locally

```bash
npm run dev
```

- Site (FR): http://localhost:3000/fr  
- Site (EN): http://localhost:3000/en  
- Admin login: http://localhost:3000/fr/admin/login  

Default credentials (after seed): `admin@dolce.tn` / `admin123`

## Admin overview

| Tab | What you can do |
|-----|-----------------|
| Menu | Manage items, categories, prices, availability; upload images |
| Hours | Edit weekly opening hours |
| Reservations | View bookings and change status |
| Settings | Edit public site content & social links |
| Profile | Change password; add/remove admin accounts |

Uploaded menu images are stored under `public/uploads/menu/` and served as `/uploads/menu/...`.

## API routes (main)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/logout` | Logout |
| GET/PUT | `/api/admin/profile` | Current admin / change password |
| GET/POST/DELETE | `/api/admin/accounts` | List / create / delete admins |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset with token |
| GET/POST | `/api/menu` | List / create menu items |
| PUT/DELETE | `/api/menu/[id]` | Update / delete item |
| POST | `/api/upload` | Upload menu image (auth required) |
| GET/PUT | `/api/hours` | Opening hours |
| GET/POST | `/api/reservations` | Public create + admin list |
| PUT/DELETE | `/api/reservations/[id]` | Update status / delete |
| GET/PUT | `/api/settings` | Site settings |

## Project structure

```
app/
  [locale]/
    (public)/           # Home, Menu, Reservation, About
    admin/              # Login, forgot/reset password, dashboard
  api/                  # REST API routes
  providers.tsx         # Theme provider
components/
  admin/                # Dashboard tabs (Menu, Hours, …)
  ui/                   # Logo, LanguageSwitcher, ThemeToggle,
                        # PasswordInput, ImageUploadField, …
lib/                    # MongoDB, auth, validation, email, tabs helper
messages/               # en.json, fr.json
models/                 # Mongoose schemas
public/
  images/               # Brand assets (e.g. dolce-logo.png)
  uploads/menu/         # Uploaded menu images (gitignored)
scripts/
  seed.ts               # DB seed
i18n/                   # next-intl routing & request config
```

## Deploy on Vercel

1. Push this repo to GitHub  
2. Import the project in [Vercel](https://vercel.com)  
3. Set environment variables from `.env.example` (`MONGODB_URI`, `JWT_SECRET`, `APP_URL`, email vars, etc.)  
4. Deploy  
5. Run the seed script once against your production DB (locally with the Atlas URI)  

**Note:** File uploads write to the local filesystem (`public/uploads`). On Vercel’s ephemeral filesystem this is fine for demos; for production you may want object storage (S3, Cloudinary, etc.).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run seed` | Seed MongoDB with defaults |

## License

This project is licensed under the [MIT License](LICENSE).
