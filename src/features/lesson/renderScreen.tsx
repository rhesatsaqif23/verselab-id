// Screen dispatcher: maps any engine Screen to the matching domain renderer.
import type { ReactNode } from 'react'
import type { Screen } from '#/engine/types.ts'
import ChoiceRenderer from '#/domains/personal-finance/screens/ChoiceRenderer.tsx'
import ConceptRenderer from '#/domains/personal-finance/screens/ConceptRenderer.tsx'
import NumericRenderer from '#/domains/personal-finance/screens/NumericRenderer.tsx'
import AllocationRenderer from '#/domains/personal-finance/screens/AllocationRenderer.tsx'

export function renderScreen(
  screen: Screen,
  onChange: (answer: unknown) => void,
  checked: boolean | null,
): ReactNode {
  switch (screen.type) {
    case 'concept':
      return <ConceptRenderer screen={screen} />
    case 'choice':
      return <ChoiceRenderer screen={screen} onSelect={(id) => onChange(id)} checked={checked} />
    case 'numeric':
      return <NumericRenderer screen={screen} onChange={(value) => onChange(value)} checked={checked} />
    case 'allocation':
      return (
        <AllocationRenderer
          screen={screen}
          onChange={(allocation) => onChange(allocation)}
          checked={checked}
        />
      )
  }
}
