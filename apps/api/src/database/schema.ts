import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.ts";

export const dailyGoalEnum = pgEnum("daily_goal", ["casual", "regular", "serious"]);

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id),
  displayName: text("display_name"),
  startUnitId: text("start_unit_id"),
  dailyGoal: dailyGoalEnum("daily_goal").default("regular"),
  onboardedAt: timestamp("onboarded_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
