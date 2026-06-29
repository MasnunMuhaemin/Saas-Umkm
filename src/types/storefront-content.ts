/** Bentuk konten storefront yang fleksibel (disimpan sebagai Json di Tenant).
 *  Dipakai konsisten oleh website builder & rendering storefront. */

export type HeroStat = { value: string; label: string };
export type Advantage = { title: string; description: string };
export type Testimonial = { name: string; text: string; rating: number };
export type Faq = { question: string; answer: string };
export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
};

/** Coerce Json mentah → tipe aman (anti data rusak / non-array). */
export function coerceHeroStats(v: unknown): HeroStat[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
    .map((x) => ({ value: String(x.value ?? ""), label: String(x.label ?? "") }))
    .filter((s) => s.value || s.label);
}
export function coerceAdvantages(v: unknown): Advantage[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
    .map((x) => ({
      title: String(x.title ?? ""),
      description: String(x.description ?? ""),
    }))
    .filter((a) => a.title || a.description);
}
export function coerceTestimonials(v: unknown): Testimonial[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
    .map((x) => ({
      name: String(x.name ?? ""),
      text: String(x.text ?? ""),
      rating: Math.min(5, Math.max(0, Number(x.rating) || 5)),
    }))
    .filter((t) => t.name || t.text);
}
export function coerceFaqs(v: unknown): Faq[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
    .map((x) => ({
      question: String(x.question ?? ""),
      answer: String(x.answer ?? ""),
    }))
    .filter((f) => f.question || f.answer);
}
export function coerceSocialLinks(v: unknown): SocialLinks {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const o = v as Record<string, unknown>;
  const pick = (k: string) => (o[k] ? String(o[k]) : undefined);
  return {
    facebook: pick("facebook"),
    instagram: pick("instagram"),
    youtube: pick("youtube"),
    tiktok: pick("tiktok"),
  };
}
