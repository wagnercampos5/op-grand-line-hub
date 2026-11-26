import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { getApiErrorMessage } from '../../../services/api'
import { AuthForm, type LoginFormValues } from '../../organisms/AuthForm'
import { AuthLayout } from '../../templates/AuthLayout'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleLogin(values: LoginFormValues) {
    setErrorMessage(null)
    setIsLoading(true)
    try {
      await login(values)
      navigate('/feed', { replace: true })
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'Não foi possível autenticar. Verifique seu e-mail e senha.',
        ),
      )
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

      <div className="mt-5 border-t border-mist-gray/15 pt-4 text-center">
        <Link
          to="/feed"
          className="text-xs font-medium text-mist-gray underline-offset-4 hover:text-parchment hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-log-pose-cyan rounded"
        >
          Explorar crônicas e contratos como visitante
        </Link>
      </div>
    </AuthLayout>
  )
}
