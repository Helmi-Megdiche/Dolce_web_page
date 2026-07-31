import { describe, expect, it } from "vitest";
import { digitsOnly, isValidEmail, isValidPhone } from "@/lib/validation";

describe("digitsOnly", () => {
  it("strips non-digits", () => {
    expect(digitsOnly("42 386 082")).toBe("42386082");
    expect(digitsOnly("+216-42.386.082")).toBe("21642386082");
  });

  it("returns empty for empty input", () => {
    expect(digitsOnly("")).toBe("");
    expect(digitsOnly("abc")).toBe("");
  });
});

describe("isValidPhone (Tunisia — exactly 8 digits)", () => {
  it("accepts exactly 8 digits", () => {
    expect(isValidPhone("42386082")).toBe(true);
    expect(isValidPhone("42 386 082")).toBe(true);
  });

  it("rejects shorter or longer numbers", () => {
    expect(isValidPhone("1234567")).toBe(false);
    expect(isValidPhone("123456789")).toBe(false);
    expect(isValidPhone("21642386082")).toBe(false);
    expect(isValidPhone("")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("accepts common valid emails", () => {
    expect(isValidEmail("guest@example.com")).toBe(true);
    expect(isValidEmail("  a.b+c@dolce.tn  ")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("no-at")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
  });
});
