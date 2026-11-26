import type {
  Contract,
  ContractStatus,
  ContractType,
  PaginatedResponse,
  Sea,
} from '../types/domain'
import { api } from './api'

export interface ListContractsParams {
  page?: number
  limit?: number
  search?: string
  sea?: Sea | ''
  type?: ContractType | ''
  status?: ContractStatus | ''
}

export interface CreateContractPayload {
  title: string
  description: string
  type: ContractType
  reward: number
  sea: Sea
}

export async function listContractsRequest(
  params: ListContractsParams = {},
): Promise<PaginatedResponse<Contract>> {
  const queryParams: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  }
  if (params.search?.trim()) {
    queryParams.search = params.search.trim()
  }
  if (params.sea) {
    queryParams.sea = params.sea
  }
  if (params.type) {
    queryParams.type = params.type
  }
  if (params.status) {
    queryParams.status = params.status
  }

  const { data } = await api.get<PaginatedResponse<Contract>>('/contracts', {
    params: queryParams,
  })
  return data
}

export async function createContractRequest(
  payload: CreateContractPayload,
): Promise<Contract> {
  const { data } = await api.post<Contract>('/contracts', {
    title: payload.title.trim(),
    description: payload.description.trim(),
    type: payload.type,
    reward: payload.reward,
    sea: payload.sea,
  })
  return data
}

export async function updateContractStatusRequest(
  contractId: string,
  status: ContractStatus,
): Promise<Contract> {
  const { data } = await api.patch<Contract>(`/contracts/${contractId}/status`, {
    status,
  })
  return data
}
