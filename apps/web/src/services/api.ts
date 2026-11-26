import axios, { AxiosError } from 'axios'

export const AUTH_TOKEN_STORAGE_KEY = 'grand_line_hub_token'

export function getStoredToken(): string | null {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string): void {
  try {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

export function clearStoredToken(): void {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    // Ignore storage errors
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface ApiErrorPayload {
  message?: string | string[]
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiErrorPayload | undefined
    if (Array.isArray(payload?.message) && payload.message.length > 0) {
      return payload.message[0]
    }
    if (typeof payload?.message === 'string' && payload.message.trim().length > 0) {
      return payload.message
    }
  }
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }
  return fallbackMessage
}
