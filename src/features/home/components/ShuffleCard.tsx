// ShuffleCard: stacked card carousel; drag the front card left/right to cycle through units.
import { useState } from 'react'
import { motion, type PanInfo } from 'framer-motion'
import { units } from '#/content/index.ts'
import { useHomeStore } from '../store.ts'
import UnitCard from './UnitCard.tsx'

const SWIPE_THRESHOLD = 90

function stackStyle(distance: number) {
  if (distance === 0) {
    return {
      transform: 'translateX(0) translateY(0) scale(1) rotate(0deg)',
      opacity: 1,
      zIndex: 30,
    }
  }
  const abs = Math.abs(distance)
  return {
    transform: `translateX(${distance * 24}px) translateY(${-abs * 14}px) scale(${1 - abs * 0.05}) rotate(${distance > 0 ? -1.5 : 1.5}deg)`,
    opacity: Math.max(0, 1 - abs * 0.3),
    zIndex: 30 - abs,
  }
}

export default function ShuffleCard() {
  const selectedUnitId = useHomeStore((s) => s.selectedUnitId)
  const setSelectedUnit = useHomeStore((s) => s.setSelectedUnit)
  const [dragX, setDragX] = useState(0)

  const activeIndex = Math.max(0, units.findIndex((u) => u.id === selectedUnitId))
  const prevUnit = units[(activeIndex - 1 + units.length) % units.length]
  const nextUnit = units[(activeIndex + 1) % units.length]

  function onDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info
    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -400) {
      setSelectedUnit(nextUnit.id)
    } else if (offset.x > SWIPE_THRESHOLD || velocity.x > 400) {
      setSelectedUnit(prevUnit.id)
    }
    setDragX(0)
  }

  return (
    <div className="relative overflow-hidden pb-4">
      {units.map((unit, i) => {
        const distance = ((i - activeIndex + units.length) % units.length)
        const isFront = distance === 0

        if (isFront) {
          return (
            <motion.div
              key={unit.id}
              drag="x"
              dragDirectionLock
              dragElastic={0.15}
              dragSnapToOrigin
              onDragEnd={onDragEnd}
              onDrag={(_, info) => setDragX(info.offset.x)}
              style={{ ...stackStyle(0), x: dragX }}
              className="relative cursor-grab active:cursor-grabbing"
            >
              <UnitCard unit={unit} />
            </motion.div>
          )
        }

        return (
          <div
            key={unit.id}
            aria-hidden
            className="absolute inset-x-0 top-0"
            style={{
              ...stackStyle(distance),
              transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            <UnitCard unit={unit} />
          </div>
        )
      })}
    </div>
  )
}
