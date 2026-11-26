import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { MainFeedLayout } from './MainFeedLayout'

describe('MainFeedLayout', () => {
  it('renders page landmarks, toggles mobile navigation drawer, and passes axe', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <MemoryRouter initialEntries={['/feed']}>
        <MainFeedLayout
          title="Crônicas da Grand Line"
          subtitle="Relatos e descobertas pelos quatro mares."
          badgeText="Diário de Bordo"
          user={null}
        >
          <p>Conteúdo principal do feed</p>
        </MainFeedLayout>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Crônicas da Grand Line' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Conteúdo principal do feed')).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()

    const menuBtn = screen.getByRole('button', { name: 'Menu' })
    await user.click(menuBtn)
    expect(
      screen.getByRole('button', { name: 'Fechar Menu' }),
    ).toHaveAttribute('aria-expanded', 'true')
    expect(await axe(container)).toHaveNoViolations()
  })
})
