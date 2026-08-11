import { Trophy } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'

export default function ComebackCard() {
  return (
    <Card className="text-center">
      <CardContent className="p-5">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-accent/15">
          <Trophy className="h-7 w-7 text-primary" />
        </div>
        <h3 className="mb-1 text-base font-extrabold text-foreground">
          It's comeback time
        </h3>
        <p className="text-sm font-semibold text-muted-foreground">
          Continue where you left off and keep your momentum going
        </p>
      </CardContent>
    </Card>
  )
}
