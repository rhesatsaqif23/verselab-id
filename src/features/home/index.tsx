import StreakTracker from './components/StreakTracker'
import DailyGoalCard from './components/DailyGoalCard'
import CourseCard from './components/CourseCard'
import CourseGrid from './components/CourseGrid'

export default function HomePage() {
  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-4">
          <StreakTracker />
          <DailyGoalCard />
        </div>

        <div className="flex flex-col gap-4">
          <CourseCard />
          <CourseGrid />
        </div>
      </div>
    </main>
  )
}
