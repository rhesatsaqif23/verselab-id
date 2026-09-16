// Client-side sync layer between progressStore and server.
import type { ProgressPatch, ServerProgress } from "@verselab/shared/schemas/progress";
import { getProgress, putProgress } from "#/libs/api.ts";

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPatch: ProgressPatch = {};

/** Merge a patch into the pending queue and debounce a server write. */
export function scheduleSync(patch: ProgressPatch) {
  Object.assign(pendingPatch, patch);
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(flushSync, 500);
}

/** Force an immediate server write (call before navigation / unload). */
export async function flushSync(): Promise<void> {
  if (syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = null;
  }
  if (!Object.keys(pendingPatch).length) return;
  const patch = { ...pendingPatch };
  pendingPatch = {};
  try {
    await putProgress({ data: patch });
  } catch {
    // Re-queue on failure so the next flush retries.
    Object.assign(pendingPatch, patch);
  }
}

/** Load full progress from server on login. */
export async function loadProgress(): Promise<ServerProgress | null> {
  try {
    return await getProgress();
  } catch {
    return null;
  }
}
