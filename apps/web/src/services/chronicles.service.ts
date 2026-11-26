import type {
  Chronicle,
  ChronicleCategory,
  ChronicleLikeResult,
  CommentItem,
  PaginatedResponse,
} from '../types/domain'
import { api } from './api'

export interface ListChroniclesParams {
  page?: number
  limit?: number
  search?: string
  category?: ChronicleCategory | ''
}

export interface CreateChroniclePayload {
  title: string
  content: string
  category: ChronicleCategory
  coverUrl?: string
}

export async function listChroniclesRequest(
  params: ListChroniclesParams = {},
): Promise<PaginatedResponse<Chronicle>> {
  const queryParams: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  }
  if (params.search?.trim()) {
    queryParams.search = params.search.trim()
  }
  if (params.category) {
    queryParams.category = params.category
  }

  const { data } = await api.get<PaginatedResponse<Chronicle>>('/chronicles', {
    params: queryParams,
  })
  return data
}

export async function createChronicleRequest(
  payload: CreateChroniclePayload,
): Promise<Chronicle> {
  const body: CreateChroniclePayload = {
    title: payload.title.trim(),
    content: payload.content.trim(),
    category: payload.category,
    ...(payload.coverUrl?.trim() ? { coverUrl: payload.coverUrl.trim() } : {}),
  }
  const { data } = await api.post<Chronicle>('/chronicles', body)
  return data
}

export async function likeChronicleRequest(
  chronicleId: string,
): Promise<ChronicleLikeResult> {
  const { data } = await api.post<ChronicleLikeResult>(
    `/chronicles/${chronicleId}/likes`,
  )
  return data
}

export async function unlikeChronicleRequest(
  chronicleId: string,
): Promise<ChronicleLikeResult> {
  const { data } = await api.delete<ChronicleLikeResult>(
    `/chronicles/${chronicleId}/likes`,
  )
  return data
}

export async function createChronicleCommentRequest(
  chronicleId: string,
  content: string,
): Promise<CommentItem> {
  const { data } = await api.post<CommentItem>(
    `/chronicles/${chronicleId}/comments`,
    { content: content.trim() },
  )
  return data
}
