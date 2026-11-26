import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ChronicleComposer } from './ChronicleComposer'

describe('ChronicleComposer', () => {
  it('shows login prompt for visitors and passes axe', async () => {
    const { container } = render(
      <MemoryRouter>
        <ChronicleComposer isAuthenticated={false} />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: 'Entrar para Publicar' }),
    ).toHaveAttribute('href', '/login')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('validates and submits a new chronicle when authenticated', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    const { container } = render(
      <MemoryRouter>
        <ChronicleComposer isAuthenticated={true} onSubmit={onSubmit} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Nova Crônica' }))
    expect(await axe(container)).toHaveNoViolations()

    await user.type(
      screen.getByLabelText(/Título da Crônica/i),
      'Segredos de Laugh Tale',
    )
    await user.selectOptions(
      screen.getByLabelText(/Categoria/i),
      'VOID_CENTURY',
    )
    await user.type(
      screen.getByLabelText(/Relato Detalhado/i),
      'Os quatro Road Poneglyphs convergem em uma coordenada oculta.',
    )

    await user.click(screen.getByRole('button', { name: 'Publicar Crônica' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Segredos de Laugh Tale',
      category: 'VOID_CENTURY',
      coverUrl: undefined,
      content: 'Os quatro Road Poneglyphs convergem em uma coordenada oculta.',
    })
  })

  it('keeps form open and preserves typed fields when onSubmit fails', async () => {
    const user = userEvent.setup()
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('Erro na API'))
      .mockResolvedValueOnce(undefined)

    render(
      <MemoryRouter>
        <ChronicleComposer isAuthenticated={true} onSubmit={onSubmit} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Nova Crônica' }))

    const titleInput = screen.getByLabelText(/Título da Crônica/i)
    const categorySelect = screen.getByLabelText(/Categoria/i)
    const coverInput = screen.getByLabelText(/URL da Ilustração de Capa/i)
    const contentInput = screen.getByLabelText(/Relato Detalhado/i)

    await user.type(titleInput, 'Ruínas de Shandora')
    await user.selectOptions(categorySelect, 'ISLAND_DISCOVERY')
    await user.type(coverInput, 'https://exemplo.com/shandora.jpg')
    await user.type(
      contentInput,
      'Sino dourado localizado acima das nuvens de Skypiea.',
    )

    await user.click(screen.getByRole('button', { name: 'Publicar Crônica' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(
      screen.getByRole('button', { name: 'Publicar Crônica' }),
    ).toBeInTheDocument()
    expect(titleInput).toHaveValue('Ruínas de Shandora')
    expect(categorySelect).toHaveValue('ISLAND_DISCOVERY')
    expect(coverInput).toHaveValue('https://exemplo.com/shandora.jpg')
    expect(contentInput).toHaveValue(
      'Sino dourado localizado acima das nuvens de Skypiea.',
    )

    await user.click(screen.getByRole('button', { name: 'Publicar Crônica' }))

    expect(onSubmit).toHaveBeenCalledTimes(2)
    expect(
      screen.queryByRole('button', { name: 'Publicar Crônica' }),
    ).not.toBeInTheDocument()
  })
})
