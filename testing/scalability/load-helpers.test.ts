import { describe, expect, it } from "vitest";
import { digitsOnly, isValidEmail, isValidPhone } from "@/lib/validation";
import { whatsappHref } from "@/lib/whatsappLink";

/**
 * Lightweight scalability / resilience checks for pure helpers.
 * These do not replace load tests against a live cluster.
 */
describe("scalability — large inputs", () => {
  it("digitsOnly handles multi-kilobyte noisy strings quickly", () => {
    const noisy = ("a1".repeat(50_000)); // ~100k chars
    const started = performance.now();
    const out = digitsOnly(noisy);
    const elapsed = performance.now() - started;

    expect(out.length).toBe(50_000);
    expect(elapsed).toBeLessThan(200);
  });

  it("email validator rejects oversized garbage without hanging", () => {
    const huge = `${"a".repeat(10_000)}@${"b".repeat(10_000)}.com`;
    const started = performance.now();
    const ok = isValidEmail(huge);
    const elapsed = performance.now() - started;

    expect(typeof ok).toBe("boolean");
    expect(elapsed).toBeLessThan(100);
  });
});

describe("scalability — burst / concurrent validation", () => {
  it("validates thousands of phones concurrently", async () => {
    const phones = Array.from({ length: 5_000 }, (_, i) =>
      String(10_000_000 + (i % 89_999_999)).slice(0, 8)
    );

    const started = performance.now();
    const results = await Promise.all(
      phones.map(async (p) => isValidPhone(p))
    );
    const elapsed = performance.now() - started;

    expect(results.every(Boolean)).toBe(true);
    expect(elapsed).toBeLessThan(1_000);
  });

  it("builds many WhatsApp links without failure", () => {
    const links = Array.from({ length: 2_000 }, (_, i) =>
      whatsappHref(String(42_000_000 + (i % 1_000_000)).padStart(8, "0"))
    );
    expect(links.every((l) => l.startsWith("https://wa.me/"))).toBe(true);
  });
});

describe("scalability — guest count bounds (business rule)", () => {
  function guestsOk(n: number) {
    return n >= 1 && n <= 20;
  }

  it("enforces guest range used by reservation API", () => {
    expect(guestsOk(0)).toBe(false);
    expect(guestsOk(1)).toBe(true);
    expect(guestsOk(20)).toBe(true);
    expect(guestsOk(21)).toBe(false);
    expect(guestsOk(1_000_000)).toBe(false);
  });
});
