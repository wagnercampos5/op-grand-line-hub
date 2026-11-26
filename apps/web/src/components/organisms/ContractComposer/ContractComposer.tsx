import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../atoms/Button'
import type { SelectOption } from '../../atoms/Select'
import { FormField } from '../../molecules/FormField'
import type { ContractType, Sea } from '../../../types/domain'
import { CONTRACT_TYPE_LABELS, SEA_LABELS } from '../../../utils/formatters'

export interface ContractDraftValues {
  title: string
  type: ContractType
  sea: Sea
  reward: number
  description: string
}

export interface ContractComposerProps {
  isAuthenticated: boolean
  isSubmitting?: boolean
  errorMessage?: string | null
  onSubmit?: (
    values: ContractDraftValues,
  ) => Promise<boolean | void> | boolean | void
}

const CONTRACT_TYPE_OPTIONS: readonly SelectOption[] = [
  { value: 'CREW_RECRUITMENT', label: CONTRACT_TYPE_LABELS.CREW_RECRUITMENT },
  { value: 'BOUNTY_HUNTER', label: CONTRACT_TYPE_LABELS.BOUNTY_HUNTER },
] as const

const SEA_OPTIONS: readonly SelectOption[] = [
  { value: 'EAST_BLUE', label: SEA_LABELS.EAST_BLUE },
  { value: 'GRAND_LINE', label: SEA_LABELS.GRAND_LINE },
  { value: 'NEW_WORLD', label: SEA_LABELS.NEW_WORLD },
] as const

type FieldErrors = Partial<
  Record<'title' | 'reward' | 'description', string>
>

export function ContractComposer({
  isAuthenticated,
  isSubmitting = false,
  errorMessage = null,
  onSubmit,
}: ContractComposerProps) {
  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<ContractType>('CREW_RECRUITMENT')
  const [sea, setSea] = useState<Sea>('GRAND_LINE')
  const [reward, setReward] = useState('0')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  if (!isAuthenticated) {
    return (
      <section
        aria-label="Publicação de contratos bloqueada para visitantes"
        className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-mist-gray/20 bg-ship-deck/70 p-6 sm:flex-row sm:items-center"
      >
        <div>
          <h2 className="text-lg font-bold text-parchment">
            Recrutando tripulantes ou emitindo um contrato de caça?
          </h2>
          <p className="mt-1 text-sm text-mist-gray">
            Entre na sua conta para afixar editais no Mural de Contratos dos
            mares.
          </p>
        </div>
        <Link
          to="/login"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-treasure-gold px-5 py-2.5 text-sm font-semibold text-ocean-abyss transition-colors hover:bg-treasure-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-treasure-gold"
        >
          Entrar para Emitir Contrato
        </Link>
      </section>
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedReward = Number(reward)
    const nextErrors: FieldErrors = {}

    if (title.trim().length < 3) {
      nextErrors.title = 'O título deve ter pelo menos 3 caracteres.'
    }
    if (
      reward.trim() === '' ||
      Number.isNaN(parsedReward) ||
      !Number.isInteger(parsedReward) ||
      parsedReward < 0
    ) {
      nextErrors.reward =
        'Informe um valor inteiro válido em Berries (0 ou maior).'
    }
    if (description.trim().length < 10) {
      nextErrors.description = 'A descrição deve ter pelo menos 10 caracteres.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    try {
      const result = await onSubmit?.({
        title: title.trim(),
        type,
        sea,
        reward: parsedReward,
        description: description.trim(),
      })

      if (result === false) {
        return
      }

      setTitle('')
      setType('CREW_RECRUITMENT')
      setSea('GRAND_LINE')
      setReward('0')
      setDescription('')
      setExpanded(false)
    } catch {
      // Preserva os campos digitados e mantém o formulário aberto em caso de erro na API
    }
  }

  return (
    <section
      aria-label="Emitir novo contrato"
      className="rounded-2xl border border-treasure-gold/30 bg-ship-deck/80 p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-parchment">
            Fixar Novo Edital no Mural
          </h2>
          <p className="text-sm text-mist-gray">
            Abra vagas para sua tripulação ou ofereça recompensas em Berries.
          </p>
        </div>
        <Button
          type="button"
          variant={expanded ? 'ghost' : 'primary'}
          size="sm"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? 'Fechar Edital' : 'Novo Contrato'}
        </Button>
      </div>

      {expanded && (
        <form
          noValidate
          onSubmit={(event) => void handleSubmit(event)}
          className="mt-6 space-y-4 border-t border-mist-gray/15 pt-5"
        >
          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-crimson-bounty/40 bg-crimson-bounty/15 px-4 py-3 text-sm text-crimson-bounty"
            >
              {errorMessage}
            </div>
          )}

          <FormField
            name="title"
            label="Título do Contrato ou Vaga"
            placeholder="Ex: Procura-se Timoneiro para o Novo Mundo"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            error={errors.title}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              name="type"
              label="Modalidade"
              required
              value={type}
              options={CONTRACT_TYPE_OPTIONS}
              onChange={(event) => setType(event.target.value as ContractType)}
            />

            <FormField
              name="sea"
              label="Mar de Atuação"
              required
              value={sea}
              options={SEA_OPTIONS}
              onChange={(event) => setSea(event.target.value as Sea)}
            />

            <FormField
              name="reward"
              label="Recompensa (Berries)"
              type="number"
              min={0}
              step={1000}
              required
              value={reward}
              onChange={(event) => setReward(event.target.value)}
              error={errors.reward}
            />
          </div>

          <FormField
            name="description"
            label="Termos e Detalhes da Missão"
            multiline
            rows={4}
            required
            placeholder="Descreva habilidades exigidas, perigos da rota ou condições de captura..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            error={errors.description}
          />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setExpanded(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Publicar Contrato
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
