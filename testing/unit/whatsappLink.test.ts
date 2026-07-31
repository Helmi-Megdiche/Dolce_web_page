import { describe, expect, it } from "vitest";
import { whatsappHref } from "@/lib/whatsappLink";

describe("whatsappHref", () => {
  it("returns empty when nothing provided", () => {
    expect(whatsappHref()).toBe("");
    expect(whatsappHref("", "")).toBe("");
  });

  it("passes through full URLs", () => {
    expect(whatsappHref("https://wa.me/21642386082")).toBe(
      "https://wa.me/21642386082"
    );
  });

  it("prefixes Tunisian 8-digit numbers with 216", () => {
    expect(whatsappHref("42386082")).toBe("https://wa.me/21642386082");
    expect(whatsappHref("42 386 082")).toBe("https://wa.me/21642386082");
  });

  it("uses fallback phone when primary empty", () => {
    expect(whatsappHref("", "42386082")).toBe("https://wa.me/21642386082");
  });

  it("keeps already-international digits", () => {
    expect(whatsappHref("21642386082")).toBe("https://wa.me/21642386082");
  });
});
