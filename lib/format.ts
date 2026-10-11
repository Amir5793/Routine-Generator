/* Small helpers shared across the app (same behavior as the original HTML). */

export const fa = (v: string | number) =>
  String(v).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export const r5 = (x: number) => Math.round(x / 5) * 5;

/* ════════ ذخیره‌سازی (localStorage، فقط سمت کلاینت) ════════ */
export function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const v = JSON.parse(raw);
    return (v as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}
