import type { ComponentPropsWithRef } from 'react'

export interface InputProps extends ComponentPropsWithRef<'input'> {
  hasError?: boolean
}

export function Input({
  hasError = false,
  className = '',
  ...props
}: InputProps) {
  const borderClass = hasError
    ? 'border-crimson-bounty focus-visible:border-crimson-bounty focus-visible:ring-crimson-bounty'
    : 'border-mist-gray/30 hover:border-mist-gray/60 focus-visible:border-log-pose-cyan focus-visible:ring-log-pose-cyan'

  return (
    <input
      aria-invalid={hasError || undefined}
      className={`w-full rounded-lg border bg-ship-deck px-4 py-2.5 text-base text-parchment placeholder:text-mist-gray/70 transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${borderClass} ${className}`.trim()}
      {...props}
    />
  )
}
