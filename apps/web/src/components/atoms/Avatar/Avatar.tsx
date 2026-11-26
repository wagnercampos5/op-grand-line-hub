import type { ComponentPropsWithoutRef } from 'react'

export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps extends ComponentPropsWithoutRef<'span'> {
  name: string
  size?: AvatarSize
  decorative?: boolean
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

function getInitials(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0 && !part.endsWith('.'))

  if (parts.length === 0) {
    return 'GL'
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function Avatar({
  name,
  size = 'md',
  decorative = true,
  className = '',
  ...props
}: AvatarProps) {
  const initials = getInitials(name)

  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : `Avatar de ${name}`}
      aria-hidden={decorative || undefined}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full border border-treasure-gold/40 bg-ship-deck font-display font-bold tracking-wider text-treasure-gold ${sizeClasses[size]} ${className}`.trim()}
      {...props}
    >
      {initials}
    </span>
  )
}
