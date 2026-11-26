import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../../atoms/Avatar'
import { Badge, type BadgeVariant } from '../../atoms/Badge'
import { Button } from '../../atoms/Button'
import { Input } from '../../atoms/Input'
import { Label } from '../../atoms/Label'
import { AffiliationBadge } from '../../molecules/AffiliationBadge'
import { ReactionButton } from '../../molecules/ReactionButton'
import type { Chronicle, ChronicleCategory } from '../../../types/domain'
import {
  CHRONICLE_CATEGORY_LABELS,
  formatMaritimeDate,
} from '../../../utils/formatters'

export interface ChronicleCardProps {
  chronicle: Chronicle
  isAuthenticated: boolean
  isLikeLoading?: boolean
  isCommentSubmitting?: boolean
  onToggleLike?: (chronicle: Chronicle) => void | Promise<void>
  onAddComment?: (chronicleId: string, content: string) => void | Promise<void>
}

const categoryVariantMap: Record<ChronicleCategory, BadgeVariant> = {
  VOYAGE_LOG: 'neutral',
  ISLAND_DISCOVERY: 'info',
  AKUMA_NO_MI: 'danger',
  VOID_CENTURY: 'gold',
}

export function ChronicleCard({
  chronicle,
  isAuthenticated,
  isLikeLoading = false,
  isCommentSubmitting = false,
  onToggleLike,
  onAddComment,
}: ChronicleCardProps) {
  const [imageError, setImageError] = useState(false)
  const [commentsExpanded, setCommentsExpanded] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentError, setCommentError] = useState<string | null>(null)
  const commentInputId = useId()
  const commentsRegionId = useId()

  const showCoverImage = Boolean(chronicle.coverUrl) && !imageError

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = commentText.trim()
    if (!trimmed) {
      setCommentError('Escreva seu comentário antes de publicar.')
      return
    }
    setCommentError(null)
    await onAddComment?.(chronicle.id, trimmed)
    setCommentText('')
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-mist-gray/20 bg-ship-deck/80 transition-colors hover:border-mist-gray/35">
      {showCoverImage ? (
        <div className="relative h-56 w-full overflow-hidden border-b border-mist-gray/15 bg-ocean-abyss">
          <img
            src={chronicle.coverUrl ?? ''}
            alt={`Ilustração da crônica: ${chronicle.title}`}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div
          data-testid="chronicle-cover-placeholder"
          className="flex h-44 w-full flex-col items-center justify-center gap-2 border-b border-mist-gray/15 bg-gradient-to-br from-ocean-abyss via-ship-deck to-ocean-abyss px-6 text-center"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-10 w-10 text-treasure-gold/80"
          >
            <circle cx="12" cy="12" r="9" />
            <polygon
              points="12,5 14.5,12 12,19 9.5,12"
              fill="currentColor"
              fillOpacity="0.25"
            />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
          <span className="font-display text-xs font-bold tracking-widest uppercase text-treasure-gold">
            {CHRONICLE_CATEGORY_LABELS[chronicle.category]}
          </span>
          <span className="text-xs text-mist-gray">
            Carta Náutica — Registro sem ilustração anexada
          </span>
        </div>
      )}

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={chronicle.author.name} size="sm" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-parchment">
                  {chronicle.author.name}
                </span>
                <AffiliationBadge affiliation={chronicle.author.affiliation} />
              </div>
              <time
                dateTime={chronicle.createdAt}
                className="block text-xs text-mist-gray"
              >
                {formatMaritimeDate(chronicle.createdAt)}
              </time>
            </div>
          </div>

          <Badge variant={categoryVariantMap[chronicle.category]}>
            {CHRONICLE_CATEGORY_LABELS[chronicle.category]}
          </Badge>
        </div>

        <div className="space-y-2.5">
          <h2 className="text-xl font-bold leading-snug text-parchment sm:text-2xl">
            {chronicle.title}
          </h2>
          <p className="whitespace-pre-line text-base leading-relaxed text-parchment/90">
            {chronicle.content}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-mist-gray/15 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <ReactionButton
              liked={chronicle.likedByMe}
              count={chronicle.likesCount}
              disabledForVisitor={!isAuthenticated}
              isLoading={isLikeLoading}
              onToggle={() => void onToggleLike?.(chronicle)}
            />

            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-expanded={commentsExpanded}
              aria-controls={commentsRegionId}
              onClick={() => setCommentsExpanded((prev) => !prev)}
            >
              Comentários ({chronicle.commentsCount})
            </Button>
          </div>

          {!isAuthenticated && (
            <span className="text-xs text-mist-gray">
              <Link
                to="/login"
                className="font-semibold text-log-pose-cyan underline-offset-4 hover:underline"
              >
                Entre
              </Link>{' '}
              para curtir ou comentar
            </span>
          )}
        </div>

        {commentsExpanded && (
          <section
            id={commentsRegionId}
            aria-label={`Comentários em ${chronicle.title}`}
            className="space-y-4 rounded-xl border border-mist-gray/15 bg-ocean-abyss/55 p-4"
          >
            {chronicle.comments.length === 0 ? (
              <p className="text-sm text-mist-gray">
                Nenhum comentário registrado ainda nesta crônica.
              </p>
            ) : (
              <ul className="space-y-3">
                {chronicle.comments.map((comment) => (
                  <li
                    key={comment.id}
                    className="rounded-lg border border-mist-gray/15 bg-ship-deck/70 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-parchment">
                          {comment.author.name}
                        </span>
                        <AffiliationBadge
                          affiliation={comment.author.affiliation}
                        />
                      </div>
                      <time
                        dateTime={comment.createdAt}
                        className="text-xs text-mist-gray"
                      >
                        {formatMaritimeDate(comment.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1.5 text-sm text-parchment/90">
                      {comment.content}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {isAuthenticated ? (
              <form
                noValidate
                onSubmit={(event) => void handleCommentSubmit(event)}
                className="space-y-2 pt-2"
              >
                <Label htmlFor={commentInputId} className="text-xs">
                  Adicionar comentário à crônica
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id={commentInputId}
                    value={commentText}
                    hasError={Boolean(commentError)}
                    placeholder="Compartilhe sua análise com a tripulação..."
                    onChange={(event) => setCommentText(event.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isCommentSubmitting}
                  >
                    Comentar
                  </Button>
                </div>
                {commentError && (
                  <p role="alert" className="text-xs text-crimson-bounty">
                    {commentError}
                  </p>
                )}
              </form>
            ) : (
              <div className="rounded-lg border border-mist-gray/20 bg-ship-deck/60 px-4 py-3 text-xs text-mist-gray">
                Visitantes podem ler os relatos, mas precisam{' '}
                <Link
                  to="/login"
                  className="font-semibold text-log-pose-cyan underline-offset-4 hover:underline"
                >
                  entrar na conta
                </Link>{' '}
                para publicar comentários.
              </div>
            )}
          </section>
        )}
      </div>
    </article>
  )
}
