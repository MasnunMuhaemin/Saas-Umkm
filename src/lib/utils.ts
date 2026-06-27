/** Gabung class name (filter falsy). Versi ringan tanpa dependency. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
