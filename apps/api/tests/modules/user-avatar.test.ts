import { afterEach, describe, expect, it, mock } from "bun:test";

const putCalls: { key: string; contentType: string }[] = [];
const deletedKeys: string[] = [];
const updates: Record<string, unknown>[] = [];
let existingAvatar: string | null = "/uploads/avatars/u-1.png";

mock.module("../../src/database/index.ts", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [{ avatarUrl: existingAvatar }],
        }),
      }),
    }),
    update: () => ({
      set: (values: Record<string, unknown>) => ({
        where: async () => {
          updates.push(values);
          return [];
        },
      }),
    }),
  }),
}));

const { userService } = await import("../../src/modules/user/service.ts");
const { setStorageFake } = await import("../../src/libs/storage.ts");

function useCapturingStorage() {
  setStorageFake({
    put: async (key: string, _data: Buffer, contentType: string) => {
      putCalls.push({ key, contentType });
      return `/uploads/${key}?t=1`;
    },
    delete: async (key: string) => {
      deletedKeys.push(key);
    },
    read: async () => null,
  });
}

afterEach(() => {
  setStorageFake(null);
  putCalls.length = 0;
  deletedKeys.length = 0;
  updates.length = 0;
  existingAvatar = "/uploads/avatars/u-1.png";
});

describe("user avatar uploads", () => {
  it("stores avatars through the storage driver, not local disk", async () => {
    useCapturingStorage();
    const file = new File([new Uint8Array([1, 2, 3])], "a.png", { type: "image/png" });

    const result = await userService.uploadAvatar("u-1", file);

    expect(putCalls).toEqual([{ key: "avatars/u-1.png", contentType: "image/png" }]);
    expect(result.avatarUrl).toMatch(/^\/uploads\/avatars\/u-1\.png\?t=/);
    expect(updates[0]).toMatchObject({ avatarUrl: result.avatarUrl });
    expect(deletedKeys).toEqual([]);
  });

  it("deletes the previous avatar object when the extension changes", async () => {
    existingAvatar = "/uploads/avatars/u-1.jpg";
    useCapturingStorage();
    const file = new File([new Uint8Array([1])], "a.png", { type: "image/png" });

    await userService.uploadAvatar("u-1", file);

    expect(putCalls).toEqual([{ key: "avatars/u-1.png", contentType: "image/png" }]);
    expect(deletedKeys).toEqual(["avatars/u-1.jpg"]);
  });

  it("rejects non-image uploads before touching storage", async () => {
    useCapturingStorage();
    const file = new File(["x"], "a.txt", { type: "text/plain" });

    await expect(userService.uploadAvatar("u-1", file)).rejects.toThrow();
    expect(putCalls).toEqual([]);
    expect(updates).toEqual([]);
  });
});
