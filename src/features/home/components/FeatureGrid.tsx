import React from 'react'

export default function FeatureGrid({ items }: { items: Array<{ title: string; desc: string }> }) {
  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it, i) => (
        <article
          key={it.title}
          className="island-shell feature-card rise-in rounded-2xl p-5"
          style={{ animationDelay: `${i * 90 + 80}ms` }}
        >
          <h3 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">{it.title}</h3>
          <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{it.desc}</p>
        </article>
      ))}
    </section>
  )
}
