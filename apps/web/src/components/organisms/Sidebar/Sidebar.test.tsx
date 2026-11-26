import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  it('shows profile, Berries bounty, and Sair button when authenticated', async () => {
    const user = userEvent.setup()
    const onLogout = vi.fn()

    const { container } = render(
      <MemoryRouter initialEntries={['/feed']}>
        <Sidebar
          user={{
            id: '1',
            name: 'Monkey D. Luffy',
            email: 'luffy@thousand-sunny.gl',
            affiliation: 'PIRATE',
            bounty: 3_000_000_000,
            createdAt: '2026-11-20T00:00:00.000Z',
          }}
          onLogout={onLogout}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Monkey D. Luffy')).toBeInTheDocument()
    expect(screen.getByText('฿ 3.000.000.000')).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()

    await user.click(screen.getByRole('button', { name: 'Sair' }))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  it('shows Entrar and Alistar-se links for unauthenticated visitors', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/contracts']}>
        <Sidebar user={null} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(screen.getByRole('link', { name: 'Alistar-se' })).toHaveAttribute(
      'href',
      '/register',
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
