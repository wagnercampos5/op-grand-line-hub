import type {
  Affiliation,
  ChronicleCategory,
  ContractStatus,
  ContractType,
  Sea,
} from '../types/domain'

const berriesFormatter = new Intl.NumberFormat('pt-BR')

export function formatBerries(amount: number): string {
  return `฿ ${berriesFormatter.format(amount)}`
}

export function formatMaritimeDate(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return isoDate
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export const AFFILIATION_LABELS: Record<Affiliation, string> = {
  PIRATE: 'Pirata',
  MARINE: 'Marinha',
  REVOLUTIONARY: 'Revolucionário',
  BOUNTY_HUNTER: 'Caçador de Recompensas',
}

export const CHRONICLE_CATEGORY_LABELS: Record<ChronicleCategory, string> = {
  VOYAGE_LOG: 'Relato de Navegação',
  ISLAND_DISCOVERY: 'Descoberta de Ilha',
  AKUMA_NO_MI: 'Estudo de Akuma no Mi',
  VOID_CENTURY: 'Século Perdido',
}

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  CREW_RECRUITMENT: 'Recrutamento de Tripulação',
  BOUNTY_HUNTER: 'Caça à Recompensa',
}

export const SEA_LABELS: Record<Sea, string> = {
  EAST_BLUE: 'East Blue',
  GRAND_LINE: 'Grand Line',
  NEW_WORLD: 'Novo Mundo',
}

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluído',
}
