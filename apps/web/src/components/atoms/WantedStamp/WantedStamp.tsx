import type { ComponentPropsWithoutRef } from 'react'

export type WantedStampVariant = 'bounty' | 'wanted' | 'crew'

export interface WantedStampProps extends ComponentPropsWithoutRef<'span'> {
  amount: number
  variant?: WantedStampVariant
  labelPrefix?: string
  zeroText?: string
}

const berriesNumberFormatter = new Intl.NumberFormat('pt-BR')

const variantClasses: Record<WantedStampVariant, string> = {
  bounty: 'border-treasure-gold/45 bg-treasure-gold/15 text-treasure-gold',
  wanted: 'border-crimson-bounty/45 bg-crimson-bounty/15 text-crimson-bounty',
  crew: 'border-log-pose-cyan/45 bg-log-pose-cyan/15 text-log-pose-cyan',
}

export function WantedStamp({
  amount,
  variant = 'bounty',
  labelPrefix,
  zeroText,
  className = '',
  ...props
}: WantedStampProps) {
  const displayValue =
    amount === 0 && zeroText
      ? zeroText
      : `฿ ${berriesNumberFormatter.format(amount)}`

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-semibold tracking-wider uppercase ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {labelPrefix && (
        <span className="font-sans text-xs font-medium opacity-85">
          {labelPrefix}
        </span>
      )}
      <span>{displayValue}</span>
    </span>
  )
}
