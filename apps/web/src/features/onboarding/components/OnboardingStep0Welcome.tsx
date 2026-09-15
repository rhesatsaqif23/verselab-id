// Step 0: Welcome greeting — pure text, mascot is rendered by the wizard.
export default function OnboardingStep0Welcome({ name }: { name?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center animate-slide-up-enter">
      <h1 className="text-3xl font-black tracking-tight text-foreground">
        Halo{name ? ` ${name}` : ""}!
      </h1>
      <p className="text-base leading-7 text-muted-foreground">Siap belajar sesuatu yang baru?</p>
    </div>
  );
}
