import { describe, it, expect } from "vitest";
import { checkRateLimit, clearRateLimit } from "./rate-limit";

describe("rate-limit", () => {
  it("mengizinkan sampai batas lalu memblokir", () => {
    const key = "test:allow";
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(key, 3, 1000)).toBe(true);
    }
    expect(checkRateLimit(key, 3, 1000)).toBe(false);
    clearRateLimit(key);
  });

  it("clearRateLimit mereset counter", () => {
    const key = "test:clear";
    expect(checkRateLimit(key, 1, 1000)).toBe(true);
    expect(checkRateLimit(key, 1, 1000)).toBe(false);
    clearRateLimit(key);
    expect(checkRateLimit(key, 1, 1000)).toBe(true);
    clearRateLimit(key);
  });
});
