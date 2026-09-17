/**
 * Turn a human-readable title into a URL-safe slug.
 * Example: "Mulai Menabung!" -> "mulai-menabung"
 */
export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
  return slug || "item";
}
