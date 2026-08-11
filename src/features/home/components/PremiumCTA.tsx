import { Sparkles } from 'lucide-react'
import { Button } from '#/components/ui/button'

export default function PremiumCTA() {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-border bg-card">
      <div
        className="relative p-5"
        style={{
          background: `linear-gradient(to bottom right, var(--premium-card-from), var(--premium-card-via), var(--premium-card-to))`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: `linear-gradient(to bottom right, var(--premium-icon-from), var(--premium-icon-to))`,
            }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-extrabold text-foreground">
              Unlock all learning with Premium
            </p>
            <p className="text-sm font-semibold text-foreground">
              to get smarter, faster
            </p>
          </div>
        </div>

        <Button className="mt-4 w-full" size="lg">
          Explore Premium
        </Button>
      </div>
    </div>
  )
}
