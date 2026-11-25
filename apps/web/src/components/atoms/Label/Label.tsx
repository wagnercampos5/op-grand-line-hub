import type { ComponentPropsWithoutRef } from 'react'

export interface LabelProps extends ComponentPropsWithoutRef<'label'> {
  requiredIndicator?: boolean
}

export function Label({
  requiredIndicator = false,
  className = '',
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium tracking-wide text-parchment ${className}`.trim()}
      {...props}
    >
      {children}
      {requiredIndicator && (
        <span aria-hidden="true" className="ml-1 text-crimson-bounty">
          *
        </span>
      )}
    </label>
  )
}
