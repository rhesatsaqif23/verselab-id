import React from 'react'
import HeroCard from './components/HeroCard'
import FeatureGrid from './components/FeatureGrid'
import { useHomeStore } from './store'

export default function HomePage() {
  const streak = useHomeStore((s) => s.streak)
  const select = useHomeStore((s) => s.select)

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <HeroCard title="Exploring Data Visually" subtitle={`Solve 3 problems to start a streak`} onStart={() => select('warmup')} />

      <section className="island-shell mt-8 rounded-2xl p-6">
        <p className="island-kicker mb-2">It's comeback time</p>
        <h3 className="mb-2 text-lg font-semibold text-[var(--sea-ink)]">You previously finished #29</h3>
        <p className="text-sm text-[var(--sea-ink-soft)]">Streak: {streak}</p>
      </section>

      <FeatureGrid
        items={[
          ['Type-Safe Routing', 'Routes and links stay in sync across every page.'],
          ['Server Functions', 'Call server code from your UI without creating API boilerplate.'],
          ['Streaming by Default', 'Ship progressively rendered responses for faster experiences.'],
          ['Tailwind Native', 'Design quickly with utility-first styling and reusable tokens.'],
        ].map(([a, b]) => ({ title: a, desc: b }))}
      />
    </main>
  )
}
