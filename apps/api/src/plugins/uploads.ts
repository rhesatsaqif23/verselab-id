// Public file serving for local uploads (STORAGE_DRIVER=local).
// Replaces the @elysiajs/static /uploads block, which did not resolve stored
// URLs (/uploads/content/...) in this setup. Traversal-safe: only paths under
// ./uploads with no dot segments are servable. Images are public by design
// (rendered in <img> tags), so no auth here.
import { Elysia } from "elysia";
import { join } from "node:path";
import { mimeForKey, safeUploadPath } from "../libs/storage.ts";

export const uploadsPlugin = new Elysia({ name: "uploads" }).get(
  "/uploads/*",
  async ({ params, status }) => {
    const rel = safeUploadPath((params as { "*": string })["*"] ?? "");
    if (!rel) return status(404);
    const file = Bun.file(join(process.cwd(), "uploads", rel));
    if (!(await file.exists())) return status(404);
    return new Response(file, {
      headers: {
        "Content-Type": mimeForKey(rel) ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  },
);
