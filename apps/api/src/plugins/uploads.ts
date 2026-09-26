// Public file serving for stored uploads (any storage driver). Stored URLs are
// relative (/uploads/<key>) and resolve to this route, which streams the bytes
// from the storage backend (local disk or S3). S3 objects therefore never need
// a public-read bucket policy — the API has the credentials. Traversal-safe:
// only safe paths are servable. Images are public by design (rendered in <img>
// tags), so no auth here.
import { Elysia } from "elysia";
import { getStorage, mimeForKey, safeUploadPath } from "../libs/storage.ts";

export const uploadsPlugin = new Elysia({ name: "uploads" }).get(
  "/uploads/*",
  async ({ params, status }) => {
    const rel = safeUploadPath((params as { "*": string })["*"] ?? "");
    if (!rel) return status(404);
    const bytes = await getStorage().read(rel);
    if (!bytes) return status(404);
    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": mimeForKey(rel) ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  },
);
