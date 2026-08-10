"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useAuth } from "@/lib/auth/AuthContext"
import { getIndividualDashboard } from "@/lib/api/dashboard"
import { ApiError } from "@/lib/api/client"
import type { IndividualDashboardResponse } from "@/lib/api/dashboard-types"

// Cada cuánto se refresca en segundo plano mientras la pestaña está visible.
const REFRESH_INTERVAL_MS = 30_000

type CacheEntry = {
  data: IndividualDashboardResponse | null
  lastUpdated: Date | null
}

/**
 * Cache + pub/sub compartido por userId — la misma razón que usePlans /
 * useMySubscription: más de un componente en la misma página (LiveMetricsPanel
 * y el mockup del reloj en AdminHeroSection, ambos en Overview) necesitan el
 * mismo `GET /api/v1/dashboard/individual`. Un solo fetch, todos los
 * suscritos se refrescan juntos.
 */
const cache = new Map<string, CacheEntry>()
const listeners = new Map<string, Set<(entry: CacheEntry) => void>>()
const inflight = new Map<string, Promise<IndividualDashboardResponse>>()

function notify(userId: string, entry: CacheEntry) {
  cache.set(userId, entry)
  listeners.get(userId)?.forEach((fn) => fn(entry))
}

function fetchOnce(userId: string, token: string): Promise<IndividualDashboardResponse> {
  const existing = inflight.get(userId)
  if (existing) return existing
  const promise = getIndividualDashboard(userId, token).finally(() => inflight.delete(userId))
  inflight.set(userId, promise)
  return promise
}

export function useIndividualDashboard() {
  const { user, accessToken } = useAuth()
  const userId = user?.id ?? null

  const [data, setData] = useState<IndividualDashboardResponse | null>(
    userId ? (cache.get(userId)?.data ?? null) : null
  )
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    userId && cache.has(userId) ? "success" : "loading"
  )
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(userId ? (cache.get(userId)?.lastUpdated ?? null) : null)
  const [error, setError] = useState<{ message: string; status: number } | null>(null)
  const hasDataRef = useRef(Boolean(userId && cache.get(userId)?.data))

  const load = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (!userId || !accessToken) return
      if (opts.silent && hasDataRef.current) setIsRefreshing(true)
      else setStatus("loading")
      try {
        const result = await fetchOnce(userId, accessToken)
        notify(userId, { data: result, lastUpdated: new Date() })
        setError(null)
        setStatus("success")
        hasDataRef.current = true
      } catch (err) {
        const apiErr = err instanceof ApiError ? err : null
        const nextError = { message: apiErr?.message ?? "No se pudo cargar el panel.", status: apiErr?.status ?? 0 }
        if (!hasDataRef.current) setStatus("error")
        setError(nextError)
      } finally {
        setIsRefreshing(false)
      }
    },
    [userId, accessToken]
  )

  // Suscripción al cache compartido: si otro componente (u otro timer) trae
  // datos frescos, este también los recibe sin pedirlos de nuevo.
  useEffect(() => {
    if (!userId) return
    if (!listeners.has(userId)) listeners.set(userId, new Set())
    const set = listeners.get(userId)!
    const onUpdate = (entry: CacheEntry) => {
      setData(entry.data)
      setLastUpdated(entry.lastUpdated)
    }
    set.add(onUpdate)
    return () => {
      set.delete(onUpdate)
    }
  }, [userId])

  // Carga inicial + auto-refresco mientras la pestaña esté visible.
  useEffect(() => {
    load()
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") load({ silent: true })
    }, REFRESH_INTERVAL_MS)

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") load({ silent: true })
    }
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [load])

  return { data, status, error, isRefreshing, lastUpdated, reload: load }
}
