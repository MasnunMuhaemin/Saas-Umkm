import { describe, it, expect } from "vitest";
import { buildTenantMetadata, tenantBaseUrl } from "./metadata";

describe("tenantBaseUrl", () => {
  it("pakai subdomain secara default", () => {
    expect(tenantBaseUrl("toko")).toBe("https://toko.tokopintar.id");
  });
  it("utamakan custom domain jika ada", () => {
    expect(tenantBaseUrl("toko", "tokosaya.com")).toBe("https://tokosaya.com");
  });
});

describe("buildTenantMetadata", () => {
  it("title absolut + canonical + noindex (non-prod)", () => {
    const m = buildTenantMetadata({ name: "Toko A", slug: "toko-a" });
    expect(m.title).toEqual({ absolute: "Toko A" });
    expect(m.alternates?.canonical).toBe("https://toko-a.tokopintar.id");
    // NODE_ENV=test → bukan production → noindex
    expect(m.robots).toMatchObject({ index: false, follow: false });
  });

  it("titleSuffix mem-prefix nama toko", () => {
    const m = buildTenantMetadata({
      name: "Toko A",
      slug: "toko-a",
      titleSuffix: "Kontak",
    });
    expect(m.title).toEqual({ absolute: "Kontak — Toko A" });
  });

  it("path masuk ke canonical", () => {
    const m = buildTenantMetadata({
      name: "Toko A",
      slug: "toko-a",
      path: "/produk/x",
    });
    expect(m.alternates?.canonical).toBe(
      "https://toko-a.tokopintar.id/produk/x",
    );
  });
});
