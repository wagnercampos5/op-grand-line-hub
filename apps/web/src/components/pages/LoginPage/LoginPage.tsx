import { useState } from 'react'
import { AuthForm } from '../../organisms/AuthForm'
import { AuthLayout } from '../../templates/AuthLayout'

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleLogin() {
    setErrorMessage(null)
    setIsLoading(true)
    try {
      // Ponto de integração futura com POST /auth/login
      await Promise.resolve()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Retorne ao Convés"
      subtitle="Calibre seu Log Pose e retome suas crônicas e contratos pela Grand Line."
      badgeText="Log Pose Calibrado"
      badgeVariant="info"
      bannerSrc="/banner-login.jpg"
      bannerAlt="Navio navegando pela névoa da Grand Line com Log Pose iluminado no convés"
      bannerCaptionTitle="Diários do Novo Mundo"
      bannerCaptionText="Compartilhe descobertas sobre ilhas, Akuma no Mi e acompanhe contratos ativos de tripulações."
    >
      <AuthForm
        mode="login"
        isLoading={isLoading}
        errorMessage={errorMessage}
        onSubmit={handleLogin}
      />
    </AuthLayout>
  )
}
