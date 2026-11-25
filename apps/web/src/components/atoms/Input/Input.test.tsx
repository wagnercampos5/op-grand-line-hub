import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('accepts user input and reflects error state via aria-invalid', async () => {
    const user = userEvent.setup()
    render(<Input aria-label="Alcunha" placeholder="Chapéu de Palha" hasError />)

    const input = screen.getByLabelText('Alcunha')
    expect(input).toHaveAttribute('aria-invalid', 'true')

    await user.type(input, 'Monkey D. Luffy')
    expect(input).toHaveValue('Monkey D. Luffy')
  })

  it('respects disabled state', () => {
    render(<Input aria-label="E-mail" disabled />)
    expect(screen.getByLabelText('E-mail')).toBeDisabled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Input aria-label="E-mail de navegação" type="email" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
