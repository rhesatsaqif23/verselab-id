// Landing page route: marketing hero and feature highlights.
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen, BrainCircuit, Target, Trophy } from 'lucide-react'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

const features = [
  {
    icon: BrainCircuit,
    title: 'Belajar dengan interaktif',
    desc: 'Setiap konsep disampaikan lewat soal pendek yang langsung menguji pemahamanmu — bukan sekadar baca materi.',
  },
  {
    icon: Target,
    title: 'Latihan soal langsung',
    desc: 'Soal pilihan ganda, hitungan, dan alokasi dibuat dinamis dari angka yang kamu isi sendiri.',
  },
  {
    icon: Trophy,
    title: 'XP dan streak harian',
    desc: 'Kumpulkan XP dan jaga streak harian supaya kebiasaan belajarmu tetap terjaga.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="page-wrap flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-3xl font-bold tracking-tight text-foreground">Verselab</span>
        </Link>
        <Button asChild variant="default" size="sm">
          <Link to="/home">
            Mulai belajar
            <ArrowRight />
          </Link>
        </Button>
      </header>

      <main className="flex-1">
        <section className="page-wrap px-4 pb-16 pt-14 text-center sm:pt-20">
          <p className="island-kicker mb-4">Interactive skill learning</p>
          <h1 className="display-title mx-auto max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-6xl">
            Pelajari keterampilan baru dengan cara yang{' '}
            <span className="bg-linear-to-r from-(--btn-from) to-(--btn-to) bg-clip-text text-transparent">
              menyenangkan
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Verselab mengubah materi menjadi pelajaran interaktif singkat. Jawab soal,
            raih XP, pertahankan streak, dan lihat pemahamanmu tumbuh hari demi hari.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/home">
                Mulai belajar sekarang
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link to="/about">
                <BookOpen />
                Jelajahi materi
              </Link>
            </Button>
          </div>
        </section>

        <section className="page-wrap grid gap-6 px-4 pb-20 pt-8 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="feature-card rounded-2xl p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-(--premium-icon-from) to-(--premium-icon-to)">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="site-footer px-4 pb-10 pt-8">
        <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Verselab. All rights reserved.
          </p>
          <Button asChild variant="link" size="sm">
            <Link to="/home">Masuk ke pelajaran</Link>
          </Button>
        </div>
      </footer>
    </div>
  )
}