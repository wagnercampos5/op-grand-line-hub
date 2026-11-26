import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_TOKEN_STORAGE_KEY } from '../services/api'
import * as authService from '../services/auth.service'
import type { User } from '../types/domain'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('../services/auth.service', () => ({
  loginRequest: vi.fn(),
  registerUserRequest: vi.fn(),
  fetchCurrentUserRequest: vi.fn(),
}))

const MOCK_USER: User = {
  id: '11111111-1111-4111-8111-111111111101',
  name: 'Nico Robin',
  email: 'nico.robin@ohara.gl',
  affiliation: 'PIRATE',
  bounty: 930_000_000,
  createdAt: '2026-11-20T10:00:00.000Z',
}

function AuthConsumerProbe() {
  const { user, isAuthenticated, login, register, logout } = useAuth()

  return (
    <div>
      <p data-testid="auth-status">
        {isAuthenticated ? `Logado: ${user?.name}` : 'Visitante'}
      </p>
      <button
        type="button"
        onClick={() =>
          void login({
            email: 'nico.robin@ohara.gl',
            password: 'GrandLine@2026',
          })
        }
      >
        Fazer Login
      </button>
      <button
        type="button"
        onClick={() =>
          void register({
            name: 'Nico Robin',
            email: 'nico.robin@ohara.gl',
            password: 'GrandLine@2026',
            affiliation: 'PIRATE',
          })
        }
      >
        Cadastrar
      </button>
      <button type="button" onClick={logout}>
        Sair
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('starts as visitor when no token is stored and handles login + logout', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.loginRequest).mockResolvedValue({
      access_token: 'jwt-robin',
    })
    vi.mocked(authService.fetchCurrentUserRequest).mockResolvedValue(MOCK_USER)

    render(
      <AuthProvider>
        <AuthConsumerProbe />
      </AuthProvider>,
    )

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Visitante')

    await user.click(screen.getByRole('button', { name: 'Fazer Login' }))

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'Logado: Nico Robin',
      )
    })
    expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe(
      'jwt-robin',
    )

    await user.click(screen.getByRole('button', { name: 'Sair' }))
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Visitante')
    expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('registers user and automatically authenticates into session', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.registerUserRequest).mockResolvedValue(MOCK_USER)
    vi.mocked(authService.loginRequest).mockResolvedValue({
      access_token: 'jwt-new-crew',
    })
    vi.mocked(authService.fetchCurrentUserRequest).mockResolvedValue(MOCK_USER)

    render(
      <AuthProvider>
        <AuthConsumerProbe />
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'Logado: Nico Robin',
      )
    })
    expect(authService.registerUserRequest).toHaveBeenCalledTimes(1)
    expect(authService.loginRequest).toHaveBeenCalledTimes(1)
  })
})
