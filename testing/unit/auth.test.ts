import { beforeAll, describe, expect, it } from "vitest";
import { signToken, verifyToken } from "@/lib/auth";

describe("JWT auth helpers", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_dolce";
  });

  it("signs and verifies a valid admin token", () => {
    const token = signToken({
      id: "admin1",
      email: "admin@dolce.tn",
      role: "admin",
    });
    const payload = verifyToken(token);
    expect(payload).toMatchObject({
      id: "admin1",
      email: "admin@dolce.tn",
      role: "admin",
    });
  });

  it("rejects tampered tokens", () => {
    const token = signToken({
      id: "admin1",
      email: "admin@dolce.tn",
      role: "admin",
    });
    expect(verifyToken(token + "x")).toBeNull();
    expect(verifyToken("not.a.jwt")).toBeNull();
    expect(verifyToken("")).toBeNull();
  });
});
