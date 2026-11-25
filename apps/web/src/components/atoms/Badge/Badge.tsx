import type { ComponentPropsWithoutRef } from 'react'

export type BadgeVariant = 'gold' | 'info' | 'danger' | 'neutral'

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  gold: 'bg-treasure-gold/15 text-treasure-gold border-treasure-gold/40',
  info: 'bg-log-pose-cyan/15 text-log-pose-cyan border-log-pose-cyan/40',
  danger: 'bg-crimson-bounty/15 text-crimson-bounty border-crimson-bounty/40',
  neutral: 'bg-ship-deck text-mist-gray border-mist-gray/30',
}

export function Badge({
  variant = 'neutral',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  )
}
