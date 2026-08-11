import SearchBar from './components/SearchBar'
import StreakTracker from './components/StreakTracker'
import CourseCard from './components/CourseCard'
import PremiumCTA from './components/PremiumCTA'
import ComebackCard from './components/ComebackCard'
import CourseGrid from './components/CourseGrid'
import { useHomeStore } from './store'

export default function HomePage() {
  const select = useHomeStore((s) => s.select)

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      <div className="mb-6">
        <SearchBar />
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <StreakTracker />
          <PremiumCTA />
          <ComebackCard />
        </div>

        <div>
          <CourseCard onStart={() => select('warmup')} />
        </div>
      </div>

      <CourseGrid />
    </main>
  )
}
