import { describe, expect, it } from "vitest";
import {
  buildPaginationWindow,
  PAGE_SIZES,
  DEFAULT_PAGE_SIZE,
} from "#/features/admin/components/PaginationBar.tsx";

describe("buildPaginationWindow", () => {
  it("lists every page when there are at most 7", () => {
    expect(buildPaginationWindow(1, 4)).toEqual([1, 2, 3, 4]);
    expect(buildPaginationWindow(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("collapses the tail when on the first pages", () => {
    expect(buildPaginationWindow(1, 10)).toEqual([1, 2, null, 10]);
    expect(buildPaginationWindow(2, 10)).toEqual([1, 2, 3, null, 10]);
  });

  it("keeps the window around the current page in the middle", () => {
    expect(buildPaginationWindow(5, 10)).toEqual([1, null, 4, 5, 6, null, 10]);
  });

  it("collapses the head when on the last pages", () => {
    expect(buildPaginationWindow(10, 10)).toEqual([1, null, 9, 10]);
    expect(buildPaginationWindow(8, 10)).toEqual([1, null, 7, 8, 9, 10]);
  });

  it("never duplicates edges when the window touches them", () => {
    expect(buildPaginationWindow(2, 8)).toEqual([1, 2, 3, null, 8]);
    expect(buildPaginationWindow(7, 8)).toEqual([1, null, 6, 7, 8]);
  });

  it("handles single and empty page counts", () => {
    expect(buildPaginationWindow(1, 1)).toEqual([1]);
    expect(buildPaginationWindow(1, 0)).toEqual([]);
  });
});

describe("page sizes", () => {
  it("offers 10, 20, and 50 rows per page and defaults to 10", () => {
    expect([...PAGE_SIZES]).toEqual([10, 20, 50]);
    expect(DEFAULT_PAGE_SIZE).toBe(10);
  });
});
