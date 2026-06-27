const KEY = process.env.RESEND_API_KEY ?? "";
const FROM = process.env.EMAIL_FROM ?? "MayWeb <noreply@mayweb.id>";

/** Tanpa RESEND_API_KEY → MODE MOCK (log ke konsol, tidak benar-benar kirim). */
export const EMAIL_MOCK = KEY.length === 0;

/**
 * Kirim email transaksional. Pakai Resend API (fetch langsung, tanpa SDK).
 * Dev (tanpa key): log ke konsol. Tidak pernah melempar (fire-and-forget aman).
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; mock: boolean }> {
  if (EMAIL_MOCK) {
    console.log(
      `[email:mock] to=${input.to} subject="${input.subject}" (set RESEND_API_KEY untuk kirim asli)`,
    );
    return { ok: true, mock: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });
    if (!res.ok) {
      console.error("Resend error:", await res.text());
      return { ok: false, mock: false };
    }
    return { ok: true, mock: false };
  } catch (e) {
    console.error("Resend exception:", e);
    return { ok: false, mock: false };
  }
}
