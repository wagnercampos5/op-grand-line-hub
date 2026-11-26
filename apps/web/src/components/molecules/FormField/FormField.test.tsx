import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { FormField } from './FormField'

describe('FormField', () => {
  it('links Label, Input, helperText, and error message via aria-describedby', () => {
    render(
      <FormField
        label="E-mail"
        type="email"
        required
        helperText="Use seu endereço de Den Den Mushi."
        error="E-mail inválido."
      />,
    )

    const input = screen.getByLabelText(/E-mail/i)
    const alert = screen.getByRole('alert')

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(alert).toHaveTextContent('E-mail inválido.')
    expect(input.getAttribute('aria-describedby')).toContain(alert.id)
  })

  it('renders a Select when options are provided', () => {
    render(
      <FormField
        label="Afiliação"
        defaultValue="PIRATE"
        options={[
          { value: 'PIRATE', label: 'Pirata' },
          { value: 'MARINE', label: 'Marinha' },
        ]}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Afiliação' })).toHaveValue(
      'PIRATE',
    )
  })

  it('renders a Textarea when multiline is true', () => {
    render(
      <FormField
        label="Relato Completo"
        multiline
        rows={5}
        defaultValue="Diário de bordo da rota para Skypiea."
      />,
    )

    expect(
      screen.getByRole('textbox', { name: 'Relato Completo' }),
    ).toHaveValue('Diário de bordo da rota para Skypiea.')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FormField
        label="Alcunha"
        placeholder="Ex: Roronoa Zoro"
        helperText="Como você é conhecido nos mares."
      />,
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
