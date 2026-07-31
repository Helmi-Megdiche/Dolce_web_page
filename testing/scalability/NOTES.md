# Scalability notes (beyond unit helpers)

Automated helper tests live in `scalability/load-helpers.test.ts`.

For a real production load pass (optional, post-deploy):

1. **Warm** — hit `/api/menu`, `/api/offers`, `/en`, `/fr` a few times after deploy.
2. **Read traffic** — use a simple load tool against public GETs only, e.g.:

   ```bash
   npx autocannon -c 20 -d 20 https://YOUR_DOMAIN/api/menu
   npx autocannon -c 20 -d 20 https://YOUR_DOMAIN/en
   ```

3. **Write traffic** — do **not** flood `POST /api/reservations` or reclamations on production (creates real bookings + WhatsApp/email). Use staging.
4. **MongoDB Atlas** — check Connections / CPU during the burst; raise tier if saturated.
5. **Vercel** — serverless cold starts are normal; first request after idle may be slower.

Bottlenecks to watch: MongoDB, SMTP rate limits, UltraMsg quotas, Uploadthing bandwidth.
