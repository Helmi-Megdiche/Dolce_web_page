# Dolce.tn — Crêperie Website

Dynamic website for **Dolce** crêperie (Ariana, Tunisia), built with Next.js 14, MongoDB, and Tailwind CSS.

## Features

### Public site
- **Home, Menu, Reservation, About, Feedback (Réclamation)** — content from MongoDB
- **French / English** — `next-intl` with locale routes (`/fr/...`, `/en/...`)
- **Light / dark theme** — `next-themes` with a Dolce warm palette
- **Reservation form** — phone digits-only, custom email validation, time slots
- **Reclamation / feedback form** — anonymous by default; optional contact details
- Brand logo, expressive typography (Playfair Display + Inter)

### Admin dashboard (`/[locale]/admin/dashboard?tab=...`)
- **Login** with JWT in an HTTP-only cookie + bcrypt passwords
- **Forgot / reset password** — choose **Email** or **WhatsApp** for the reset link
- **Menu** — create, edit, delete; auto display order; **Uploadthing** cloud image upload
- **Hours** — per-day schedule, open/closed toggles, copy Monday → weekdays / apply to all
- **Reservations** — list and update status
- **Feedback (Réclamations)** — view messages; mark resolved / dismiss
- **Settings** — hero text, contact, social links
- **Profile** — change password; create / remove other admin accounts
- Password **visibility toggles** on every password field
- Active tab kept in the URL so language/theme changes stay on the same section

### Notifications (Email + WhatsApp)
On new **reservation** or **reclamation**, the admin receives:
- an **email** (nodemailer / Gmail) to `ADMIN_EMAIL`
- a **WhatsApp** message (UltraMsg) to `WHATSAPP_ADMIN_NUMBER`

Password reset can also be delivered by WhatsApp using the same UltraMsg setup.

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
- Feedback: http://localhost:3000/fr/reclamation  

Default credentials (after seed): `admin@dolce.tn` / `admin123`

## Admin overview

| Tab | What you can do |
|-----|-----------------|
| Menu | Manage items, categories, prices, availability; upload images (Uploadthing) |
| Hours | Edit weekly opening hours |
| Reservations | View bookings and change status |
| Feedback | View reclamations; mark resolved / dismiss |
| Settings | Edit public site content & social links |
| Profile | Change password; add/remove admin accounts |

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
| GET/POST | `/api/uploadthing` | Uploadthing menu images (admin JWT) |
| GET/PUT | `/api/hours` | Opening hours |
| GET/POST | `/api/reservations` | Public create (+ notify) / admin list |
| PUT/DELETE | `/api/reservations/[id]` | Update status / delete |
| POST | `/api/reclamations` | Public feedback submit (+ notify) |
| GET | `/api/admin/reclamations` | Admin list feedback |
| PUT | `/api/admin/reclamations/[id]` | Update feedback status |
| GET/PUT | `/api/settings` | Site settings |

## Project structure

```
app/
  [locale]/
    (public)/           # Home, Menu, Reservation, Reclamation, About
    admin/              # Login, forgot/reset password, dashboard
  api/                  # REST API routes (incl. uploadthing, reclamations)
  providers.tsx         # Theme provider
components/
  admin/                # Dashboard tabs (Menu, Hours, Reclamations, …)
  ui/                   # Logo, LanguageSwitcher, ThemeToggle,
                        # PasswordInput, ImageUploadField, …
lib/                    # MongoDB, auth, validation, email, whatsapp, uploadthing
messages/               # en.json, fr.json
models/                 # Mongoose schemas (incl. Reclamation)
public/images/          # Brand assets
scripts/seed.ts         # DB seed
i18n/                   # next-intl routing & request config
```

## Deploy on Vercel

1. Push this repo to GitHub  
2. Import the project in [Vercel](https://vercel.com)  
3. Set all variables from `.env.example` (`MONGODB_URI`, `JWT_SECRET`, `APP_URL`, email, `UPLOADTHING_TOKEN`, UltraMsg, etc.)  
4. Deploy  
5. Run the seed script once against your production DB (locally with the Atlas URI)  

Menu images use Uploadthing (not the local filesystem), so they work on Vercel’s ephemeral disk.

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
