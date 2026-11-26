import type { Affiliation, User } from '../types/domain'
import { api } from './api'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  affiliation: Affiliation
}

export interface AuthTokenResponse {
  access_token: string
}

export async function loginRequest(
  payload: LoginPayload,
): Promise<AuthTokenResponse> {
  const { data } = await api.post<AuthTokenResponse>('/auth/login', payload)
  return data
}

export async function registerUserRequest(
  payload: RegisterPayload,
): Promise<User> {
  const { data } = await api.post<User>('/users', payload)
  return data
}

export async function fetchCurrentUserRequest(): Promise<User> {
  const { data } = await api.get<User>('/auth/me')
  return data
}
