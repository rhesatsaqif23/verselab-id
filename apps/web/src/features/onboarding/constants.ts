// Onboarding constants: daily-goal mapping (re-exported from the shared package
// so the API and UI agree) plus the starting-unit picker options resolved from
// the curriculum.
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  Brain,
  GraduationCap,
  MoreHorizontal,
  Rocket,
  TrendingUp,
} from "lucide-react";
import { dailyGoalToMinutes, type DailyGoal } from "@verselab/shared/schemas/profile";
import { units } from "#/content/units.ts";
import { UNIT_ICONS } from "#/features/home/constants.ts";

export { dailyGoalToMinutes, type DailyGoal };

export const DAILY_GOAL_OPTIONS: {
  value: DailyGoal;
  label: string;
  description: string;
  minutes: number;
}[] = [
  { value: "casual", label: "Santai", description: "5 menit per hari", minutes: 5 },
  { value: "regular", label: "Rutin", description: "10 menit per hari", minutes: 10 },
  { value: "serious", label: "Serius", description: "20 menit per hari", minutes: 20 },
];

export const PURPOSE_OPTIONS: {
  value: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "karier", label: "Meningkatkan karier", icon: Briefcase },
  { value: "pendidikan", label: "Mendukung pendidikan", icon: GraduationCap },
  { value: "investasi", label: "Investasi & keuangan", icon: TrendingUp },
  { value: "wirausaha", label: "Wirausaha", icon: Rocket },
  { value: "pengembangan-diri", label: "Pengembangan diri", icon: Brain },
  { value: "lainnya", label: "Lainnya", icon: MoreHorizontal },
];

export const START_UNIT_OPTIONS: {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = units.map((u) => ({
  id: u.id,
  title: u.title,
  description: u.description,
  icon: UNIT_ICONS[u.id] ?? BookOpen,
}));

/** Speech-bubble text for each wizard step. */
export const STEP_BUBBLES: Record<number, (name?: string) => string> = {
  0: () => "Selamat datang di Verselab! 🚀",
  1: () => "Apa yang ingin kamu capai?",
  2: () => "Pilih topik yang ingin kamu pelajari dulu",
  3: () => "Seberapa sering kamu ingin belajar?",
  4: () => "Kamu siap! Ayo mulai petualanganmu!",
};
