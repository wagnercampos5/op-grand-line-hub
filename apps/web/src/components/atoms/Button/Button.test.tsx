import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('defaults to type="button" and handles clicks', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Zarpar</Button>)
    const button = screen.getByRole('button', { name: 'Zarpar' })

    expect(button).toHaveAttribute('type', 'button')
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disables interaction and sets aria-busy while loading', () => {
    render(<Button isLoading>Navegando...</Button>)
    const button = screen.getByRole('button', { name: 'Navegando...' })

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('has no accessibility violations across variants', async () => {
    const { container } = render(
      <div>
        <Button variant="primary">Primário</Button>
        <Button variant="secondary">Secundário</Button>
        <Button variant="outline">Contorno</Button>
        <Button variant="danger">Perigo</Button>
        <Button variant="ghost">Fantasma</Button>
      </div>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
