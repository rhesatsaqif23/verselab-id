import { slugify } from "@verselab/shared/slug";

/**
 * Build a unique slug.
 * - If `requestedSlug` is provided it is normalized, otherwise the slug is derived from `title`.
 * - `exists(candidate)` must return true when the candidate is already taken;
 *   the helper appends `-2`, `-3`, ... until a free slug is found.
 */
export async function resolveUniqueSlug(
  options: { requestedSlug?: string; title: string },
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const requested = options.requestedSlug?.trim() ? slugify(options.requestedSlug) : "";
  const base = requested || slugify(options.title);

  for (let i = 1; ; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }
}
