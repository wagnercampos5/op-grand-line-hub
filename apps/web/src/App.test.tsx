import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './contexts/AuthContext'
import { AppRoutes } from './routes/AppRoutes'
import * as chroniclesService from './services/chronicles.service'
import * as contractsService from './services/contracts.service'

vi.mock('./services/chronicles.service', () => ({
  listChroniclesRequest: vi.fn(),
  createChronicleRequest: vi.fn(),
  likeChronicleRequest: vi.fn(),
  unlikeChronicleRequest: vi.fn(),
  createChronicleCommentRequest: vi.fn(),
}))

vi.mock('./services/contracts.service', () => ({
  listContractsRequest: vi.fn(),
  createContractRequest: vi.fn(),
  updateContractStatusRequest: vi.fn(),
}))

describe('AppRoutes', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(chroniclesService.listChroniclesRequest).mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })
    vi.mocked(contractsService.listContractsRequest).mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })
  })

  it('redirects root path to /feed and navigates across Feed, Contracts, Login, and Register without axe violations', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Crônicas da Grand Line',
        }),
      ).toBeInTheDocument()
    })
    expect(await axe(container)).toHaveNoViolations()

    await user.click(
      screen.getByRole('link', { name: /Mural de Contratos/i }),
    )
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Mural de Contratos & Tripulações',
        }),
      ).toBeInTheDocument()
    })
    expect(await axe(container)).toHaveNoViolations()

    await user.click(screen.getByRole('link', { name: 'Entrar' }))
    expect(
      screen.getByRole('heading', { level: 1, name: 'Retorne ao Convés' }),
    ).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()

    await user.click(screen.getByRole('link', { name: 'Aliste-se agora' }))
    expect(
      screen.getByRole('heading', { level: 1, name: 'Aliste-se na Rota' }),
    ).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })
})
