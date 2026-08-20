import { useCallback, useRef, useState } from 'react'
import { units } from '#/content/index.ts'
import { useHomeStore } from '../store.ts'
import UnitCard from './UnitCard.tsx'

const SWIPE_THRESHOLD = 120
const DRAG_DIVISOR = 400

function restStyle(distance: number) {
  if (distance === 0) {
    return { transform: 'translateX(0) translateY(0) scale(1)', opacity: 1, zIndex: 30 }
  }
  const abs = Math.abs(distance)
  return {
    transform: `translateX(${abs * 10}px) translateY(${abs * 10}px) scale(1)`,
    opacity: 1,
    zIndex: 30 - abs,
  }
}

export default function ShuffleCard() {
  const selectedUnitId = useHomeStore((s) => s.selectedUnitId)
  const setSelectedUnit = useHomeStore((s) => s.setSelectedUnit)
  const activeIndex = Math.max(0, units.findIndex((u) => u.id === selectedUnitId))
  const prevUnit = units[(activeIndex - 1 + units.length) % units.length]
  const nextUnit = units[(activeIndex + 1) % units.length]

  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
      ; (e.target as HTMLElement).setPointerCapture(e.pointerId)
    startX.current = e.clientX
    setDragging(true)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      setDragX(e.clientX - startX.current)
    },
    [dragging],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      ; (e.target as HTMLElement).releasePointerCapture(e.pointerId)
      setDragging(false)
      if (dragX < -SWIPE_THRESHOLD) {
        setSelectedUnit(nextUnit.id)
      } else if (dragX > SWIPE_THRESHOLD) {
        setSelectedUnit(prevUnit.id)
      }
      setDragX(0)
    },
    [dragX, nextUnit.id, prevUnit.id, setSelectedUnit],
  )

  const progress = Math.min(1, Math.abs(dragX) / DRAG_DIVISOR)
  const sign = dragX < 0 ? -1 : dragX > 0 ? 1 : 0

  return (
    <div className="relative overflow-hidden px-6 pt-2 pb-8">
      {units.map((unit, i) => {
        const distance = ((i - activeIndex + units.length) % units.length)
        const isFront = distance === 0

        if (isFront) {
          return (
            <div
              key={unit.id}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={{
                position: 'relative',
                zIndex: 30,
                transform: `translateX(${sign * progress * 45}%) scale(${1 - progress * 0.5})`,
                transition: dragging ? 'none' : 'all 0.45s cubic-bezier(0.25, 0.1, 0.25, 1)',
                cursor: dragging ? 'grabbing' : 'grab',
                touchAction: 'pan-y',
                userSelect: 'none',
              }}
            >
              <UnitCard unit={unit} />
            </div>
          )
        }

        return (
          <div
            key={unit.id}
            aria-hidden
            className="absolute inset-x-6 top-2"
            style={{
              ...restStyle(distance),
              transition: 'all 0.45s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            <UnitCard unit={unit} />
          </div>
        )
      })}
    </div>
  )
}
