import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET ?? "dev-secret";
const TTL_MS = 60 * 60 * 1000; // 1 jam

/**
 * Token reset password STATELESS (tanpa tabel DB): payload {email,exp} + HMAC.
 * Aman karena ditandatangani AUTH_SECRET; kedaluwarsa 1 jam.
 */
export function createResetToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + TTL_MS }),
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyResetToken(token: string): string | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const { email, exp } = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    );
    if (typeof exp !== "number" || Date.now() > exp) return null;
    return typeof email === "string" ? email : null;
  } catch {
    return null;
  }
}
