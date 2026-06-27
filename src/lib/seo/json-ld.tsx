/**
 * Render JSON-LD dengan aman: escape `<` agar tidak bisa menutup tag <script>
 * (anti-XSS). WAJIB dipakai untuk semua structured data — jangan tulis
 * dangerouslySetInnerHTML mentah di tempat lain.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
