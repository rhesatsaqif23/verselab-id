// HomePage: dashboard layout combining streak, goal, and course cards.
import StreakTracker from './components/StreakTracker'
import DailyGoalCard from './components/DailyGoalCard'
import UnitCard from './components/UnitCard'
import UnitGrid from './components/UnitGrid'

export default function HomePage() {
  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-4">
          <StreakTracker />
          <DailyGoalCard />
        </div>

        <div className="flex flex-col gap-4">
          <UnitCard />
          <UnitGrid />
        </div>
      </div>
    </main>
  )
}
