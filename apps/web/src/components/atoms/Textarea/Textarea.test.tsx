import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('renders accessibly and supports typing and error state', async () => {
    const user = userEvent.setup()
    const { container, rerender } = render(
      <div>
        <label htmlFor="log-content">Relato</label>
        <Textarea id="log-content" placeholder="Descreva sua descoberta..." />
      </div>,
    )

    const textarea = screen.getByLabelText('Relato')
    await user.type(textarea, 'Ilha do Céu avistada!')
    expect(textarea).toHaveValue('Ilha do Céu avistada!')
    expect(textarea).not.toHaveAttribute('aria-invalid')
    expect(await axe(container)).toHaveNoViolations()

    rerender(
      <div>
        <label htmlFor="log-content">Relato</label>
        <Textarea id="log-content" hasError defaultValue="Curto" />
      </div>,
    )

    expect(screen.getByLabelText('Relato')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
