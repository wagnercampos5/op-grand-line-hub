import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Chronicle } from '../../../types/domain'
import { ChronicleCard } from './ChronicleCard'

const BASE_CHRONICLE: Chronicle = {
  id: '22222222-2222-4222-8222-222222222201',
  title: 'Inscrições em Poneglyphs Submersos',
  content: 'Relato detalhado sobre as galerias de pedra sob Water 7.',
  category: 'VOID_CENTURY',
  coverUrl: null,
  authorId: '11111111-1111-4111-8111-111111111101',
  author: {
    id: '11111111-1111-4111-8111-111111111101',
    name: 'Nico Robin',
    affiliation: 'PIRATE',
    bounty: 930_000_000,
  },
  likesCount: 3,
  commentsCount: 1,
  likedByMe: false,
  comments: [
    {
      id: '33333333-3333-4333-8333-333333333301',
      chronicleId: '22222222-2222-4222-8222-222222222201',
      content: 'Excelente registro arqueológico!',
      createdAt: '2026-11-20T12:00:00.000Z',
      author: {
        id: '11111111-1111-4111-8111-111111111105',
        name: 'Sabo',
        affiliation: 'REVOLUTIONARY',
        bounty: 602_000_000,
      },
    },
  ],
  createdAt: '2026-11-20T10:30:00.000Z',
  updatedAt: '2026-11-20T10:30:00.000Z',
}

describe('ChronicleCard', () => {
  it('renders thematic visual placeholder when coverUrl is null and locks interactions for visitors', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter>
        <ChronicleCard chronicle={BASE_CHRONICLE} isAuthenticated={false} />
      </MemoryRouter>,
    )

    expect(
      screen.getByTestId('chronicle-cover-placeholder'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Faça login para curtir/i }),
    ).toBeDisabled()
    expect(await axe(container)).toHaveNoViolations()

    await user.click(
      screen.getByRole('button', { name: 'Comentários (1)' }),
    )
    expect(
      screen.getByText('Excelente registro arqueológico!'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Comentar' }),
    ).not.toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('allows authenticated users to like and submit a comment without axe violations', async () => {
    const user = userEvent.setup()
    const onToggleLike = vi.fn()
    const onAddComment = vi.fn()

    const { container } = render(
      <MemoryRouter>
        <ChronicleCard
          chronicle={{
            ...BASE_CHRONICLE,
            coverUrl: 'http://localhost:5173/banner-login.jpg',
          }}
          isAuthenticated={true}
          onToggleLike={onToggleLike}
          onAddComment={onAddComment}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('img', {
        name: `Ilustração da crônica: ${BASE_CHRONICLE.title}`,
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Curtir crônica (3 curtidas)' }),
    )
    expect(onToggleLike).toHaveBeenCalledTimes(1)

    await user.click(
      screen.getByRole('button', { name: 'Comentários (1)' }),
    )
    await user.type(
      screen.getByLabelText('Adicionar comentário à crônica'),
      'Rumo a Laugh Tale!',
    )
    await user.click(screen.getByRole('button', { name: 'Comentar' }))

    expect(onAddComment).toHaveBeenCalledWith(
      BASE_CHRONICLE.id,
      'Rumo a Laugh Tale!',
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
