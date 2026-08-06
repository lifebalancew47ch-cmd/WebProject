import type { UserProfileDto } from "@/lib/api/types"

const STORAGE_KEY = "lifebalance.auth.session"

export type StoredSession = {
  accessToken: string
  refreshToken: string
  expiresAt: string
  userProfile: UserProfileDto
}

export function loadSession(): StoredSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

export function saveSession(session: StoredSession) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
}
