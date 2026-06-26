/** Konstanta konfigurasi global — jangan hardcode magic number di kode. */

export const PER_PAGE = 20;
export const MAX_UPLOAD_MB = 2;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const LOGIN_RATE_LIMIT = { attempts: 5, window: "1 m" } as const;

/** Subdomain yang BUKAN tenant (dipakai middleware). */
export const RESERVED_SUBDOMAINS = ["www", "app", "admin", "api"];

/** Grace period (hari) sebelum suspend setelah jatuh tempo. */
export const GRACE_PERIOD_DAYS = 3;
