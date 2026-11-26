import { Badge, type BadgeVariant } from '../../atoms/Badge'
import type { Affiliation } from '../../../types/domain'
import { AFFILIATION_LABELS } from '../../../utils/formatters'

export interface AffiliationBadgeProps {
  affiliation: Affiliation
  className?: string
}

const affiliationVariantMap: Record<Affiliation, BadgeVariant> = {
  PIRATE: 'danger',
  MARINE: 'info',
  REVOLUTIONARY: 'gold',
  BOUNTY_HUNTER: 'neutral',
}

export function AffiliationBadge({
  affiliation,
  className = '',
}: AffiliationBadgeProps) {
  return (
    <Badge variant={affiliationVariantMap[affiliation]} className={className}>
      {AFFILIATION_LABELS[affiliation]}
    </Badge>
  )
}
