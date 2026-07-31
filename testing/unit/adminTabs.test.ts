import { describe, expect, it } from "vitest";
import { isTabId, tabIds } from "@/lib/adminTabs";

describe("adminTabs", () => {
  it("exposes all dashboard tabs", () => {
    expect(tabIds).toContain("menu");
    expect(tabIds).toContain("offers");
    expect(tabIds).toContain("reservations");
    expect(tabIds).toContain("reclamations");
    expect(tabIds).toContain("settings");
  });

  it("validates tab ids safely", () => {
    expect(isTabId("offers")).toBe(true);
    expect(isTabId("hacked")).toBe(false);
    expect(isTabId(null)).toBe(false);
    expect(isTabId("")).toBe(false);
  });
});
