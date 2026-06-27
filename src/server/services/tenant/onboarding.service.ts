import { prisma } from "@/server/db";
import { productService } from "./product.service";
import { revalidateStorefront } from "@/server/services/public/storefront.service";
import type { CompleteOnboardingInput } from "@/lib/validations/onboarding.schema";

export const onboardingService = {
  /** Status onboarding + data toko untuk prefill wizard. */
  async status(tenantId: string) {
    const t = await prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      select: {
        onboardedAt: true,
        name: true,
        slug: true,
        whatsapp: true,
        description: true,
        logo: true,
      },
    });
    return {
      onboarded: !!t.onboardedAt,
      name: t.name,
      slug: t.slug,
      whatsapp: t.whatsapp ?? "",
      description: t.description ?? "",
      logo: t.logo ?? "",
    };
  },

  /** Selesaikan wizard: simpan profil toko, produk pertama (opsional), set flag. */
  async complete(tenantId: string, input: CompleteOnboardingInput) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: input.name,
        whatsapp: input.whatsapp || null,
        description: input.description || null,
        logo: input.logo || null,
        onboardedAt: new Date(),
      },
    });

    if (input.product?.name) {
      // Reuse store() → cek kuota paket + slug unik + revalidate.
      await productService.store(tenantId, {
        name: input.product.name,
        price: input.product.price,
        stock: input.product.stock ?? 0,
        status: "ACTIVE",
      });
    }

    await revalidateStorefront(tenantId);
    return { ok: true };
  },
};
