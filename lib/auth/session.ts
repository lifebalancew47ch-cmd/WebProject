import type { UserProfileDto } from "@/lib/api/types"

const STORAGE_KEY = "lifebalance.auth.session"

export type StoredSession = {
  accessToken: string
  refreshToken: string
  expiresAt: string
  userProfile: UserProfileDto
}

/**
 * Por qué esto NO son cookies HttpOnly (y no puede serlo desde este repo):
 * el sitio es un export estático (`output: 'export'` en next.config.mjs) —
 * no hay servidor Next propio que pueda fijar un `Set-Cookie` en el dominio
 * del frontend. El único que podría emitir una cookie HttpOnly es el backend
 * de Auth & Profile, en SU dominio (`lifebalance-auth-service.onrender.com`,
 * distinto al del frontend) — eso requeriría que ellos agreguen
 * `Set-Cookie: ...; HttpOnly; Secure; SameSite=None`, y que este cliente
 * mande `credentials: "include"` en cada fetch. Es un cambio de arquitectura
 * cross-origin que le corresponde al equipo de backend, no algo que el
 * frontend pueda simular unilateralmente.
 *
 * Mientras tanto, el token vive en localStorage con una ofuscación ligera
 * (ver `obfuscate`/`deobfuscate` abajo). Hay que ser honestos sobre lo que
 * esto SÍ y NO hace:
 *   - SÍ evita que el token quede a la vista con un vistazo casual a
 *     localStorage en DevTools (Application → Local Storage).
 *   - NO es cifrado real ni protege contra un ataque XSS: si un script
 *     malicioso corre en la página, puede llamar exactamente a las mismas
 *     funciones `loadSession()`/`deobfuscate()` de este archivo. La defensa
 *     real contra robo de token es evitar que ese script llegue a correr —
 *     por eso la sanitización de inputs (lib/security/sanitize.ts) y el
 *     "cero dangerouslySetInnerHTML" importan más que esta ofuscación.
 */
const OBFUSCATION_KEY = "LifeBalance-2026" // no es un secreto criptográfico, ver nota arriba.

function xorCipher(value: string): string {
  let result = ""
  for (let i = 0; i < value.length; i++) {
    result += String.fromCharCode(value.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length))
  }
  return result
}

function obfuscate(value: string): string {
  // btoa trabaja con code units UTF-16; el XOR de arriba puede producir
  // bytes fuera de rango Latin1, así que se pasa por encodeURIComponent
  // primero para que btoa nunca truene con caracteres no-ASCII (nombres,
  // acentos, etc. dentro del userProfile serializado).
  return btoa(encodeURIComponent(xorCipher(value)))
}

function deobfuscate(value: string): string {
  return xorCipher(decodeURIComponent(atob(value)))
}

export function loadSession(): StoredSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(deobfuscate(raw)) as StoredSession
  } catch {
    // Blob corrupto/ilegible (versión anterior sin ofuscar, manipulación
    // manual, etc.) — se trata como "no hay sesión" en vez de tronar.
    return null
  }
}

export function saveSession(session: StoredSession) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, obfuscate(JSON.stringify(session)))
}

/** Borra la sesión de almacenamiento persistente. Se llama en logout y en
 * cuanto el refresh token también expira (ver lib/api/client.ts, onExpired). */
export function clearSession() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
}
