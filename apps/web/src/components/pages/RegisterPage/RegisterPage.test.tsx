import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RegisterPage } from './RegisterPage'

describe('RegisterPage', () => {
  it('renders register banner and form with affiliation selector', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Aliste-se na Rota' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/Afiliação/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Assinar Manifesto de Tripulante' }),
    ).toBeInTheDocument()
    expect(
      screen.getByAltText(
        'Taverna costeira iluminada por lanternas com mural de contratos e tripulações reunidas',
      ),
    ).toHaveAttribute('src', '/banner-register.jpg')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
