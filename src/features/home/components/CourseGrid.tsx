import { BarChart3, PieChart, Target, Lightbulb, Briefcase } from 'lucide-react'
import { Button } from '#/components/ui/button'

const courses = [
  { title: 'Project Management', icon: Briefcase, color: 'from-primary/15 to-primary/5', iconColor: 'text-primary' },
  { title: 'Financial Accounting', icon: PieChart, color: 'from-accent/15 to-accent/5', iconColor: 'text-accent' },
  { title: 'Data Analysis', icon: BarChart3, color: 'from-[#F97316]/15 to-[#F97316]/5', iconColor: 'text-[#F97316]' },
  { title: 'Strategic Planning', icon: Target, color: 'from-[#8B5CF6]/15 to-[#8B5CF6]/5', iconColor: 'text-[#8B5CF6]' },
  { title: 'Creative Thinking', icon: Lightbulb, color: 'from-[#EAB308]/15 to-[#EAB308]/5', iconColor: 'text-[#EAB308]' },
]

export default function CourseGrid() {
  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-bold text-foreground">Continue Learning</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {courses.map((course) => (
          <Button
            key={course.title}
            variant="ghost"
            className="feature-card flex h-auto flex-col items-center gap-3 rounded-2xl border-2 border-border p-4 text-center transition hover:-translate-y-0.5"
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${course.color}`}>
              <course.icon className={`h-7 w-7 ${course.iconColor}`} />
            </div>
            <span className="text-xs font-semibold">{course.title}</span>
          </Button>
        ))}
      </div>
    </section>
  )
}
