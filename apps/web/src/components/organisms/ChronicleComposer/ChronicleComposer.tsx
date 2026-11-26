import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../atoms/Button'
import type { SelectOption } from '../../atoms/Select'
import { FormField } from '../../molecules/FormField'
import type { ChronicleCategory } from '../../../types/domain'
import { CHRONICLE_CATEGORY_LABELS } from '../../../utils/formatters'

export interface ChronicleDraftValues {
  title: string
  category: ChronicleCategory
  coverUrl?: string
  content: string
}

export interface ChronicleComposerProps {
  isAuthenticated: boolean
  isSubmitting?: boolean
  errorMessage?: string | null
  onSubmit?: (
    values: ChronicleDraftValues,
  ) => Promise<boolean | void> | boolean | void
}

const CATEGORY_OPTIONS: readonly SelectOption[] = [
  { value: 'VOYAGE_LOG', label: CHRONICLE_CATEGORY_LABELS.VOYAGE_LOG },
  {
    value: 'ISLAND_DISCOVERY',
    label: CHRONICLE_CATEGORY_LABELS.ISLAND_DISCOVERY,
  },
  { value: 'AKUMA_NO_MI', label: CHRONICLE_CATEGORY_LABELS.AKUMA_NO_MI },
  { value: 'VOID_CENTURY', label: CHRONICLE_CATEGORY_LABELS.VOID_CENTURY },
] as const

type FieldErrors = Partial<
  Record<'title' | 'category' | 'coverUrl' | 'content', string>
>

function isValidOptionalHttpUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) {
    return true
  }
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function ChronicleComposer({
  isAuthenticated,
  isSubmitting = false,
  errorMessage = null,
  onSubmit,
}: ChronicleComposerProps) {
  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ChronicleCategory>('VOYAGE_LOG')
  const [coverUrl, setCoverUrl] = useState('')
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  if (!isAuthenticated) {
    return (
      <section
        aria-label="Publicação de crônicas bloqueada para visitantes"
        className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-mist-gray/20 bg-ship-deck/70 p-6 sm:flex-row sm:items-center"
      >
        <div>
          <h2 className="text-lg font-bold text-parchment">
            Tem uma descoberta ou teoria sobre a Grand Line?
          </h2>
          <p className="mt-1 text-sm text-mist-gray">
            Visitantes podem explorar o acervo livremente. Autentique-se para
            publicar suas próprias crônicas.
          </p>
        </div>
        <Link
          to="/login"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-treasure-gold px-5 py-2.5 text-sm font-semibold text-ocean-abyss transition-colors hover:bg-treasure-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-treasure-gold"
        >
          Entrar para Publicar
        </Link>
      </section>
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FieldErrors = {}
    if (title.trim().length < 3) {
      nextErrors.title = 'O título deve ter pelo menos 3 caracteres.'
    }
    if (!isValidOptionalHttpUrl(coverUrl)) {
      nextErrors.coverUrl =
        'Informe uma URL válida iniciando com http:// ou https://.'
    }
    if (content.trim().length < 10) {
      nextErrors.content = 'O relato deve ter pelo menos 10 caracteres.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    try {
      const result = await onSubmit?.({
        title: title.trim(),
        category,
        coverUrl: coverUrl.trim() || undefined,
        content: content.trim(),
      })

      if (result === false) {
        return
      }

      setTitle('')
      setCoverUrl('')
      setContent('')
      setCategory('VOYAGE_LOG')
      setExpanded(false)
    } catch {
      // Preserva os campos digitados e mantém o formulário aberto em caso de erro na API
    }
  }

  return (
    <section
      aria-label="Publicar nova crônica"
      className="rounded-2xl border border-treasure-gold/30 bg-ship-deck/80 p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-parchment">
            Registrar Nova Crônica no Log Pose
          </h2>
          <p className="text-sm text-mist-gray">
            Compartilhe relatos de ilhas, estudos de Akuma no Mi ou teorias do
            Século Perdido.
          </p>
        </div>
        <Button
          type="button"
          variant={expanded ? 'ghost' : 'primary'}
          size="sm"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? 'Fechar Diário' : 'Nova Crônica'}
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              name="title"
              label="Título da Crônica"
              placeholder="Ex: Ruínas Ancestrais em Shandora"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              error={errors.title}
            />

            <FormField
              name="category"
              label="Categoria"
              required
              value={category}
              options={CATEGORY_OPTIONS}
              onChange={(event) =>
                setCategory(event.target.value as ChronicleCategory)
              }
              error={errors.category}
            />
          </div>

          <FormField
            name="coverUrl"
            label="URL da Ilustração de Capa (opcional)"
            type="url"
            placeholder="https://exemplo.com/carta-nautica.jpg"
            helperText="Deixe em branco para exibir automaticamente o carimbo cartográfico da Grand Line."
            value={coverUrl}
            onChange={(event) => setCoverUrl(event.target.value)}
            error={errors.coverUrl}
          />

          <FormField
            name="content"
            label="Relato Detalhado"
            multiline
            rows={4}
            required
            placeholder="Narre sua descoberta para os navegadores dos quatro mares..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            error={errors.content}
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
              Publicar Crônica
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
