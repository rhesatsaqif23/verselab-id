import { useSyncExternalStore } from "react";

// Tracks unit/lesson image uploads that continue in the background after a
// dialog closes, so admin tables can show a skeleton in the image column while
// the row has no image yet. Module-level state: any mounted table subscribes
// and re-renders when the pending set changes.

const pending = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function emit() {
  version += 1;
  for (const callback of [...listeners]) callback();
}

/**
 * Mark {@code id} as uploading an image until {@code promise} settles.
 * Returns the promise for chaining. Safe to call without a subscriber.
 */
export function trackImageUpload<T>(id: string, promise: Promise<T>): Promise<T> {
  pending.add(id);
  emit();
  promise.finally(() => {
    pending.delete(id);
    emit();
  });
  return promise;
}

/** True while an upload for {@code id} is in flight. */
export function isImageUploading(id: string): boolean {
  return pending.has(id);
}

/** Subscribe this component to upload-start/finish events. Call once per page. */
export function useImageUploadChanges(): void {
  useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
}
