import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../../contexts/AuthContext'
import * as authService from '../../../services/auth.service'
import { RegisterPage } from './RegisterPage'

vi.mock('../../../services/auth.service', () => ({
  loginRequest: vi.fn(),
  registerUserRequest: vi.fn(),
  fetchCurrentUserRequest: vi.fn(),
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders register form, creates account, auto-logs in, and redirects to /feed', async () => {
    const user = userEvent.setup()
    const createdUser = {
      id: '11111111-1111-4111-8111-111111111103',
      name: 'Roronoa Zoro',
      email: 'zoro@thousand-sunny.gl',
      affiliation: 'BOUNTY_HUNTER' as const,
      bounty: 0,
      createdAt: '2026-11-25T00:00:00.000Z',
    }
    vi.mocked(authService.registerUserRequest).mockResolvedValue(createdUser)
    vi.mocked(authService.loginRequest).mockResolvedValue({
      access_token: 'jwt-zoro',
    })
    vi.mocked(authService.fetchCurrentUserRequest).mockResolvedValue(createdUser)

    render(
      <MemoryRouter initialEntries={['/register']}>
        <AuthProvider>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/feed" element={<h1>Bem-vindo ao Feed</h1>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Aliste-se na Rota' }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Nome ou Alcunha/i), 'Roronoa Zoro')
    await user.selectOptions(
      screen.getByLabelText(/Afiliação/i),
      'BOUNTY_HUNTER',
    )
    await user.type(screen.getByLabelText(/E-mail/i), 'zoro@thousand-sunny.gl')
    await user.type(screen.getByLabelText(/^Senha/i), 'Santoryu@2026')
    await user.type(screen.getByLabelText(/Confirmar Senha/i), 'Santoryu@2026')

    await user.click(
      screen.getByRole('button', { name: 'Assinar Manifesto de Tripulante' }),
    )

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Bem-vindo ao Feed' }),
      ).toBeInTheDocument()
    })
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
