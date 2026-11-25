import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthForm } from './AuthForm'

describe('AuthForm', () => {
  it('validates login fields and submits valid credentials', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <MemoryRouter>
        <AuthForm mode="login" onSubmit={onSubmit} />
      </MemoryRouter>,
    )

    const submitButton = screen.getByRole('button', {
      name: 'Zarpar para a Grand Line',
    })
    await user.click(submitButton)

    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(/E-mail/i), 'nami@sunny.sea')
    await user.type(screen.getByLabelText(/Senha/i), 'logpose123')
    await user.click(submitButton)

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'nami@sunny.sea',
      password: 'logpose123',
    })
  })

  it('renders affiliation selector and validates registration fields', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <MemoryRouter>
        <AuthForm mode="register" onSubmit={onSubmit} />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/Nome ou Alcunha/i), 'Monkey D. Luffy')
    await user.selectOptions(screen.getByLabelText(/Afiliação/i), 'PIRATE')
    await user.type(screen.getByLabelText(/E-mail/i), 'luffy@sunny.sea')
    await user.type(screen.getByLabelText(/^Senha/i), 'gomugomu123')
    await user.type(
      screen.getByLabelText(/Confirmar Senha/i),
      'gomugomu123',
    )

    await user.click(
      screen.getByRole('button', { name: 'Assinar Manifesto de Tripulante' }),
    )

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Monkey D. Luffy',
      affiliation: 'PIRATE',
      email: 'luffy@sunny.sea',
      password: 'gomugomu123',
      confirmPassword: 'gomugomu123',
    })
  })

  it('renders API error message alert', () => {
    render(
      <MemoryRouter>
        <AuthForm mode="login" errorMessage="Credenciais inválidas." />
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Credenciais inválidas.',
    )
  })

  it('has no accessibility violations in login and register modes', async () => {
    const { container: loginContainer } = render(
      <MemoryRouter>
        <AuthForm mode="login" />
      </MemoryRouter>,
    )
    expect(await axe(loginContainer)).toHaveNoViolations()

    const { container: registerContainer } = render(
      <MemoryRouter>
        <AuthForm mode="register" />
      </MemoryRouter>,
    )
    expect(await axe(registerContainer)).toHaveNoViolations()
  })
})
