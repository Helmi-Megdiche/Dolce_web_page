# Pre-deploy security checklist

Complete before pointing DNS / announcing the live site.

## Secrets & env

- [ ] `JWT_SECRET` is long, random, and **not** the README example
- [ ] `ADMIN_PASSWORD` changed after seed (or seed skipped; account created manually)
- [ ] `.env.local` / Vercel env never committed to git
- [ ] `APP_URL` is the production HTTPS domain (used in emails & reset links)
- [ ] Gmail uses an **App Password**, not the account password
- [ ] UltraMsg tokens restricted to this project only

## Auth & admin

- [ ] `/api/reservations` GET returns 401 without cookie
- [ ] `/api/admin/*` mutating routes require login
- [ ] Uploadthing route rejects unauthenticated uploads
- [ ] Forgot-password does not reveal whether an email exists (generic success)
- [ ] Reset tokens expire (1 hour) and cannot be reused after success

## Input / abuse

- [ ] Reservation phone must be **exactly 8 digits** (API + UI)
- [ ] Guests limited to 1–20
- [ ] Feedback message min length enforced
- [ ] Offer IDs on reservation resolved server-side (not trusted titles alone)

## Data & privacy

- [ ] Production MongoDB Atlas network access limited (IP / Vercel)
- [ ] Admin emails do not expose other customers’ data publicly
- [ ] WhatsApp admin number is the business phone you control

## Headers / host (Vercel)

- [ ] Site served over HTTPS only
- [ ] Preview deployments not used as “production” with real credentials
