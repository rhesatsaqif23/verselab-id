import {
  PiggyBank,
  TrendingUp,
  PieChart,
  CreditCard,
  Scale,
  ArrowLeftRight,
  FileText,
  Banknote,
  Search,
  ListFilter,
  BarChart3,
  Rocket,
  Coins,
  Target,
  Tag,
  Lightbulb,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export const LESSON_ICON_MAP: Record<string, LucideIcon> = {
  PiggyBank,
  TrendingUp,
  PieChart,
  CreditCard,
  Scale,
  ArrowLeftRight,
  FileText,
  Banknote,
  Search,
  ListFilter,
  BarChart3,
  Rocket,
  Coins,
  Target,
  Tag,
  Lightbulb,
  BookOpen,
};

export function getLessonIcon(name?: string): LucideIcon {
  if (!name) return BookOpen;
  return LESSON_ICON_MAP[name] ?? BookOpen;
}
