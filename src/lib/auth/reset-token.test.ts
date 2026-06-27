import crypto from "node:crypto";
import { describe, it, expect } from "vitest";
import { createResetToken, verifyResetToken } from "./reset-token";

describe("reset-token", () => {
  it("memverifikasi token yang valid (round-trip)", () => {
    const t = createResetToken("a@b.com");
    expect(verifyResetToken(t)).toBe("a@b.com");
  });

  it("menolak token rusak / format salah", () => {
    expect(verifyResetToken("garbage")).toBeNull();
    expect(verifyResetToken("")).toBeNull();
    expect(verifyResetToken("a.b.c")).toBeNull();
  });

  it("menolak tanda tangan yang diubah", () => {
    const t = createResetToken("a@b.com");
    const tampered = t.slice(0, -2) + (t.endsWith("aa") ? "bb" : "aa");
    expect(verifyResetToken(tampered)).toBeNull();
  });

  it("menolak payload yang diganti (email lain, sig lama)", () => {
    const [, sig] = createResetToken("a@b.com").split(".");
    const fakePayload = Buffer.from(
      JSON.stringify({ email: "evil@b.com", exp: Date.now() + 10000 }),
    ).toString("base64url");
    expect(verifyResetToken(`${fakePayload}.${sig}`)).toBeNull();
  });

  it("menolak token kedaluwarsa", () => {
    // Tanda tangan valid tapi exp di masa lalu → harus ditolak.
    const payload = Buffer.from(
      JSON.stringify({ email: "a@b.com", exp: Date.now() - 1000 }),
    ).toString("base64url");
    const sig = crypto
      .createHmac("sha256", process.env.AUTH_SECRET ?? "dev-secret")
      .update(payload)
      .digest("base64url");
    expect(verifyResetToken(`${payload}.${sig}`)).toBeNull();
  });
});
