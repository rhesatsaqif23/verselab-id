// AboutPage: static overview of what Verselab teaches.
export default function AboutPage() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">About</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-foreground sm:text-5xl">
          Learn skills interactively.
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-muted-foreground">
          Verselab makes professional skill development engaging through interactive lessons,
          real-world projects, and gamified progress tracking. From project management to financial
          accounting, master the skills that matter.
        </p>
      </section>
    </main>
  );
}
