// Tests for reachesPrerequisite: prerequisite picker cycle exclusion.
import { describe, expect, it } from "vitest";
import { reachesPrerequisite } from "#/features/admin/components/LessonFormDialog.tsx";

const lessons = [
  { id: "l-1", prerequisiteIds: [] as string[] | null },
  { id: "l-2", prerequisiteIds: ["l-1"] },
  { id: "l-3", prerequisiteIds: ["l-2"] },
  { id: "l-4", prerequisiteIds: null },
];

describe("reachesPrerequisite", () => {
  it("detects self-dependence", () => {
    expect(reachesPrerequisite(lessons, "l-1", "l-1")).toBe(true);
  });

  it("detects direct and transitive dependence", () => {
    expect(reachesPrerequisite(lessons, "l-2", "l-1")).toBe(true);
    expect(reachesPrerequisite(lessons, "l-3", "l-1")).toBe(true);
  });

  it("allows unrelated lessons", () => {
    expect(reachesPrerequisite(lessons, "l-1", "l-2")).toBe(false);
    expect(reachesPrerequisite(lessons, "l-4", "l-1")).toBe(false);
  });
});
