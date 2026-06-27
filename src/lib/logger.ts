type Level = "info" | "warn" | "error";

function emit(level: Level, msg: string, meta?: Record<string, unknown>) {
  const line = JSON.stringify({
    level,
    msg,
    ...(meta ? { meta } : {}),
    t: new Date().toISOString(),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/** Structured logger ringan (JSON ke stdout/stderr). */
export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => emit("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) =>
    emit("error", msg, meta),
};

/**
 * Catat error terstruktur. Hook monitoring: bila SENTRY_DSN diisi, di sinilah
 * `Sentry.captureException(e)` dipasang (tinggal `npm i @sentry/nextjs`).
 */
export function captureError(e: unknown, context?: Record<string, unknown>) {
  logger.error(e instanceof Error ? e.message : String(e), {
    ...context,
    ...(e instanceof Error && e.stack ? { stack: e.stack } : {}),
  });
}
