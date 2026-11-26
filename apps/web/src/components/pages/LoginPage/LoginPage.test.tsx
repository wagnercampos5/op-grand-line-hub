import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../../contexts/AuthContext'
import * as authService from '../../../services/auth.service'
import { LoginPage } from './LoginPage'

vi.mock('../../../services/auth.service', () => ({
  loginRequest: vi.fn(),
  registerUserRequest: vi.fn(),
  fetchCurrentUserRequest: vi.fn(),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders login banner and authenticates user navigating to /feed', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.loginRequest).mockResolvedValue({
      access_token: 'jwt-luffy',
    })
    vi.mocked(authService.fetchCurrentUserRequest).mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111102',
      name: 'Monkey D. Luffy',
      email: 'luffy@thousand-sunny.gl',
      affiliation: 'PIRATE',
      bounty: 3_000_000_000,
      createdAt: '2026-11-20T00:00:00.000Z',
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/feed" element={<h1>Feed Destino</h1>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Retorne ao Convés' }),
    ).toBeInTheDocument()
    expect(
      screen.getByAltText(
        'Navio navegando pela névoa da Grand Line com Log Pose iluminado no convés',
      ),
    ).toHaveAttribute('src', '/banner-login.jpg')

    await user.type(
      screen.getByLabelText(/E-mail/i),
      'luffy@thousand-sunny.gl',
    )
    await user.type(screen.getByLabelText(/Senha/i), 'GrandLine@2026')
    await user.click(
      screen.getByRole('button', { name: 'Zarpar para a Grand Line' }),
    )

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Feed Destino' }),
      ).toBeInTheDocument()
    })
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
