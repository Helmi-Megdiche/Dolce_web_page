import { beforeAll, describe, expect, it } from "vitest";

/** Prefer DOLCE_TEST_URL — Vite reserves process.env.BASE_URL as "/" */
const BASE_URL = (
  process.env.DOLCE_TEST_URL ||
  process.env.TEST_API_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

let serverUp = false;

/**
 * Live smoke tests.
 *
 *   npm run test:api
 *   DOLCE_TEST_URL=https://your-domain.com npm run test:api
 *
 * Soft-skips if the server does not respond.
 */
describe("API smoke (live)", () => {
  beforeAll(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/settings`, {
        signal: AbortSignal.timeout(5000),
      });
      serverUp = res.ok;
    } catch {
      serverUp = false;
    }
    if (!serverUp) {
      console.warn(
        `[api smoke] No server at ${BASE_URL} — soft-skipping. Start npm run dev or set DOLCE_TEST_URL.`
      );
    }
  });

  it("GET /api/menu returns an array", async () => {
    if (!serverUp) return;
    const res = await fetch(`${BASE_URL}/api/menu`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("GET /api/offers returns an array", async () => {
    if (!serverUp) return;
    const res = await fetch(`${BASE_URL}/api/offers`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("GET /api/settings returns an object with contact keys", async () => {
    if (!serverUp) return;
    const res = await fetch(`${BASE_URL}/api/settings`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("phone");
    expect(data).toHaveProperty("instagram_url");
  });

  it("GET /api/reservations without auth is unauthorized", async () => {
    if (!serverUp) return;
    const res = await fetch(`${BASE_URL}/api/reservations`);
    expect(res.status).toBe(401);
  });

  it("POST /api/reservations rejects invalid phone", async () => {
    if (!serverUp) return;
    const res = await fetch(`${BASE_URL}/api/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Test Guest",
        phone: "123",
        reservationDate: "2099-01-01",
        reservationTime: "19:00",
        numberOfPeople: 2,
      }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/reclamations rejects short messages", async () => {
    if (!serverUp) return;
    const res = await fetch(`${BASE_URL}/api/reclamations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "hi" }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/admin/login rejects wrong password", async () => {
    if (!serverUp) return;
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@dolce.tn",
        password: "definitely-wrong-password",
      }),
    });
    expect([401, 400, 403]).toContain(res.status);
  });
});
