import type { ComponentPropsWithRef } from 'react'

export interface TextareaProps extends ComponentPropsWithRef<'textarea'> {
  hasError?: boolean
}

export function Textarea({
  hasError = false,
  rows = 4,
  className = '',
  ...props
}: TextareaProps) {
  const borderClass = hasError
    ? 'border-crimson-bounty focus-visible:border-crimson-bounty focus-visible:ring-crimson-bounty'
    : 'border-mist-gray/30 hover:border-mist-gray/60 focus-visible:border-log-pose-cyan focus-visible:ring-log-pose-cyan'

  return (
    <textarea
      rows={rows}
      aria-invalid={hasError || undefined}
      className={`w-full rounded-lg border bg-ship-deck px-4 py-2.5 text-base text-parchment placeholder:text-mist-gray/70 transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${borderClass} ${className}`.trim()}
      {...props}
    />
  )
}
