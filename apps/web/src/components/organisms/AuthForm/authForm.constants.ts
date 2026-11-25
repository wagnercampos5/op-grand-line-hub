import type { SelectOption } from '../../atoms/Select'

export const AFFILIATION_OPTIONS: readonly SelectOption[] = [
  { value: 'PIRATE', label: 'Pirata' },
  { value: 'MARINE', label: 'Marinha' },
  { value: 'REVOLUTIONARY', label: 'Revolucionário' },
  { value: 'BOUNTY_HUNTER', label: 'Caçador de Recompensas' },
] as const
