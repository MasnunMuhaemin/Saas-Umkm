import { prisma } from "@/server/db";
import { revalidateStorefront } from "@/server/services/public/storefront.service";
import type { UpdateProfileInput } from "@/lib/validations/settings.schema";
import type { Prisma } from "@/generated/prisma/client";

const profileSelect = {
  name: true,
  slug: true,
  customDomain: true,
  tagline: true,
  description: true,
  phone: true,
  whatsapp: true,
  email: true,
  address: true,
  city: true,
  province: true,
  openingHours: true,
  logo: true,
  favicon: true,
  primaryColor: true,
  showBusinessName: true,
  showTagline: true,
  showPrice: true,
  showStock: true,
  showRating: true,
  showWhatsappButton: true,
  showCategory: true,
  showDiscount: true,
} satisfies Prisma.TenantSelect;

export type ProfileData = Prisma.TenantGetPayload<{
  select: typeof profileSelect;
}>;

export const settingsService = {
  /** Ambil profil tenant yang sedang login (untuk form). */
  getProfile: (tenantId: string): Promise<ProfileData> =>
    prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      select: profileSelect,
    }),

  /** Update profil tenant — data sudah di-whitelist via Zod.
   *  Return minimal (bukan full Tenant) agar tipe tRPC tetap ringan. */
  async updateProfile(tenantId: string, data: UpdateProfileInput) {
    await prisma.tenant.update({ where: { id: tenantId }, data });
    await revalidateStorefront(tenantId);
    return { ok: true };
  },
};
