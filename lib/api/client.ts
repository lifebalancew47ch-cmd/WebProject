import type { ApiResponse } from "./types"
import { loadSession, saveSession, clearSession } from "@/lib/auth/session"

export const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ?? "https://lifebalance-auth-service.onrender.com"

/**
 * `AuthContext` se suscribe aquí para enterarse cuando `jsonFetch` refresca el
 * access token en segundo plano (tras un 401), o cuando el refresh token
 * también expiró y hay que forzar logout. Evita un import circular: este
 * módulo no importa de `AuthContext`, es al revés.
 */
type SessionListener = {
  onRefreshed?: (accessToken: string, refreshToken: string, expiresAt: string) => void
  onExpired?: () => void
}
let sessionListener: SessionListener = {}
export function setSessionListener(listener: SessionListener) {
  sessionListener = listener
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const session = loadSession()
  if (!session?.refreshToken || !session.accessToken) return null
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${AUTH_API_BASE_URL}/api/v1/Auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: session.accessToken, refreshToken: session.refreshToken }),
      })
      if (!res.ok) return null
      const text = await res.text()
      const body = text ? JSON.parse(text) : null
      const data = body?.data
      if (!data?.accessToken || !data?.refreshToken) return null

      saveSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        userProfile: session.userProfile,
      })
      sessionListener.onRefreshed?.(data.accessToken, data.refreshToken, data.expiresAt)
      return data.accessToken as string
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/**
 * Los backends de LifeBalance devuelven errores en dos formatos distintos:
 * 1) El envelope estándar ApiResponse: { success:false, errors: string[] }
 * 2) ProblemDetails de validación de ASP.NET: { title, errors: [{ field, message }] }
 */
type ValidationProblemDetails = {
  title?: string
  detail?: string
  errors?: Array<{ field?: string; message?: string }> | Record<string, string[]>
}

export class ApiError extends Error {
  status: number
  fieldErrors: string[]

  constructor(message: string, status: number, fieldErrors: string[] = []) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function extractErrorMessage(status: number, body: unknown): ApiError {
  if (body && typeof body === "object") {
    const asApiResponse = body as Partial<ApiResponse<unknown>>
    const stringErrors = Array.isArray(asApiResponse.errors)
      ? asApiResponse.errors.filter((e): e is string => typeof e === "string")
      : []

    // Envelope ApiResponse con errores de campo concretos.
    if (stringErrors.length > 0) {
      return new ApiError(asApiResponse.message || stringErrors[0], status, stringErrors)
    }
    // Envelope ApiResponse sin errores de campo pero con `message` (p.ej.
    // "Invalid or expired reset token."): no debe caer al mensaje genérico.
    if (asApiResponse.message) {
      return new ApiError(asApiResponse.message, status, [asApiResponse.message])
    }

    const asProblem = body as ValidationProblemDetails
    if (Array.isArray(asProblem.errors) && asProblem.errors.length > 0) {
      const fieldErrors = asProblem.errors
        .map((e) => (typeof e === "string" ? e : e.message))
        .filter((m): m is string => Boolean(m))
      if (fieldErrors.length > 0) {
        return new ApiError(fieldErrors[0], status, fieldErrors)
      }
    }
    if (asProblem.errors && typeof asProblem.errors === "object" && !Array.isArray(asProblem.errors)) {
      const fieldErrors = Object.values(asProblem.errors).flat().filter(Boolean) as string[]
      if (fieldErrors.length > 0) {
        return new ApiError(fieldErrors[0], status, fieldErrors)
      }
    }
    if (asProblem.title || asProblem.detail) {
      const msg = asProblem.detail || asProblem.title || "Ocurrió un error."
      return new ApiError(msg, status, [msg])
    }
  }
  return new ApiError(`Error ${status} al comunicarse con el servidor.`, status)
}

/**
 * Petición JSON genérica contra cualquier backend de LifeBalance. Si la respuesta
 * trae el envelope { success, data, errors } lo desenvuelve y retorna `data`;
 * si no, retorna el body tal cual (usado por servicios cuyo shape de respuesta
 * no está documentado, p.ej. Notifications).
 *
 * `trustHttpStatus`: algunos endpoints de Notifications (PATCH .../read,
 * .../favorite, .../archive) devuelven `200 OK` con `success: false` aunque
 * la operación sí se aplicó (confirmado comparando el estado antes/después)
 * — es un bug del backend en el envelope, no en la operación. Con esta opción
 * en `true` se ignora el flag `success` y se confía en el status HTTP.
 */
export async function jsonFetch<T>(
  baseUrl: string,
  path: string,
  options: RequestInit = {},
  token?: string | null,
  trustHttpStatus: boolean = false,
  _isRetry: boolean = false
): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Intenta de nuevo.", 0)
  }

  const text = await res.text()
  const body = text ? JSON.parse(text) : null

  if (!res.ok) {
    // Un 401 con token adjunto significa que expiró (no que falte) — se
    // intenta refrescar una sola vez y reintentar la misma petición antes
    // de propagar el error. Los endpoints [AllowAnonymous] (login, register,
    // refresh-token) nunca mandan token, así que nunca entran aquí.
    if (res.status === 401 && token && !_isRetry) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        return jsonFetch<T>(baseUrl, path, options, newToken, trustHttpStatus, true)
      }
      clearSession()
      sessionListener.onExpired?.()
    }
    throw extractErrorMessage(res.status, body)
  }

  const envelope = body as ApiResponse<T> | null
  if (envelope && typeof envelope === "object" && "success" in envelope) {
    if (!envelope.success && !trustHttpStatus) {
      throw extractErrorMessage(res.status, envelope)
    }
    return envelope.data as T
  }

  return body as T
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  return jsonFetch<T>(AUTH_API_BASE_URL, path, options, token)
}
