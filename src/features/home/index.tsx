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
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-4">
          <SearchBar />
          <StreakTracker />
          <PremiumCTA />
          <ComebackCard />
        </div>

        <div className="flex flex-col items-center">
          <CourseCard onStart={() => select('warmup')} />
          <CourseGrid />
        </div>
      </div>
    </main>
  )
}
