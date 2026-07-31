import { describe, expect, it } from "vitest";
import { digitsOnly, isValidEmail, isValidPhone } from "@/lib/validation";
import { verifyToken } from "@/lib/auth";

/**
 * Security-oriented checks: malicious or abusive input must not be accepted
 * as valid contact data, and forged JWTs must fail closed.
 */
describe("security — input validation", () => {
  it("does not treat script payloads as emails", () => {
    expect(isValidEmail('<script>alert(1)</script>@x.com')).toBe(false);
    expect(isValidEmail("javascript:alert(1)")).toBe(false);
  });

  it("strips injection characters from phone digit extraction", () => {
    expect(digitsOnly("42; DROP TABLE reservations;--")).toBe("42");
    expect(digitsOnly("42<script>")).toBe("42");
    expect(isValidPhone("42<script>386082")).toBe(true); // only digits remain: 42386082
  });

  it("rejects phone numbers with country-code padding (must be local 8)", () => {
    expect(isValidPhone("+21642386082")).toBe(false);
  });

  it("rejects whitespace-only email tricks", () => {
    expect(isValidEmail("   ")).toBe(false);
  });
});

describe("security — auth fail-closed", () => {
  it("never returns a payload for empty / garbage tokens", () => {
    expect(verifyToken("")).toBeNull();
    expect(verifyToken("Bearer admin")).toBeNull();
    expect(verifyToken("eyJhbGciOiJub25lIn0.eyJyb2xlIjoiYWRtaW4ifQ.")).toBeNull();
  });
});

describe("security — reservation payload shape expectations", () => {
  function normalizeReservationBody(body: Record<string, unknown>) {
    const phone =
      typeof body.phone === "string" ? digitsOnly(body.phone) : "";
    const guests = Number(body.numberOfPeople) || 1;
    return {
      phoneOk: isValidPhone(phone),
      guestsOk: guests >= 1 && guests <= 20,
      nameOk:
        typeof body.customerName === "string" &&
        body.customerName.trim().length > 0,
    };
  }

  it("blocks incomplete or abusive reservation-like payloads", () => {
    expect(
      normalizeReservationBody({
        customerName: "",
        phone: "123",
        numberOfPeople: 99,
      })
    ).toEqual({ phoneOk: false, guestsOk: false, nameOk: false });

    expect(
      normalizeReservationBody({
        customerName: "  Guest  ",
        phone: "42386082",
        numberOfPeople: 2,
      })
    ).toEqual({ phoneOk: true, guestsOk: true, nameOk: true });
  });
});
