import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../atoms/Button'
import { FormField } from '../../molecules/FormField'
import { AFFILIATION_OPTIONS } from './authForm.constants'

export type Affiliation =
  | 'PIRATE'
  | 'MARINE'
  | 'REVOLUTIONARY'
  | 'BOUNTY_HUNTER'

export interface LoginFormValues {
  email: string
  password: string
}

export interface RegisterFormValues {
  name: string
  affiliation: Affiliation
  email: string
  password: string
  confirmPassword: string
}

export type AuthFormMode = 'login' | 'register'

type AuthFormBaseProps = {
  isLoading?: boolean
  errorMessage?: string | null
}

export type AuthFormProps =
  | (AuthFormBaseProps & {
      mode: 'login'
      onSubmit?: (values: LoginFormValues) => void | Promise<void>
    })
  | (AuthFormBaseProps & {
      mode: 'register'
      onSubmit?: (values: RegisterFormValues) => void | Promise<void>
    })

type FormErrors = Partial<
  Record<'name' | 'affiliation' | 'email' | 'password' | 'confirmPassword', string>
>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateFields(
  mode: AuthFormMode,
  values: {
    name: string
    affiliation: string
    email: string
    password: string
    confirmPassword: string
  },
): FormErrors {
  const errors: FormErrors = {}

  if (mode === 'register') {
    if (values.name.trim().length < 2) {
      errors.name = 'Informe seu nome ou alcunha (mínimo 2 caracteres).'
    }
    if (!values.affiliation) {
      errors.affiliation = 'Selecione sua afiliação nos mares.'
    }
  }

  if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Informe um e-mail válido.'
  }

  const minPasswordLength = mode === 'register' ? 8 : 6
  if (values.password.length < minPasswordLength) {
    errors.password = `A senha deve ter pelo menos ${minPasswordLength} caracteres.`
  }

  if (mode === 'register' && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'As senhas não coincidem.'
  }

  return errors
}

export function AuthForm(props: AuthFormProps) {
  const { mode, isLoading = false, errorMessage = null } = props
  const isRegister = mode === 'register'

  const [name, setName] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validateFields(mode, {
      name,
      affiliation,
      email,
      password,
      confirmPassword,
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstInvalidField = Object.keys(validationErrors)[0]
      const element = event.currentTarget.elements.namedItem(firstInvalidField)
      if (element instanceof HTMLElement) {
        element.focus()
      }
      return
    }

    setErrors({})

    if (props.mode === 'login') {
      await props.onSubmit?.({
        email: email.trim(),
        password,
      })
    } else {
      await props.onSubmit?.({
        name: name.trim(),
        affiliation: affiliation as Affiliation,
        email: email.trim(),
        password,
        confirmPassword,
      })
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-label={
        isRegister
          ? 'Formulário de alistamento na Grand Line'
          : 'Formulário de acesso à Grand Line'
      }
      className="space-y-5"
    >
      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-crimson-bounty/40 bg-crimson-bounty/15 px-4 py-3 text-sm text-crimson-bounty"
        >
          {errorMessage}
        </div>
      )}

      {isRegister && (
        <>
          <FormField
            name="name"
            label="Nome ou Alcunha"
            type="text"
            autoComplete="name"
            placeholder="Ex: Roronoa Zoro"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
          />

          <FormField
            name="affiliation"
            label="Afiliação"
            required
            value={affiliation}
            placeholder="Selecione sua afiliação"
            options={AFFILIATION_OPTIONS}
            onChange={(event) => setAffiliation(event.target.value)}
            error={errors.affiliation}
          />
        </>
      )}

      <FormField
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="navegador@grandline.hub"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
      />

      <FormField
        name="password"
        label="Senha"
        type="password"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        placeholder={isRegister ? 'Mínimo de 8 caracteres' : 'Sua senha secreta'}
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />

      {isRegister && (
        <FormField
          name="confirmPassword"
          label="Confirmar Senha"
          type="password"
          autoComplete="new-password"
          placeholder="Repita sua senha"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
        />
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
      >
        {isRegister
          ? 'Assinar Manifesto de Tripulante'
          : 'Zarpar para a Grand Line'}
      </Button>

      <p className="pt-2 text-center text-sm text-mist-gray">
        {isRegister ? (
          <>
            Já possui passe de navegação?{' '}
            <Link
              to="/login"
              className="font-semibold text-log-pose-cyan underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-log-pose-cyan rounded"
            >
              Entrar na conta
            </Link>
          </>
        ) : (
          <>
            Ainda não tem registro no Log Pose?{' '}
            <Link
              to="/register"
              className="font-semibold text-log-pose-cyan underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-log-pose-cyan rounded"
            >
              Aliste-se agora
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
