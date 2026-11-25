import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { Select } from './Select'

const affiliationOptions = [
  { value: 'PIRATE', label: 'Pirata' },
  { value: 'MARINE', label: 'Marinha' },
  { value: 'REVOLUTIONARY', label: 'Revolucionário' },
  { value: 'BOUNTY_HUNTER', label: 'Caçador de Recompensas' },
] as const

describe('Select', () => {
  it('renders options and allows selection', async () => {
    const user = userEvent.setup()
    render(
      <Select
        aria-label="Afiliação"
        defaultValue=""
        placeholder="Selecione sua afiliação"
        options={affiliationOptions}
      />,
    )

    const select = screen.getByLabelText('Afiliação')
    await user.selectOptions(select, 'MARINE')
    expect(select).toHaveValue('MARINE')
  })

  it('sets aria-invalid when hasError is true', () => {
    render(
      <Select
        aria-label="Afiliação"
        options={affiliationOptions}
        hasError
      />,
    )

    expect(screen.getByLabelText('Afiliação')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Select aria-label="Afiliação" options={affiliationOptions} />,
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
