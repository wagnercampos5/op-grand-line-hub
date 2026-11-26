import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'
import type { Contract } from '../../../types/domain'
import { ContractCard } from './ContractCard'

const SAMPLE_CONTRACT: Contract = {
  id: '44444444-4444-4444-8444-444444444403',
  title: 'Neutralização de Contrabandistas em Dressrosa',
  description: 'Interceptar remessas ilegais nas docas subterrâneas.',
  type: 'BOUNTY_HUNTER',
  reward: 450_000_000,
  sea: 'NEW_WORLD',
  status: 'OPEN',
  authorId: '11111111-1111-4111-8111-111111111105',
  author: {
    id: '11111111-1111-4111-8111-111111111105',
    name: 'Sabo',
    affiliation: 'REVOLUTIONARY',
    bounty: 602_000_000,
  },
  createdAt: '2026-11-23T13:20:00.000Z',
  updatedAt: '2026-11-23T13:20:00.000Z',
}

describe('ContractCard', () => {
  it('hides status management from non-owners and passes axe', async () => {
    const { container } = render(
      <ContractCard contract={SAMPLE_CONTRACT} currentUserId="other-user" />,
    )

    expect(screen.getByText('฿ 450.000.000')).toBeInTheDocument()
    expect(screen.getByText('Novo Mundo')).toBeInTheDocument()
    expect(
      screen.queryByLabelText('Gerenciar status do seu contrato'),
    ).not.toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('allows the contract author to update status and passes axe', async () => {
    const user = userEvent.setup()
    const onUpdateStatus = vi.fn()

    const { container } = render(
      <ContractCard
        contract={SAMPLE_CONTRACT}
        currentUserId={SAMPLE_CONTRACT.authorId}
        onUpdateStatus={onUpdateStatus}
      />,
    )

    expect(await axe(container)).toHaveNoViolations()

    const statusSelect = screen.getByLabelText(
      'Gerenciar status do seu contrato',
    )
    await user.selectOptions(statusSelect, 'COMPLETED')

    expect(onUpdateStatus).toHaveBeenCalledWith(
      SAMPLE_CONTRACT.id,
      'COMPLETED',
    )
  })
})
