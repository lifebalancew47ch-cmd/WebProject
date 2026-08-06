"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import * as authApi from "@/lib/api/auth"
import { setSessionListener } from "@/lib/api/client"
import type { LoginRequest, RegisterRequest, UserProfileDto } from "@/lib/api/types"
import { clearSession, loadSession, saveSession } from "@/lib/auth/session"
import { decodeJwtPayload } from "@/lib/auth/jwt"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

type AuthContextValue = {
  status: AuthStatus
  user: UserProfileDto | null
  accessToken: string | null
  /**
   * El backend auto-provisiona una organización por usuario desde el
   * registro/login (incluso para cuentas individuales) y manda su id como
   * claim `organization_id` en el JWT — no hay endpoint "mi organización",
   * así que se lee directo del token.
   */
  organizationId: string | null
  login: (payload: LoginRequest) => Promise<UserProfileDto>
  register: (payload: RegisterRequest) => Promise<{ requiresEmailConfirmation: boolean }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [user, setUser] = useState<UserProfileDto | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null)

  useEffect(() => {
    const session = loadSession()
    if (session) {
      setUser(session.userProfile)
      setAccessToken(session.accessToken)
      setRefreshTokenValue(session.refreshToken)
      setStatus("authenticated")
    } else {
      setStatus("unauthenticated")
    }
  }, [])

  useEffect(() => {
    setSessionListener({
      onRefreshed: (newAccessToken, newRefreshToken) => {
        setAccessToken(newAccessToken)
        setRefreshTokenValue(newRefreshToken)
      },
      onExpired: () => {
        setUser(null)
        setAccessToken(null)
        setRefreshTokenValue(null)
        setStatus("unauthenticated")
      },
    })
    return () => setSessionListener({})
  }, [])

  const login = async (payload: LoginRequest) => {
    const data = await authApi.login(payload)
    if (!data.accessToken || !data.refreshToken) {
      throw new Error("Respuesta de login inválida.")
    }
    saveSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      userProfile: data.userProfile,
    })
    setUser(data.userProfile)
    setAccessToken(data.accessToken)
    setRefreshTokenValue(data.refreshToken)
    setStatus("authenticated")
    return data.userProfile
  }

  const register = async (payload: RegisterRequest) => {
    const data = await authApi.register(payload)
    return { requiresEmailConfirmation: data.requiresEmailConfirmation }
  }

  const logout = async () => {
    if (refreshTokenValue && accessToken) {
      try {
        await authApi.logout({ refreshToken: refreshTokenValue }, accessToken)
      } catch {
        // Best-effort: aunque falle en el backend, limpiamos la sesión local.
      }
    }
    clearSession()
    setUser(null)
    setAccessToken(null)
    setRefreshTokenValue(null)
    setStatus("unauthenticated")
  }

  const organizationId = useMemo(() => {
    if (!accessToken) return null
    const raw = decodeJwtPayload(accessToken)?.organization_id
    return typeof raw === "string" && raw ? raw : null
  }, [accessToken])

  const value = useMemo(
    () => ({ status, user, accessToken, organizationId, login, register, logout }),
    [status, user, accessToken, organizationId, refreshTokenValue]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  return ctx
}
