import { useState } from 'react'
import { AuthForm } from '../../organisms/AuthForm'
import { AuthLayout } from '../../templates/AuthLayout'

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleRegister() {
    setErrorMessage(null)
    setIsLoading(true)
    try {
      // Ponto de integração futura com POST /users ou POST /auth/register
      await Promise.resolve()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Aliste-se na Rota"
      subtitle="Crie seu passe de navegação para publicar crônicas e aceitar contratos nos mares."
      badgeText="Recrutamento Aberto"
      badgeVariant="gold"
      bannerSrc="/banner-register.jpg"
      bannerAlt="Taverna costeira iluminada por lanternas com mural de contratos e tripulações reunidas"
      bannerCaptionTitle="Taverna do Cais & Mural de Contratos"
      bannerCaptionText="Escolha sua afiliação, encontre sua tripulação e construa sua reputação pelos quatro mares."
    >
      <AuthForm
        mode="register"
        isLoading={isLoading}
        errorMessage={errorMessage}
        onSubmit={handleRegister}
      />
    </AuthLayout>
  )
}
