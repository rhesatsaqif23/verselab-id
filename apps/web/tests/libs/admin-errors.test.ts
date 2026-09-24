// Tests for translateAdminError: technical errors become clear Indonesian messages.
import { describe, expect, it } from "vitest";
import { translateAdminError } from "../../src/libs/admin-content-fns.ts";

describe("translateAdminError", () => {
  it("translates HTTP status codes", () => {
    expect(translateAdminError(new Error("HTTP 401"), "x")).toBe(
      "Sesi berakhir. Silakan masuk ulang.",
    );
    expect(translateAdminError(new Error("HTTP 403"), "x")).toBe(
      "Akses ditolak. Hanya admin yang dapat melakukan ini.",
    );
    expect(translateAdminError(new Error("HTTP 404"), "x")).toContain("tidak ditemukan");
    expect(translateAdminError(new Error("HTTP 422"), "x")).toContain("tidak valid");
    expect(translateAdminError(new Error("HTTP 500"), "x")).toContain("server");
  });

  it("translates English AppError codes and messages", () => {
    expect(translateAdminError(new Error("FORBIDDEN"), "x")).toContain("Hanya admin");
    expect(translateAdminError(new Error("Not found"), "x")).toContain("tidak ditemukan");
  });

  it("detects network failures", () => {
    expect(translateAdminError(new TypeError("Failed to fetch"), "x")).toContain("koneksi");
  });

  it("passes through user-friendly messages and falls back otherwise", () => {
    expect(translateAdminError(new Error("Judul sudah dipakai"), "x")).toBe("Judul sudah dipakai");
    expect(translateAdminError(new Error("HTTP 418"), "Cadangan")).toBe("Cadangan");
  });
});
