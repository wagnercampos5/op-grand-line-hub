import { useId } from 'react'
import { Avatar } from '../../atoms/Avatar'
import { Badge, type BadgeVariant } from '../../atoms/Badge'
import { Label } from '../../atoms/Label'
import { Select, type SelectOption } from '../../atoms/Select'
import { WantedStamp } from '../../atoms/WantedStamp'
import { AffiliationBadge } from '../../molecules/AffiliationBadge'
import type { Contract, ContractStatus } from '../../../types/domain'
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_TYPE_LABELS,
  formatMaritimeDate,
  SEA_LABELS,
} from '../../../utils/formatters'

export interface ContractCardProps {
  contract: Contract
  currentUserId?: string
  isUpdatingStatus?: boolean
  onUpdateStatus?: (
    contractId: string,
    nextStatus: ContractStatus,
  ) => void | Promise<void>
}

const statusVariantMap: Record<ContractStatus, BadgeVariant> = {
  OPEN: 'gold',
  IN_PROGRESS: 'info',
  COMPLETED: 'neutral',
}

const STATUS_OPTIONS: readonly SelectOption[] = [
  { value: 'OPEN', label: CONTRACT_STATUS_LABELS.OPEN },
  { value: 'IN_PROGRESS', label: CONTRACT_STATUS_LABELS.IN_PROGRESS },
  { value: 'COMPLETED', label: CONTRACT_STATUS_LABELS.COMPLETED },
] as const

export function ContractCard({
  contract,
  currentUserId,
  isUpdatingStatus = false,
  onUpdateStatus,
}: ContractCardProps) {
  const statusSelectId = useId()
  const isOwner = Boolean(currentUserId && currentUserId === contract.authorId)
  const isBounty = contract.type === 'BOUNTY_HUNTER'

  return (
    <article
      className={`flex flex-col justify-between rounded-2xl border bg-ship-deck/85 p-6 transition-colors ${
        isBounty
          ? 'border-crimson-bounty/30 hover:border-crimson-bounty/55'
          : 'border-log-pose-cyan/30 hover:border-log-pose-cyan/55'
      }`}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isBounty ? 'danger' : 'info'}>
              {CONTRACT_TYPE_LABELS[contract.type]}
            </Badge>
            <Badge variant="neutral">{SEA_LABELS[contract.sea]}</Badge>
          </div>
          <Badge variant={statusVariantMap[contract.status]}>
            {CONTRACT_STATUS_LABELS[contract.status]}
          </Badge>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold leading-snug text-parchment">
            {contract.title}
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-parchment/90">
            {contract.description}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4 border-t border-mist-gray/15 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-mist-gray">
            {isBounty ? 'Recompensa pela Captura' : 'Bônus de Alistamento'}
          </span>
          <WantedStamp
            amount={contract.reward}
            variant={isBounty ? 'wanted' : 'bounty'}
            zeroText="Glória & Espólios"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar name={contract.author.name} size="sm" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-parchment">
                  {contract.author.name}
                </span>
                <AffiliationBadge affiliation={contract.author.affiliation} />
              </div>
              <time
                dateTime={contract.createdAt}
                className="block text-xs text-mist-gray"
              >
                Emitido em {formatMaritimeDate(contract.createdAt)}
              </time>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="rounded-xl border border-treasure-gold/25 bg-ocean-abyss/60 p-3">
            <Label htmlFor={statusSelectId} className="mb-1.5 block text-xs">
              Gerenciar status do seu contrato
            </Label>
            <Select
              id={statusSelectId}
              options={STATUS_OPTIONS}
              value={contract.status}
              disabled={isUpdatingStatus}
              onChange={(event) =>
                void onUpdateStatus?.(
                  contract.id,
                  event.target.value as ContractStatus,
                )
              }
            />
          </div>
        )}
      </div>
    </article>
  )
}
