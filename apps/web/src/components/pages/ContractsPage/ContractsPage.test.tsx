import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../../contexts/AuthContext'
import * as authService from '../../../services/auth.service'
import * as contractsService from '../../../services/contracts.service'
import { AUTH_TOKEN_STORAGE_KEY } from '../../../services/api'
import type { Contract } from '../../../types/domain'
import { ContractsPage } from './ContractsPage'

vi.mock('../../../services/auth.service', () => ({
  loginRequest: vi.fn(),
  registerUserRequest: vi.fn(),
  fetchCurrentUserRequest: vi.fn(),
}))

vi.mock('../../../services/contracts.service', () => ({
  listContractsRequest: vi.fn(),
  createContractRequest: vi.fn(),
  updateContractStatusRequest: vi.fn(),
}))

const SAMPLE_CONTRACT: Contract = {
  id: '44444444-4444-4444-8444-444444444401',
  title: 'Procura-se Músico para o Thousand Sunny',
  description: 'Saber tocar Binks no Sake durante banquetes.',
  type: 'CREW_RECRUITMENT',
  reward: 0,
  sea: 'GRAND_LINE',
  status: 'OPEN',
  authorId: '11111111-1111-4111-8111-111111111102',
  author: {
    id: '11111111-1111-4111-8111-111111111102',
    name: 'Monkey D. Luffy',
    affiliation: 'PIRATE',
    bounty: 3_000_000_000,
  },
  createdAt: '2026-11-25T07:00:00.000Z',
  updatedAt: '2026-11-25T07:00:00.000Z',
}

describe('ContractsPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(contractsService.listContractsRequest).mockResolvedValue({
      data: [SAMPLE_CONTRACT],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })
  })

  it('renders contracts board, filters by sea and type, and passes axe accessibility checks', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <MemoryRouter initialEntries={['/contracts']}>
        <AuthProvider>
          <ContractsPage />
        </AuthProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: SAMPLE_CONTRACT.title,
        }),
      ).toBeInTheDocument()
    })

    expect(await axe(container)).toHaveNoViolations()

    await user.selectOptions(
      screen.getByLabelText('Mar de Atuação'),
      'NEW_WORLD',
    )
    await waitFor(() => {
      expect(contractsService.listContractsRequest).toHaveBeenLastCalledWith(
        expect.objectContaining({ sea: 'NEW_WORLD', page: 1 }),
      )
    })

    await user.selectOptions(
      screen.getByLabelText('Tipo de Edital'),
      'BOUNTY_HUNTER',
    )
    await waitFor(() => {
      expect(contractsService.listContractsRequest).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sea: 'NEW_WORLD',
          type: 'BOUNTY_HUNTER',
          page: 1,
        }),
      )
    })
  })

  it('preserves contract composer fields on API error and displays visual feedback when status update fails', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'valid-jwt')
    vi.mocked(authService.fetchCurrentUserRequest).mockResolvedValue({
      id: SAMPLE_CONTRACT.authorId,
      name: 'Monkey D. Luffy',
      email: 'luffy@thousand-sunny.gl',
      affiliation: 'PIRATE',
      bounty: 3_000_000_000,
      createdAt: '2026-11-20T10:00:00.000Z',
    })
    vi.mocked(contractsService.createContractRequest).mockRejectedValueOnce(
      new Error('Falha ao emitir contrato no servidor'),
    )
    vi.mocked(
      contractsService.updateContractStatusRequest,
    ).mockRejectedValueOnce(new Error('Erro ao alterar status do contrato'))

    const { container } = render(
      <MemoryRouter initialEntries={['/contracts']}>
        <AuthProvider>
          <ContractsPage />
        </AuthProvider>
      </MemoryRouter>,
    )

    await screen.findByRole('heading', {
      level: 2,
      name: SAMPLE_CONTRACT.title,
    })

    await user.click(screen.getByRole('button', { name: 'Novo Contrato' }))
    const titleInput = screen.getByLabelText(/Título do Contrato ou Vaga/i)
    const descriptionInput = screen.getByLabelText(
      /Termos e Detalhes da Missão/i,
    )
    await user.type(titleInput, 'Cozinheiro para o Thousand Sunny')
    await user.type(
      descriptionInput,
      'Dominar culinária marítima e técnicas de chute.',
    )
    await user.click(screen.getByRole('button', { name: 'Publicar Contrato' }))

    await waitFor(() => {
      expect(
        screen.getByText('Falha ao emitir contrato no servidor'),
      ).toBeInTheDocument()
    })
    expect(titleInput).toHaveValue('Cozinheiro para o Thousand Sunny')
    expect(descriptionInput).toHaveValue(
      'Dominar culinária marítima e técnicas de chute.',
    )
    expect(
      screen.getByRole('button', { name: 'Publicar Contrato' }),
    ).toBeInTheDocument()

    const statusSelect = screen.getByLabelText(
      'Gerenciar status do seu contrato',
    )
    await user.selectOptions(statusSelect, 'COMPLETED')

    await waitFor(() => {
      expect(
        screen.getByText('Erro ao alterar status do contrato'),
      ).toBeInTheDocument()
    })
    expect(statusSelect).toHaveValue('OPEN')
    expect(await axe(container)).toHaveNoViolations()

    await user.click(screen.getByRole('button', { name: 'Dispensar' }))
    expect(
      screen.queryByText('Erro ao alterar status do contrato'),
    ).not.toBeInTheDocument()
  })
})
