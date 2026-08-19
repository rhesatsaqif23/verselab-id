// ShuffleCard: stacked deck of unit cards; drag the top card left/right to switch units.
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { units } from '#/content/index.ts'
import { useHomeStore } from '../store.ts'
import UnitCard from './UnitCard.tsx'

const SWIPE_THRESHOLD = 100

export default function ShuffleCard() {
  const selectedUnitId = useHomeStore((s) => s.selectedUnitId)
  const setSelectedUnit = useHomeStore((s) => s.setSelectedUnit)

  const index = Math.max(0, units.findIndex((u) => u.id === selectedUnitId))
  const current = units[index] ?? units[0]
  const prevUnit = units[(index - 1 + units.length) % units.length]
  const nextUnit = units[(index + 1) % units.length]

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-8, 8])

  function onDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const { offset, velocity } = info
    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
      setSelectedUnit(nextUnit.id)
    } else if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
      setSelectedUnit(prevUnit.id)
    }
  }

  return (
    <div className="relative">
      {/* Deck back layers */}
      <div
        aria-hidden
        className="absolute inset-0 -rotate-3 translate-y-3 scale-[0.97] rounded-2xl border-2 border-border bg-card"
      />
      <div
        aria-hidden
        className="absolute inset-0 rotate-1 translate-y-1.5 scale-[0.985] rounded-2xl border-2 border-border bg-card"
      />

      {/* Draggable top card */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={current.id}
          drag="x"
          dragElastic={0.6}
          dragSnapToOrigin
          style={{ x, rotate }}
          onDragEnd={onDragEnd}
          initial={{ scale: 0.96, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: -24 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="relative cursor-grab active:cursor-grabbing"
        >
          <UnitCard unit={current} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
