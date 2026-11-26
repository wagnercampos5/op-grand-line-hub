import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('extracts initials ignoring middle initials like D. and passes axe', async () => {
    const { container } = render(
      <div>
        <Avatar name="Monkey D. Luffy" decorative={false} />
        <Avatar name="Sabo" size="sm" />
      </div>,
    )

    expect(
      screen.getByRole('img', { name: 'Avatar de Monkey D. Luffy' }),
    ).toHaveTextContent('ML')
    expect(screen.getByText('SA')).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })
})
