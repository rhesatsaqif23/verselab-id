import {
  BarChart3,
  PieChart,
  Target,
  Lightbulb,
  Briefcase,
  Check,
} from "lucide-react";
import { Card } from "#/components/ui/card";

const courses = [
  {
    title: "Web Dev",
    icon: Briefcase,
    color: "text-(--color-accent)",
    bg: "bg-(--color-accent/10)",
    active: true,
    completed: true,
  },
  {
    title: "Finance",
    icon: PieChart,
    color: "text-(--color-pink)",
    bg: "bg-(--color-muted)",
    active: false,
    completed: false,
  },
  {
    title: "Strategy",
    icon: Target,
    color: "text-(--color-primary)",
    bg: "bg-(--color-muted)",
    active: false,
    completed: false,
  },
  {
    title: "Data",
    icon: BarChart3,
    color: "text-(--color-secondary)",
    bg: "bg-(--color-muted)",
    active: false,
    completed: false,
  },
  {
    title: "Creative",
    icon: Lightbulb,
    color: "text-(--color-accent)",
    bg: "bg-(--color-muted)",
    active: false,
    completed: false,
  },
];

export default function CourseGrid() {
  return (
    <section className="mt-8">
      <div className="flex justify-center gap-3">
        {courses.map((course) => (
          <Card
            key={course.title}
            className={`relative flex h-20 w-24 cursor-pointer flex-col items-center justify-center gap-1 border-2 p-2 transition hover:-translate-y-0.5 bg-card ${
              course.active
                ? "border-accent"
                : "border-border"
            }`}
          >
            {course.completed && (
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
            <course.icon className={`h-7 w-7 ${course.color}`} />
          </Card>
        ))}
      </div>
    </section>
  );
}
