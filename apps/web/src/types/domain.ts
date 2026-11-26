export type Affiliation =
  | 'PIRATE'
  | 'MARINE'
  | 'REVOLUTIONARY'
  | 'BOUNTY_HUNTER'

export type ChronicleCategory =
  | 'VOYAGE_LOG'
  | 'ISLAND_DISCOVERY'
  | 'AKUMA_NO_MI'
  | 'VOID_CENTURY'

export type ContractType = 'CREW_RECRUITMENT' | 'BOUNTY_HUNTER'

export type Sea = 'EAST_BLUE' | 'GRAND_LINE' | 'NEW_WORLD'

export type ContractStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'

export interface User {
  id: string
  name: string
  email: string
  affiliation: Affiliation
  bounty: number
  createdAt: string
}

export interface AuthorSummary {
  id: string
  name: string
  affiliation: Affiliation
  bounty: number
}

export interface CommentItem {
  id: string
  content: string
  chronicleId: string
  createdAt: string
  author: AuthorSummary
}

export interface Chronicle {
  id: string
  title: string
  content: string
  category: ChronicleCategory
  coverUrl: string | null
  authorId: string
  author: AuthorSummary
  likesCount: number
  commentsCount: number
  likedByMe: boolean
  comments: CommentItem[]
  createdAt: string
  updatedAt: string
}

export interface ChronicleLikeResult {
  chronicleId: string
  liked: boolean
  likesCount: number
}

export interface Contract {
  id: string
  title: string
  description: string
  type: ContractType
  reward: number
  sea: Sea
  status: ContractStatus
  authorId: string
  author: AuthorSummary
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
