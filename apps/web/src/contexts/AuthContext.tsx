import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '../services/api'
import {
  fetchCurrentUserRequest,
  loginRequest,
  registerUserRequest,
  type LoginPayload,
  type RegisterPayload,
} from '../services/auth.service'
import type { User } from '../types/domain'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState<boolean>(() =>
    Boolean(getStoredToken()),
  )

  useEffect(() => {
    const existingToken = getStoredToken()
    if (!existingToken) {
      return
    }

    let active = true

    fetchCurrentUserRequest()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser)
        }
      })
      .catch(() => {
        clearStoredToken()
        if (active) {
          setUser(null)
        }
      })
      .finally(() => {
        if (active) {
          setIsInitializing(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const { access_token } = await loginRequest(payload)
    setStoredToken(access_token)
    const currentUser = await fetchCurrentUserRequest()
    setUser(currentUser)
    return currentUser
  }, [])

  const register = useCallback(
    async (payload: RegisterPayload): Promise<User> => {
      await registerUserRequest(payload)
      const { access_token } = await loginRequest({
        email: payload.email,
        password: payload.password,
      })
      setStoredToken(access_token)
      const currentUser = await fetchCurrentUserRequest()
      setUser(currentUser)
      return currentUser
    },
    [],
  )

  const logout = useCallback(() => {
    clearStoredToken()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      register,
      logout,
    }),
    [user, isInitializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.')
  }
  return context
}
