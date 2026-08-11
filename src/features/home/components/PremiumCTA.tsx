import { Sparkles } from 'lucide-react'

export default function PremiumCTA() {
  return (
    <div className="island-shell overflow-hidden rounded-2xl">
      <div className="relative bg-gradient-to-br from-[#F3E8FF] via-[#FFF1E6] to-[#FFE8D6] p-5 dark:from-[#2D1B4E] dark:via-[#3D2015] dark:to-[#2D1B15]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#9333EA] to-[#F97316]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              Unlock all learning with Premium
            </p>
            <p className="text-xs text-muted-foreground">
              to get smarter, faster
            </p>
          </div>
        </div>

        <button className="mt-4 h-11 w-full rounded-full bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F97316] text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]">
          Explore Premium
        </button>
      </div>
    </div>
  )
}
