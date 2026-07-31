# Pre-deploy UX & functional checklist

Run on production (or staging with production-like env). Prefer both **FR** and **EN**, light and dark.

## Public

- [ ] Home hero loads; CTAs → Menu / Reservation
- [ ] Special offers grid: featured span + regular cards; CTA → `/reservation?offer=…`
- [ ] Reservation with offer shows banner; submit shows success; admin gets email + WhatsApp with offer
- [ ] Reservation without offer still works; phone rejects ≠ 8 digits
- [ ] Menu filters by category; images load; “Book a table” CTA works
- [ ] Feedback: anonymous submit OK; optional phone = 8 digits when filled
- [ ] Find us: Call / WhatsApp / Directions / map / hours (Today) / socials including WhatsApp
- [ ] Footer Follow us includes WhatsApp; phone link works
- [ ] Language switch keeps you on the same page
- [ ] Theme toggle persists across reload

## Admin

- [ ] Login / logout
- [ ] Forgot password Email + WhatsApp paths
- [ ] Menu CRUD + Uploadthing image
- [ ] Offer create/edit/highlight/active dates
- [ ] Hours save
- [ ] Reservations list shows offer badge when present; status updates
- [ ] Feedback resolve / dismiss
- [ ] Settings: WhatsApp URL saves and appears on public site
- [ ] Profile: change password; add/remove admin (if needed)

## Build / ops

- [ ] `npm test` green
- [ ] `npm run build` green
- [ ] `DOLCE_TEST_URL=https://your-domain npm run test:api` green (optional)
- [ ] Seed run once against Atlas (or data already present)
- [ ] Monitor first live reservation notification (email inbox + WhatsApp)
