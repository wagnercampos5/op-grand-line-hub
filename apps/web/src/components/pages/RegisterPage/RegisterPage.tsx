import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { getApiErrorMessage } from '../../../services/api'
import { AuthForm, type RegisterFormValues } from '../../organisms/AuthForm'
import { AuthLayout } from '../../templates/AuthLayout'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleRegister(values: RegisterFormValues) {
    setErrorMessage(null)
    setIsLoading(true)
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        affiliation: values.affiliation,
      })
      navigate('/feed', { replace: true })
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'Não foi possível concluir o cadastro. Verifique os dados informados.',
        ),
      )
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
