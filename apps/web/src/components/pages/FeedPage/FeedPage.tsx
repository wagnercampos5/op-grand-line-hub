import { useCallback, useEffect, useState } from 'react'
import { Button } from '../../atoms/Button'
import { SearchBar } from '../../molecules/SearchBar'
import { ChronicleCard } from '../../organisms/ChronicleCard'
import {
  ChronicleComposer,
  type ChronicleDraftValues,
} from '../../organisms/ChronicleComposer'
import { MainFeedLayout } from '../../templates/MainFeedLayout'
import { useAuth } from '../../../contexts/AuthContext'
import { getApiErrorMessage } from '../../../services/api'
import {
  createChronicleCommentRequest,
  createChronicleRequest,
  likeChronicleRequest,
  listChroniclesRequest,
  unlikeChronicleRequest,
} from '../../../services/chronicles.service'
import type {
  Chronicle,
  ChronicleCategory,
  PaginationMeta,
} from '../../../types/domain'
import { CHRONICLE_CATEGORY_LABELS } from '../../../utils/formatters'

const CATEGORY_FILTERS: ReadonlyArray<{
  value: ChronicleCategory | ''
  label: string
}> = [
  { value: '', label: 'Todas' },
  { value: 'VOYAGE_LOG', label: CHRONICLE_CATEGORY_LABELS.VOYAGE_LOG },
  {
    value: 'ISLAND_DISCOVERY',
    label: CHRONICLE_CATEGORY_LABELS.ISLAND_DISCOVERY,
  },
  { value: 'AKUMA_NO_MI', label: CHRONICLE_CATEGORY_LABELS.AKUMA_NO_MI },
  { value: 'VOID_CENTURY', label: CHRONICLE_CATEGORY_LABELS.VOID_CENTURY },
]

export function FeedPage() {
  const { user, isAuthenticated, logout } = useAuth()

  const [chronicles, setChronicles] = useState<Chronicle[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<
    ChronicleCategory | ''
  >('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isCreating, setIsCreating] = useState(false)
  const [composerError, setComposerError] = useState<string | null>(null)
  const [interactionError, setInteractionError] = useState<string | null>(null)
  const [likeLoadingId, setLikeLoadingId] = useState<string | null>(null)
  const [commentLoadingId, setCommentLoadingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    listChroniclesRequest({
      page,
      limit: 10,
      search,
      category: selectedCategory,
    })
      .then((response) => {
        if (!active) return
        setChronicles(response.data)
        setMeta(response.meta)
        setErrorMessage(null)
      })
      .catch((error: unknown) => {
        if (!active) return
        setErrorMessage(
          getApiErrorMessage(
            error,
            'Não foi possível carregar as crônicas da Grand Line.',
          ),
        )
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [page, search, selectedCategory])

  const reloadChronicles = useCallback(
    async (targetPage = page) => {
      setIsLoading(true)
      setErrorMessage(null)
      setInteractionError(null)
      try {
        const response = await listChroniclesRequest({
          page: targetPage,
          limit: 10,
          search,
          category: selectedCategory,
        })
        setChronicles(response.data)
        setMeta(response.meta)
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            'Não foi possível carregar as crônicas da Grand Line.',
          ),
        )
      } finally {
        setIsLoading(false)
      }
    },
    [page, search, selectedCategory],
  )

  function handleSearch(nextTerm: string) {
    setInteractionError(null)
    if (nextTerm !== search || page !== 1) {
      setIsLoading(true)
    }
    setPage(1)
    setSearch(nextTerm)
  }

  function handleCategoryChange(nextCategory: ChronicleCategory | '') {
    setInteractionError(null)
    if (nextCategory !== selectedCategory || page !== 1) {
      setIsLoading(true)
    }
    setPage(1)
    setSelectedCategory(nextCategory)
  }

  async function handleCreateChronicle(values: ChronicleDraftValues) {
    setComposerError(null)
    setInteractionError(null)
    setIsCreating(true)
    try {
      await createChronicleRequest(values)
      setPage(1)
      await reloadChronicles(1)
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Falha ao publicar a crônica. Tente novamente.',
      )
      setComposerError(message)
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  async function handleToggleLike(chronicle: Chronicle) {
    if (!isAuthenticated) {
      return
    }
    setInteractionError(null)
    setLikeLoadingId(chronicle.id)
    try {
      const result = chronicle.likedByMe
        ? await unlikeChronicleRequest(chronicle.id)
        : await likeChronicleRequest(chronicle.id)

      setChronicles((current) =>
        current.map((item) =>
          item.id === chronicle.id
            ? {
                ...item,
                likedByMe: result.liked,
                likesCount: result.likesCount,
              }
            : item,
        ),
      )
    } catch (error) {
      setInteractionError(
        getApiErrorMessage(
          error,
          'Não foi possível atualizar sua curtida. Tente novamente.',
        ),
      )
    } finally {
      setLikeLoadingId(null)
    }
  }

  async function handleAddComment(chronicleId: string, content: string) {
    if (!isAuthenticated) {
      return
    }
    setInteractionError(null)
    setCommentLoadingId(chronicleId)
    try {
      const createdComment = await createChronicleCommentRequest(
        chronicleId,
        content,
      )
      setChronicles((current) =>
        current.map((item) =>
          item.id === chronicleId
            ? {
                ...item,
                commentsCount: item.commentsCount + 1,
                comments: [...item.comments, createdComment],
              }
            : item,
        ),
      )
    } catch (error) {
      setInteractionError(
        getApiErrorMessage(
          error,
          'Não foi possível publicar seu comentário. Tente novamente.',
        ),
      )
    } finally {
      setCommentLoadingId(null)
    }
  }

  return (
    <MainFeedLayout
      title="Crônicas da Grand Line"
      subtitle="Relatos de navegação, descobertas sobre ilhas misteriosas, propriedades de Akuma no Mi e teorias do Século Perdido."
      badgeText="Diário de Bordo"
      badgeVariant="info"
      user={user}
      onLogout={logout}
    >
      <section
        aria-label="Busca e filtros de crônicas"
        className="space-y-4 rounded-2xl border border-mist-gray/20 bg-ship-deck/60 p-5"
      >
        <SearchBar
          initialValue={search}
          label="Pesquisar crônicas na Grand Line"
          placeholder="Buscar por ilha, Poneglyph, Akuma no Mi ou autor..."
          isLoading={isLoading}
          onSearch={handleSearch}
        />

        <div
          role="group"
          aria-label="Filtrar por categoria temática"
          className="flex flex-wrap gap-2"
        >
          {CATEGORY_FILTERS.map((filter) => {
            const active = selectedCategory === filter.value
            return (
              <button
                key={filter.label}
                type="button"
                aria-pressed={active}
                onClick={() => handleCategoryChange(filter.value)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-log-pose-cyan ${
                  active
                    ? 'border-log-pose-cyan bg-log-pose-cyan/20 text-log-pose-cyan'
                    : 'border-mist-gray/30 bg-ocean-abyss/50 text-mist-gray hover:border-parchment/40 hover:text-parchment'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </section>

      <ChronicleComposer
        isAuthenticated={isAuthenticated}
        isSubmitting={isCreating}
        errorMessage={composerError}
        onSubmit={handleCreateChronicle}
      />

      {errorMessage && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-crimson-bounty/40 bg-crimson-bounty/15 p-4 text-sm text-crimson-bounty"
        >
          <span>{errorMessage}</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void reloadChronicles()}
          >
            Tentar Novamente
          </Button>
        </div>
      )}

      {interactionError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-crimson-bounty/40 bg-crimson-bounty/15 p-4 text-sm text-crimson-bounty"
        >
          <span>{interactionError}</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setInteractionError(null)}
          >
            Dispensar
          </Button>
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          className="rounded-2xl border border-mist-gray/15 bg-ship-deck/50 p-10 text-center text-sm text-mist-gray"
        >
          Calibrando Log Pose e carregando crônicas...
        </div>
      ) : chronicles.length === 0 ? (
        <div className="rounded-2xl border border-mist-gray/20 bg-ship-deck/50 p-10 text-center">
          <h2 className="text-lg font-bold text-parchment">
            Nenhuma crônica encontrada nestas coordenadas
          </h2>
          <p className="mt-1 text-sm text-mist-gray">
            Experimente ajustar os termos da busca ou selecionar outra categoria.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {chronicles.map((chronicle) => (
            <ChronicleCard
              key={chronicle.id}
              chronicle={chronicle}
              isAuthenticated={isAuthenticated}
              isLikeLoading={likeLoadingId === chronicle.id}
              isCommentSubmitting={commentLoadingId === chronicle.id}
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      )}

      {!isLoading && meta.totalPages > 1 && (
        <nav
          aria-label="Paginação de crônicas"
          className="flex items-center justify-between rounded-xl border border-mist-gray/20 bg-ship-deck/60 px-5 py-3"
        >
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!meta.hasPreviousPage}
            onClick={() => {
              setInteractionError(null)
              setIsLoading(true)
              setPage((prev) => Math.max(1, prev - 1))
            }}
          >
            Anterior
          </Button>
          <span className="font-mono text-xs text-mist-gray">
            Página {meta.page} de {meta.totalPages}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!meta.hasNextPage}
            onClick={() => {
              setInteractionError(null)
              setIsLoading(true)
              setPage((prev) => prev + 1)
            }}
          >
            Próxima
          </Button>
        </nav>
      )}
    </MainFeedLayout>
  )
}
