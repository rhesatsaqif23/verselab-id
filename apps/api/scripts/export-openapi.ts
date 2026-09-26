// Exports the runtime OpenAPI spec to docs/api/openapi.json so the frontend has
// a stable reference for types/endpoints until codegen is set up.
//   bun run --cwd apps/api export:openapi
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createApp } from "../src/app.ts";

const app = createApp();
const res = await app.handle(new Request("http://localhost/openapi/json"));
if (res.status !== 200) throw new Error(`OpenAPI export failed: HTTP ${res.status}`);

const dir = resolve(import.meta.dir, "../../../docs/api");
await mkdir(dir, { recursive: true });
const out = resolve(dir, "openapi.json");
await writeFile(out, JSON.stringify(await res.json(), null, 2));
console.log(`[openapi] wrote ${out}`);
