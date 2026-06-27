import { describe, it, expect } from "vitest";
import { loginSchema } from "./auth.schema";
import { storeProductSchema, listProductSchema } from "./product.schema";
import { posOrderSchema } from "./order.schema";
import { createTenantSchema } from "./superadmin.schema";

describe("loginSchema", () => {
  it("menolak email tidak valid", () => {
    expect(loginSchema.safeParse({ email: "x", password: "y" }).success).toBe(
      false,
    );
  });
  it("menerima input valid", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "y" }).success,
    ).toBe(true);
  });
});

describe("storeProductSchema", () => {
  it("wajib nama, harga >= 0, default stock 0", () => {
    const r = storeProductSchema.safeParse({ name: "Kue", price: 1000 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.stock).toBe(0);
    expect(storeProductSchema.safeParse({ name: "", price: 1000 }).success).toBe(
      false,
    );
    expect(storeProductSchema.safeParse({ name: "Kue", price: -5 }).success).toBe(
      false,
    );
  });
});

describe("listProductSchema", () => {
  it("default page = 1", () => {
    const r = listProductSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.page).toBe(1);
  });
});

describe("posOrderSchema", () => {
  it("minimal 1 item, qty >= 1, default paymentMethod cash", () => {
    expect(posOrderSchema.safeParse({ items: [] }).success).toBe(false);
    const ok = posOrderSchema.safeParse({
      items: [{ productId: "p", quantity: 2 }],
    });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data.paymentMethod).toBe("cash");
      expect(ok.data.discount).toBe(0);
    }
    expect(
      posOrderSchema.safeParse({ items: [{ productId: "p", quantity: 0 }] })
        .success,
    ).toBe(false);
  });
});

describe("createTenantSchema", () => {
  const base = {
    name: "T",
    slug: "toko-baru",
    ownerName: "A",
    ownerEmail: "a@b.com",
    password: "123456",
    planSlug: "basic" as const,
  };
  it("menolak slug dengan spasi/huruf besar", () => {
    expect(createTenantSchema.safeParse({ ...base, slug: "Toko Baru" }).success).toBe(
      false,
    );
  });
  it("menolak password < 6 karakter", () => {
    expect(createTenantSchema.safeParse({ ...base, password: "123" }).success).toBe(
      false,
    );
  });
  it("menerima input valid", () => {
    expect(createTenantSchema.safeParse(base).success).toBe(true);
  });
});
