// Step 0: Welcome greeting — no input, just the mascot and a continue button.
import MascotBubble from "./MascotBubble";

export default function OnboardingStep0Welcome({ name }: { name?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center animate-slide-up-enter">
      <MascotBubble />
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Halo{name ? ` ${name}` : ""}!
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Siap belajar sesuatu yang baru?
        </p>
      </div>
    </div>
  );
}
