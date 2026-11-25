import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders children and applies semantic variant classes', () => {
    render(<Badge variant="gold">Recompensa</Badge>)
    const badge = screen.getByText('Recompensa')

    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('text-treasure-gold')
  })

  it('has no accessibility violations across variants', async () => {
    const { container } = render(
      <div>
        <Badge variant="gold">Ouro</Badge>
        <Badge variant="info">Log Pose</Badge>
        <Badge variant="danger">Procurado</Badge>
        <Badge variant="neutral">Neutro</Badge>
      </div>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
