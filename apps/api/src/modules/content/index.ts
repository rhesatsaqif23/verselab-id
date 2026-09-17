import { Elysia } from "elysia";
import { authContext } from "../../middleware/auth.ts";
import { requireAdmin } from "../../middleware/rbac.ts";
import { ok } from "../../libs/response.ts";
import { contentUnitService, type ContentUnitService } from "./unit.service.ts";
import { contentLessonService, type ContentLessonService } from "./lesson.service.ts";
import { contentScreenService, type ContentScreenService } from "./screen.service.ts";
import {
  createUnitSchema,
  updateUnitSchema,
  createLessonSchema,
  updateLessonSchema,
  createScreenSchema,
  updateScreenSchema,
  reorderSchema,
} from "@verselab/shared/schemas/content";

export function createContentController(
  unitSvc: ContentUnitService = contentUnitService,
  lessonSvc: ContentLessonService = contentLessonService,
  screenSvc: ContentScreenService = contentScreenService,
) {
  return (
    new Elysia({ prefix: "/content" })
      // ── Public read endpoints (no auth) ───────────────────────────────
      .get("/units", async () => ok(await unitSvc.listUnits()), {
        tags: ["content"],
        detail: { summary: "List all units" },
      })
      .get(
        "/units-by-slug/:slug",
        async ({ params }) => ok(await unitSvc.getUnitBySlug(params.slug)),
        {
          tags: ["content"],
          detail: { summary: "Get unit by slug" },
        },
      )
      .get("/units/:id", async ({ params }) => ok(await unitSvc.getUnit(params.id)), {
        tags: ["content"],
        detail: { summary: "Get unit by ID" },
      })
      .get(
        "/lessons-by-slug/:slug",
        async ({ params }) => ok(await lessonSvc.getLessonBySlug(params.slug)),
        {
          tags: ["content"],
          detail: { summary: "Get lesson by slug" },
        },
      )
      .get(
        "/lessons/:id",
        async ({ params }) => ok(await lessonSvc.getLessonWithScreens(params.id)),
        {
          tags: ["content"],
          detail: { summary: "Get lesson with screens" },
        },
      )
      .get("/lessons-all", async () => ok(await lessonSvc.listAllLessons()), {
        tags: ["content"],
        detail: { summary: "List all lessons with unit info" },
      })
      .get("/screens-all", async () => ok(await screenSvc.listAllScreens()), {
        tags: ["content"],
        detail: { summary: "List all screens with lesson info" },
      })

      // ── Admin endpoints (auth + requireAdmin) ─────────────────────────
      .use(authContext)
      .use(requireAdmin)

      // --- Unit CRUD ---
      .post("/units", async ({ body }) => ok(await unitSvc.createUnit(body)), {
        body: createUnitSchema,
        admin: true,
        tags: ["content"],
        detail: { summary: "Create unit (admin)" },
      })
      .patch(
        "/units/:id",
        async ({ params, body }) => ok(await unitSvc.updateUnit(params.id, body)),
        {
          body: updateUnitSchema,
          admin: true,
          tags: ["content"],
          detail: { summary: "Update unit (admin)" },
        },
      )
      .delete(
        "/units/:id",
        async ({ params }) => {
          await unitSvc.deleteUnit(params.id);
          return ok(null);
        },
        {
          admin: true,
          tags: ["content"],
          detail: { summary: "Delete unit (admin)" },
        },
      )
      .put(
        "/units/reorder",
        async ({ body }) => {
          await unitSvc.reorderUnits(body.ids);
          return ok(null);
        },
        {
          body: reorderSchema,
          admin: true,
          tags: ["content"],
          detail: { summary: "Reorder units (admin)" },
        },
      )
      .post(
        "/units/:id/image",
        async ({ params, body }) => {
          const file = (body as { file: File }).file;
          return ok(await unitSvc.uploadImage(params.id, file));
        },
        {
          admin: true,
          tags: ["content"],
          detail: { summary: "Upload unit image (admin)" },
        },
      )

      // --- Lesson CRUD ---
      .get("/units/:id/lessons", async ({ params }) => ok(await lessonSvc.listLessons(params.id)), {
        admin: true,
        tags: ["content"],
        detail: { summary: "List lessons for unit (admin)" },
      })
      .post("/lessons", async ({ body }) => ok(await lessonSvc.createLesson(body)), {
        body: createLessonSchema,
        admin: true,
        tags: ["content"],
        detail: { summary: "Create lesson (admin)" },
      })
      .patch(
        "/lessons/:id",
        async ({ params, body }) => ok(await lessonSvc.updateLesson(params.id, body)),
        {
          body: updateLessonSchema,
          admin: true,
          tags: ["content"],
          detail: { summary: "Update lesson (admin)" },
        },
      )
      .delete(
        "/lessons/:id",
        async ({ params }) => {
          await lessonSvc.deleteLesson(params.id);
          return ok(null);
        },
        {
          admin: true,
          tags: ["content"],
          detail: { summary: "Delete lesson (admin)" },
        },
      )
      .put(
        "/lessons/reorder",
        async ({ body }) => {
          await lessonSvc.reorderLessons(body.ids);
          return ok(null);
        },
        {
          body: reorderSchema,
          admin: true,
          tags: ["content"],
          detail: { summary: "Reorder lessons (admin)" },
        },
      )

      // --- Screen CRUD ---
      .get(
        "/lessons/:id/screens",
        async ({ params }) => ok(await screenSvc.listScreens(params.id)),
        {
          admin: true,
          tags: ["content"],
          detail: { summary: "List screens for lesson (admin)" },
        },
      )
      .post("/screens", async ({ body }) => ok(await screenSvc.createScreen(body)), {
        body: createScreenSchema,
        admin: true,
        tags: ["content"],
        detail: { summary: "Create screen (admin)" },
      })
      .patch(
        "/screens/:id",
        async ({ params, body }) => ok(await screenSvc.updateScreen(params.id, body)),
        {
          body: updateScreenSchema,
          admin: true,
          tags: ["content"],
          detail: { summary: "Update screen (admin)" },
        },
      )
      .delete(
        "/screens/:id",
        async ({ params }) => {
          await screenSvc.deleteScreen(params.id);
          return ok(null);
        },
        {
          admin: true,
          tags: ["content"],
          detail: { summary: "Delete screen (admin)" },
        },
      )
      .put(
        "/screens/reorder",
        async ({ body }) => {
          await screenSvc.reorderScreens(body.ids);
          return ok(null);
        },
        {
          body: reorderSchema,
          admin: true,
          tags: ["content"],
          detail: { summary: "Reorder screens (admin)" },
        },
      )
  );
}
