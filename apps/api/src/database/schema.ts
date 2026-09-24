import {
  pgEnum,
  pgTable,
  integer,
  real,
  text,
  timestamp,
  date,
  primaryKey,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth-schema.ts";

export const dailyGoalEnum = pgEnum("daily_goal", ["casual", "regular", "serious"]);

export const purposeEnum = pgEnum("purpose", [
  "karier",
  "pendidikan",
  "investasi",
  "wirausaha",
  "pengembangan-diri",
  "lainnya",
]);

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  startUnitId: text("start_unit_id"),
  dailyGoal: dailyGoalEnum("daily_goal").default("regular"),
  purpose: purposeEnum("purpose"),
  onboardedAt: timestamp("onboarded_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  streakFreeze: integer("streak_freeze").notNull().default(0),
  lastActiveDate: date("last_active_date"),
  completedLessons: text("completed_lessons").array().notNull().default([]),
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userUnitProgress = pgTable(
  "user_unit_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    unitId: text("unit_id").notNull(),
    mastery: integer("mastery").notNull().default(0),
    masteryUpdatedAt: timestamp("mastery_updated_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.unitId] }),
  }),
);

export const userDailyActivity = pgTable(
  "user_daily_activity",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.date] }),
  }),
);

// ── Content tables (units, lessons, screens) ────────────────────────────────

export const screenTypeEnum = pgEnum("screen_type", ["concept", "choice", "numeric", "allocation"]);

export const contentUnits = pgTable(
  "content_units",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    sortIdx: index("content_units_sort_idx").on(t.sortOrder),
    slugIdx: uniqueIndex("content_units_slug_idx").on(t.slug),
  }),
);

export const contentLessons = pgTable(
  "content_lessons",
  {
    id: text("id").primaryKey(),
    unitId: text("unit_id")
      .notNull()
      .references(() => contentUnits.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    icon: text("icon"),
    imageUrl: text("image_url"),
    prerequisiteIds: text("prerequisite_ids").array(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    unitIdx: index("content_lessons_unit_idx").on(t.unitId),
    sortIdx: index("content_lessons_sort_idx").on(t.unitId, t.sortOrder),
    slugIdx: uniqueIndex("content_lessons_slug_idx").on(t.slug),
    unitTitleIdx: uniqueIndex("content_lessons_unit_title_idx").on(
      t.unitId,
      sql`lower(trim(${t.title}))`,
    ),
  }),
);

export const contentScreens = pgTable(
  "content_screens",
  {
    id: text("id").primaryKey(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => contentLessons.id, { onDelete: "cascade" }),
    type: screenTypeEnum("type").notNull(),
    slug: text("slug").notNull(),
    prompt: text("prompt").notNull(),
    explain: text("explain").notNull(),
    // choice fields
    options: jsonb("options"),
    correctId: text("correct_id"),
    // numeric fields
    numericUnit: text("numeric_unit"),
    acceptRangeMin: real("accept_range_min"),
    acceptRangeMax: real("accept_range_max"),
    // allocation fields
    categories: text("categories").array(),
    rule: jsonb("rule"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    lessonIdx: index("content_screens_lesson_idx").on(t.lessonId),
    sortIdx: index("content_screens_sort_idx").on(t.lessonId, t.sortOrder),
    slugIdx: uniqueIndex("content_screens_slug_idx").on(t.slug),
  }),
);
