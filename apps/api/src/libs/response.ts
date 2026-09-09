export const ok = <T>(data: T) => ({ ok: true as const, data });
export const fail = <T extends { code: string; message: string }>(e: T) => ({
  ok: false as const,
  error: e,
});
