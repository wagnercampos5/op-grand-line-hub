import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('renders login banner and form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Retorne ao Convés' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Zarpar para a Grand Line' }),
    ).toBeInTheDocument()
    expect(
      screen.getByAltText(
        'Navio navegando pela névoa da Grand Line com Log Pose iluminado no convés',
      ),
    ).toHaveAttribute('src', '/banner-login.jpg')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
