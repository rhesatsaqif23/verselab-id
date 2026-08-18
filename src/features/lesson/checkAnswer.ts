// Answer checker: decides whether a submitted answer is correct per screen type.
import type { Screen } from '#/engine/types.ts'

export function checkAnswer(screen: Screen, answer: unknown): boolean {
  switch (screen.type) {
    case 'choice':
      return answer === screen.correctId
    case 'numeric':
      return (
        typeof answer === 'number' &&
        answer >= screen.acceptRange[0] &&
        answer <= screen.acceptRange[1]
      )
    case 'allocation': {
      if (typeof answer !== 'object' || answer === null) return false
      const allocation = answer as Record<string, number>
      const value = allocation[screen.rule.category]
      if (typeof value !== 'number') return false
      if (screen.rule.min !== undefined && value < screen.rule.min) return false
      if (screen.rule.max !== undefined && value > screen.rule.max) return false
      return true
    }
    case 'concept':
      return false
  }
}
