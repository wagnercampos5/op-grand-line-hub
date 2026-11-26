import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ContractComposer } from './ContractComposer'

describe('ContractComposer', () => {
  it('locks creation for visitors with accessible login link', async () => {
    const { container } = render(
      <MemoryRouter>
        <ContractComposer isAuthenticated={false} />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: 'Entrar para Emitir Contrato' }),
    ).toHaveAttribute('href', '/login')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('submits a valid contract with numeric Berries reward when authenticated', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    const { container } = render(
      <MemoryRouter>
        <ContractComposer isAuthenticated={true} onSubmit={onSubmit} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Novo Contrato' }))
    expect(await axe(container)).toHaveNoViolations()

    await user.type(
      screen.getByLabelText(/Título do Contrato ou Vaga/i),
      'Captura de Piratas em Loguetown',
    )
    await user.selectOptions(
      screen.getByLabelText(/Modalidade/i),
      'BOUNTY_HUNTER',
    )
    await user.selectOptions(
      screen.getByLabelText(/Mar de Atuação/i),
      'EAST_BLUE',
    )
    const rewardInput = screen.getByLabelText(/Recompensa \(Berries\)/i)
    await user.clear(rewardInput)
    await user.type(rewardInput, '30000000')
    await user.type(
      screen.getByLabelText(/Termos e Detalhes da Missão/i),
      'Entregar o capitão procurado na base naval de Loguetown.',
    )

    await user.click(screen.getByRole('button', { name: 'Publicar Contrato' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Captura de Piratas em Loguetown',
      type: 'BOUNTY_HUNTER',
      sea: 'EAST_BLUE',
      reward: 30000000,
      description: 'Entregar o capitão procurado na base naval de Loguetown.',
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
        <ContractComposer isAuthenticated={true} onSubmit={onSubmit} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Novo Contrato' }))

    const titleInput = screen.getByLabelText(/Título do Contrato ou Vaga/i)
    const typeSelect = screen.getByLabelText(/Modalidade/i)
    const seaSelect = screen.getByLabelText(/Mar de Atuação/i)
    const rewardInput = screen.getByLabelText(/Recompensa \(Berries\)/i)
    const descriptionInput = screen.getByLabelText(
      /Termos e Detalhes da Missão/i,
    )

    await user.type(titleInput, 'Navegador para o Novo Mundo')
    await user.selectOptions(typeSelect, 'BOUNTY_HUNTER')
    await user.selectOptions(seaSelect, 'NEW_WORLD')
    await user.clear(rewardInput)
    await user.type(rewardInput, '50000000')
    await user.type(
      descriptionInput,
      'Leitura avançada de correntes marítimas e Log Pose triplo.',
    )

    await user.click(screen.getByRole('button', { name: 'Publicar Contrato' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(
      screen.getByRole('button', { name: 'Publicar Contrato' }),
    ).toBeInTheDocument()
    expect(titleInput).toHaveValue('Navegador para o Novo Mundo')
    expect(typeSelect).toHaveValue('BOUNTY_HUNTER')
    expect(seaSelect).toHaveValue('NEW_WORLD')
    expect(rewardInput).toHaveValue(50000000)
    expect(descriptionInput).toHaveValue(
      'Leitura avançada de correntes marítimas e Log Pose triplo.',
    )

    await user.click(screen.getByRole('button', { name: 'Publicar Contrato' }))

    expect(onSubmit).toHaveBeenCalledTimes(2)
    expect(
      screen.queryByRole('button', { name: 'Publicar Contrato' }),
    ).not.toBeInTheDocument()
  })
})
