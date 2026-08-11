import React from 'react'

export default function HeroCard({ title, subtitle, onStart }: { title: string; subtitle?: string; onStart?: () => void }) {
  return (
    <div className="island-shell rise-in rounded-2xl p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="col-span-2">
          <p className="island-kicker mb-2">{subtitle ?? 'Level 1'}</p>
          <h2 className="display-title text-3xl font-bold text-[var(--sea-ink)]">{title}</h2>
          <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">Explore interactive warmups and lessons crafted to help you learn faster.</p>
        </div>
        <div className="flex justify-center sm:justify-end">
          <button
            onClick={onStart}
            className="rounded-full bg-[var(--lagoon)] px-6 py-3 text-sm font-semibold text-white shadow-md hover:brightness-105"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  )
}
