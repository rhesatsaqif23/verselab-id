// Landing page: marketing hero and feature highlights.
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, BrainCircuit, Target, Trophy } from "lucide-react";
import { Button } from "#/components/ui/button";
import Footer from "#/features/layout/components/Footer.tsx";
import ThemeToggle from "#/features/layout/components/ThemeToggle.tsx";

const features = [
  {
    icon: BrainCircuit,
    title: "Belajar dengan Interaktif",
    desc: "Setiap konsep disampaikan lewat soal pendek yang langsung menguji pemahamanmu — bukan sekadar baca materi.",
  },
  {
    icon: Target,
    title: "Latihan Soal Langsung",
    desc: "Soal pilihan ganda, hitungan, dan alokasi dibuat dinamis dari angka yang kamu isi sendiri.",
  },
  {
    icon: Trophy,
    title: "XP dan Streak Harian",
    desc: "Kumpulkan XP dan jaga streak harian supaya kebiasaan belajarmu tetap terjaga.",
  },
];

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-border/80 bg-background/85 px-4 backdrop-blur-md transition-all md:px-16">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-accent font-black text-white shadow-xs">
            V
          </div>
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Verselab
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild variant="default" size="lg" className="font-bold">
            <Link to="/home">
              Mulai belajar
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="page-wrap px-4 pb-16 pt-14 text-center sm:pt-20">
          <p className="text-base font-bold mb-4 tracking-wider uppercase">
            Interactive skill learning
          </p>
          <h1 className="display-title mx-auto max-w-3xl text-4xl font-black leading-tight text-foreground sm:text-6xl">
            Pelajari keterampilan baru dengan cara yang{" "}
            <span className="bg-linear-to-r from-(--btn-from) to-(--btn-to) bg-clip-text text-transparent">
              menyenangkan
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Verselab mengubah materi menjadi pelajaran interaktif singkat. Jawab soal, raih XP,
            pertahankan streak, dan lihat pemahamanmu tumbuh hari demi hari.
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
              <h2 className="mt-4 text-lg font-black text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
