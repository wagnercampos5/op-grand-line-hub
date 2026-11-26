import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../../contexts/AuthContext'
import * as authService from '../../../services/auth.service'
import * as chroniclesService from '../../../services/chronicles.service'
import { AUTH_TOKEN_STORAGE_KEY } from '../../../services/api'
import type { Chronicle } from '../../../types/domain'
import { FeedPage } from './FeedPage'

vi.mock('../../../services/auth.service', () => ({
  loginRequest: vi.fn(),
  registerUserRequest: vi.fn(),
  fetchCurrentUserRequest: vi.fn(),
}))

vi.mock('../../../services/chronicles.service', () => ({
  listChroniclesRequest: vi.fn(),
  createChronicleRequest: vi.fn(),
  likeChronicleRequest: vi.fn(),
  unlikeChronicleRequest: vi.fn(),
  createChronicleCommentRequest: vi.fn(),
}))

const SAMPLE_CHRONICLE: Chronicle = {
  id: '22222222-2222-4222-8222-222222222201',
  title: 'Inscrições em Poneglyphs Submersos',
  content: 'Relato sobre glifos encontrados sob Water 7.',
  category: 'VOID_CENTURY',
  coverUrl: null,
  authorId: '11111111-1111-4111-8111-111111111101',
  author: {
    id: '11111111-1111-4111-8111-111111111101',
    name: 'Nico Robin',
    affiliation: 'PIRATE',
    bounty: 930_000_000,
  },
  likesCount: 2,
  commentsCount: 0,
  likedByMe: false,
  comments: [],
  createdAt: '2026-11-20T10:30:00.000Z',
  updatedAt: '2026-11-20T10:30:00.000Z',
}

describe('FeedPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(chroniclesService.listChroniclesRequest).mockResolvedValue({
      data: [SAMPLE_CHRONICLE],
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

  it('loads chronicles with visual placeholder, searches via API, and blocks visitor interactions with zero axe violations', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <MemoryRouter initialEntries={['/feed']}>
        <AuthProvider>
          <FeedPage />
        </AuthProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: SAMPLE_CHRONICLE.title,
        }),
      ).toBeInTheDocument()
    })

    expect(
      screen.getByTestId('chronicle-cover-placeholder'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Faça login para curtir/i }),
    ).toBeDisabled()
    expect(await axe(container)).toHaveNoViolations()

    const searchInput = screen.getByRole('searchbox', {
      name: 'Pesquisar crônicas na Grand Line',
    })
    await user.type(searchInput, 'Poneglyph')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    await waitFor(() => {
      expect(chroniclesService.listChroniclesRequest).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'Poneglyph', page: 1 }),
      )
    })
  })

  it('allows authenticated crew members to like chronicles without axe violations', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'valid-jwt')
    vi.mocked(authService.fetchCurrentUserRequest).mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111101',
      name: 'Nico Robin',
      email: 'nico.robin@ohara.gl',
      affiliation: 'PIRATE',
      bounty: 930_000_000,
      createdAt: '2026-11-20T10:00:00.000Z',
    })
    vi.mocked(chroniclesService.likeChronicleRequest).mockResolvedValue({
      chronicleId: SAMPLE_CHRONICLE.id,
      liked: true,
      likesCount: 3,
    })

    const { container } = render(
      <MemoryRouter initialEntries={['/feed']}>
        <AuthProvider>
          <FeedPage />
        </AuthProvider>
      </MemoryRouter>,
    )

    const likeBtn = await screen.findByRole('button', {
      name: 'Curtir crônica (2 curtidas)',
    })
    await user.click(likeBtn)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Remover curtida (3 curtidas)' }),
      ).toBeInTheDocument()
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('preserves chronicle composer fields on API error and displays visual feedback when like or comment fails', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'valid-jwt')
    vi.mocked(authService.fetchCurrentUserRequest).mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111101',
      name: 'Nico Robin',
      email: 'nico.robin@ohara.gl',
      affiliation: 'PIRATE',
      bounty: 930_000_000,
      createdAt: '2026-11-20T10:00:00.000Z',
    })
    vi.mocked(chroniclesService.createChronicleRequest).mockRejectedValueOnce(
      new Error('Falha ao publicar crônica no servidor'),
    )
    vi.mocked(chroniclesService.likeChronicleRequest).mockRejectedValueOnce(
      new Error('Erro ao registrar curtida'),
    )
    vi.mocked(
      chroniclesService.createChronicleCommentRequest,
    ).mockRejectedValueOnce(new Error('Erro ao publicar comentário'))

    const { container } = render(
      <MemoryRouter initialEntries={['/feed']}>
        <AuthProvider>
          <FeedPage />
        </AuthProvider>
      </MemoryRouter>,
    )

    await screen.findByRole('heading', {
      level: 2,
      name: SAMPLE_CHRONICLE.title,
    })

    await user.click(screen.getByRole('button', { name: 'Nova Crônica' }))
    const titleInput = screen.getByLabelText(/Título da Crônica/i)
    const contentInput = screen.getByLabelText(/Relato Detalhado/i)
    await user.type(titleInput, 'Diário de Ohara')
    await user.type(
      contentInput,
      'Registros preservados da Árvore da Onisciência.',
    )
    await user.click(screen.getByRole('button', { name: 'Publicar Crônica' }))

    await waitFor(() => {
      expect(
        screen.getByText('Falha ao publicar crônica no servidor'),
      ).toBeInTheDocument()
    })
    expect(titleInput).toHaveValue('Diário de Ohara')
    expect(contentInput).toHaveValue(
      'Registros preservados da Árvore da Onisciência.',
    )
    expect(
      screen.getByRole('button', { name: 'Publicar Crônica' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Curtir crônica (2 curtidas)' }),
    )
    await waitFor(() => {
      expect(screen.getByText('Erro ao registrar curtida')).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: 'Curtir crônica (2 curtidas)' }),
    ).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()

    await user.click(screen.getByRole('button', { name: 'Dispensar' }))
    expect(
      screen.queryByText('Erro ao registrar curtida'),
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Comentários (0)' }),
    )
    await user.type(
      screen.getByLabelText('Adicionar comentário à crônica'),
      'Anotação importante sobre o Século Perdido.',
    )
    await user.click(screen.getByRole('button', { name: 'Comentar' }))

    await waitFor(() => {
      expect(
        screen.getByText('Erro ao publicar comentário'),
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: 'Comentários (0)' }),
    ).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })
})
