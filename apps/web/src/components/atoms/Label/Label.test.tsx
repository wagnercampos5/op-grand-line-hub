import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { Label } from './Label'

describe('Label', () => {
  it('associates with input via htmlFor and renders required indicator', () => {
    render(
      <div>
        <Label htmlFor="pirate-email" requiredIndicator>
          E-mail
        </Label>
        <input id="pirate-email" type="email" required />
      </div>,
    )

    const label = screen.getByText('E-mail')
    expect(label).toHaveAttribute('for', 'pirate-email')
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="crew-name">Tripulação</Label>
        <input id="crew-name" type="text" />
      </div>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
