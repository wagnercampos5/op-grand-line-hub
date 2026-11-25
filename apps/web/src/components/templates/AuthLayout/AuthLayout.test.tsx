import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { AuthLayout } from './AuthLayout'

describe('AuthLayout', () => {
  it('renders title, subtitle, badge, banner image, and children', () => {
    render(
      <AuthLayout
        title="Retorne ao Convés"
        subtitle="Acesse suas crônicas e contratos."
        badgeText="Log Pose Calibrado"
        bannerSrc="/banner-login.jpg"
        bannerAlt="Navio navegando pela Grand Line"
        bannerCaptionTitle="Rota para o Novo Mundo"
        bannerCaptionText="Mantenha seu Log Pose firme."
      >
        <p>Conteúdo do formulário</p>
      </AuthLayout>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Retorne ao Convés' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Log Pose Calibrado')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo do formulário')).toBeInTheDocument()

    const banner = screen.getByAltText('Navio navegando pela Grand Line')
    expect(banner).toHaveAttribute('src', '/banner-login.jpg')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AuthLayout
        title="Retorne ao Convés"
        subtitle="Acesse suas crônicas."
        badgeText="Log Pose Calibrado"
        bannerSrc="/banner-login.jpg"
        bannerAlt="Navio navegando pela Grand Line"
      >
        <div>Formulário</div>
      </AuthLayout>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
