import { describe, it, expect } from "vitest";
import { formatRupiah, formatDate, formatPhone } from "./format";

describe("formatRupiah", () => {
  // `.` cocok dengan non-breaking space yang disisipkan Intl antara "Rp" & angka.
  it("memberi prefix Rp + pemisah ribuan", () => {
    expect(formatRupiah(65000)).toMatch(/^Rp.65\.000$/);
    expect(formatRupiah(0)).toMatch(/^Rp.0$/);
    expect(formatRupiah(1500000)).toMatch(/^Rp.1\.500\.000$/);
  });
});

describe("formatPhone", () => {
  it("mengubah awalan 0 menjadi 62", () => {
    expect(formatPhone("08123456789")).toBe("628123456789");
  });
  it("membuang karakter non-digit", () => {
    expect(formatPhone("0812-3456-789")).toBe("628123456789");
  });
  it("mempertahankan awalan 62", () => {
    expect(formatPhone("628123")).toBe("628123");
  });
});

describe("formatDate", () => {
  it("memformat tanggal Indonesia", () => {
    expect(formatDate(new Date("2026-06-27T03:00:00Z"))).toContain("2026");
  });
});
