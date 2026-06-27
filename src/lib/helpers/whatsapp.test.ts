import { describe, it, expect } from "vitest";
import { buildWaLink } from "./whatsapp";

describe("buildWaLink", () => {
  it("membangun wa.me dengan nomor ternormalisasi + pesan ter-encode", () => {
    expect(buildWaLink("08123456789", "Halo dunia & teman")).toBe(
      "https://wa.me/628123456789?text=Halo%20dunia%20%26%20teman",
    );
  });
});
