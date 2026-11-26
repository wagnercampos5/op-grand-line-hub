import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { WantedStamp } from './WantedStamp'

describe('WantedStamp', () => {
  it('formats large Berries bounties and zeroText fallbacks without axe violations', async () => {
    const { container } = render(
      <div>
        <WantedStamp amount={3_000_000_000} labelPrefix="Recompensa:" />
        <WantedStamp
          amount={0}
          variant="crew"
          zeroText="Divisão de Espólios"
        />
      </div>,
    )

    expect(screen.getByText('฿ 3.000.000.000')).toBeInTheDocument()
    expect(screen.getByText('Divisão de Espólios')).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })
})
