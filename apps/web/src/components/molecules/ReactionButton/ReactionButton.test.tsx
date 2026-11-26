import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'
import { ReactionButton } from './ReactionButton'

describe('ReactionButton', () => {
  it('toggles reaction when authenticated and blocks visitors accessibly', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()

    const { container, rerender } = render(
      <ReactionButton liked={false} count={5} onToggle={onToggle} />,
    )

    const button = screen.getByRole('button', {
      name: 'Curtir crônica (5 curtidas)',
    })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(await axe(container)).toHaveNoViolations()

    await user.click(button)
    expect(onToggle).toHaveBeenCalledTimes(1)

    rerender(
      <ReactionButton liked={true} count={6} disabledForVisitor={true} />,
    )

    const lockedBtn = screen.getByRole('button', {
      name: 'Faça login para curtir (6 curtidas)',
    })
    expect(lockedBtn).toBeDisabled()
    expect(await axe(container)).toHaveNoViolations()
  })
})
