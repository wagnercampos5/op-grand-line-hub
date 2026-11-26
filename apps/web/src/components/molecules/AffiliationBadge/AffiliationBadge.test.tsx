import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { AffiliationBadge } from './AffiliationBadge'

describe('AffiliationBadge', () => {
  it('renders localized labels for all four maritime affiliations with zero axe violations', async () => {
    const { container } = render(
      <div>
        <AffiliationBadge affiliation="PIRATE" />
        <AffiliationBadge affiliation="MARINE" />
        <AffiliationBadge affiliation="REVOLUTIONARY" />
        <AffiliationBadge affiliation="BOUNTY_HUNTER" />
      </div>,
    )

    expect(screen.getByText('Pirata')).toBeInTheDocument()
    expect(screen.getByText('Marinha')).toBeInTheDocument()
    expect(screen.getByText('Revolucionário')).toBeInTheDocument()
    expect(screen.getByText('Caçador de Recompensas')).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })
})
