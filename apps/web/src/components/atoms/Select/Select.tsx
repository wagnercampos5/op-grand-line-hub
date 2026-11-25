import type { ComponentPropsWithRef } from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends ComponentPropsWithRef<'select'> {
  options: readonly SelectOption[]
  placeholder?: string
  hasError?: boolean
}

export function Select({
  options,
  placeholder,
  hasError = false,
  className = '',
  ...props
}: SelectProps) {
  const borderClass = hasError
    ? 'border-crimson-bounty focus-visible:border-crimson-bounty focus-visible:ring-crimson-bounty'
    : 'border-mist-gray/30 hover:border-mist-gray/60 focus-visible:border-log-pose-cyan focus-visible:ring-log-pose-cyan'

  return (
    <select
      aria-invalid={hasError || undefined}
      className={`w-full rounded-lg border bg-ship-deck px-4 py-2.5 text-base text-parchment transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${borderClass} ${className}`.trim()}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
