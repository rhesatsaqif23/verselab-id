// Make every object in the upload bucket anonymously readable.
//
// The bucket policy allows s3:ListBucket but denies anonymous s3:GetObject, so
// uploaded images need an object-level public-read ACL (applied by
// getStorage().put()). Objects stored before that landed — or written by any
// other path — still 403 for visitors; this script finds and repairs them.
//
// Usage:
//   bun src/scripts/ensure-uploads-public.ts           # dry-run (default)
//   bun src/scripts/ensure-uploads-public.ts --apply   # re-put with public-read ACL
import { env } from "../config/env.ts";
import { getStorage, mimeForKey } from "../libs/storage.ts";

const LIST_URL = `${(env.S3_ENDPOINT ?? "").replace(/\/$/, "")}/${env.S3_BUCKET ?? "verselab"}`;

/** All object keys in the bucket via anonymous ListBucket (allowed by policy). */
async function listKeys(): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const url = new URL(LIST_URL);
    url.searchParams.set("list-type", "2");
    url.searchParams.set("max-keys", "1000");
    if (token) url.searchParams.set("continuation-token", token);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ListBucket failed: ${res.status} ${await res.text()}`);
    const xml = await res.text();
    keys.push(...[...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map((m) => m[1] as string));
    token = /<IsTruncated>true<\/IsTruncated>/.test(xml)
      ? xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/)?.[1]
      : undefined;
  } while (token);
  return keys;
}

async function publicGet(key: string): Promise<boolean> {
  const res = await fetch(`${LIST_URL}/${encodeURIComponent(key).replaceAll("%2F", "/")}`);
  return res.ok;
}

async function run(apply: boolean): Promise<void> {
  if (env.STORAGE_DRIVER === "local") {
    console.log("[public] STORAGE_DRIVER=local — nothing to do.");
    return;
  }
  const storage = getStorage();
  const keys = await listKeys();
  console.log(`[public] Found ${keys.length} object(s) in ${env.S3_BUCKET}.`);

  let fixed = 0;
  let ok = 0;
  let failed = 0;
  for (const key of keys) {
    if (await publicGet(key)) {
      ok++;
      continue;
    }
    if (!apply) {
      console.log(`[public] WOULD make public: ${key}`);
      fixed++;
      continue;
    }
    try {
      const bytes = await storage.read(key);
      if (!bytes) throw new Error("unreadable");
      const mime = mimeForKey(key);
      if (!mime) throw new Error("unsupported type");
      await storage.put(key, Buffer.from(bytes), mime);
      console.log(`[public] Fixed ${key}`);
      fixed++;
    } catch (err) {
      console.error(`[public] FAILED ${key}:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }
  console.log(
    `[public] Done. ${ok} already public, ${fixed} ${apply ? "fixed" : "to fix"}, ${failed} failed.`,
  );
}

if (import.meta.main) {
  const apply = process.argv.includes("--apply");
  if (!apply) console.log("[public] Dry-run mode. Pass --apply to set public-read ACLs.");
  run(apply)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[public] Failed:", err);
      process.exit(1);
    });
}
