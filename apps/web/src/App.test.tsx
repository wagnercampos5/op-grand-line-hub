import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './routes/AppRoutes'

describe('AppRoutes', () => {
  it('redirects root path to /login and navigates between Login and Register client-side', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Retorne ao Convés' }),
    ).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()

    await user.click(screen.getByRole('link', { name: 'Aliste-se agora' }))

    expect(
      screen.getByRole('heading', { level: 1, name: 'Aliste-se na Rota' }),
    ).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()

    await user.click(screen.getByRole('link', { name: 'Entrar na conta' }))

    expect(
      screen.getByRole('heading', { level: 1, name: 'Retorne ao Convés' }),
    ).toBeInTheDocument()
  })
})
