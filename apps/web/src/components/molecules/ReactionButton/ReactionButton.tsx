export interface ReactionButtonProps {
  liked: boolean
  count: number
  disabledForVisitor?: boolean
  isLoading?: boolean
  onToggle?: () => void
}

export function ReactionButton({
  liked,
  count,
  disabledForVisitor = false,
  isLoading = false,
  onToggle,
}: ReactionButtonProps) {
  const isDisabled = disabledForVisitor || isLoading

  const activeClasses = liked
    ? 'border-crimson-bounty/50 bg-crimson-bounty/15 text-crimson-bounty'
    : 'border-mist-gray/30 bg-ship-deck text-parchment hover:border-crimson-bounty/50 hover:text-crimson-bounty'

  const ariaLabel = disabledForVisitor
    ? `Faça login para curtir (${count} curtidas)`
    : liked
      ? `Remover curtida (${count} curtidas)`
      : `Curtir crônica (${count} curtidas)`

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-pressed={liked}
      aria-label={ariaLabel}
      title={
        disabledForVisitor
          ? 'Entre na sua conta para curtir esta crônica'
          : undefined
      }
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-log-pose-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-ocean-abyss disabled:cursor-not-allowed disabled:opacity-60 ${activeClasses}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
      <span>Curtir</span>
      <span className="rounded-full bg-ocean-abyss/60 px-2 py-0.5 font-mono text-xs">
        {count}
      </span>
    </button>
  )
}
