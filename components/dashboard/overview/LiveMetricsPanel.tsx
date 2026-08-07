"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AlertTriangle,
  Flame,
  Footprints,
  HeartPulse,
  Loader2,
  RefreshCw,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import { getIndividualDashboard } from "@/lib/api/dashboard"
import { ApiError } from "@/lib/api/client"
import type { IndividualDashboardResponse } from "@/lib/api/dashboard-types"

type Status = "loading" | "success" | "error"

// Cada cuánto se refresca el panel en segundo plano mientras la pestaña está visible.
const REFRESH_INTERVAL_MS = 30_000

function timeAgoLabel(date: Date | null): string {
  if (!date) return ""
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000))
  if (seconds < 5) return "justo ahora"
  if (seconds < 60) return `hace ${seconds}s`
  const minutes = Math.round(seconds / 60)
  return `hace ${minutes} min`
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-white p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "#E2EFE7" }}>
        <Icon className="h-4 w-4" strokeWidth={2} style={{ color: "#2D5A43" }} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold" style={{ color: "#1E3E2B" }}>
        {value}
      </p>
    </div>
  )
}

export function LiveMetricsPanel() {
  const { user, accessToken } = useAuth()
  const [status, setStatus] = useState<Status>("loading")
  const [data, setData] = useState<IndividualDashboardResponse | null>(null)
  const [error, setError] = useState<{ message: string; status: number } | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  // Fuerza un re-render periódico solo para refrescar el texto "hace Xs".
  const [, setTick] = useState(0)
  const hasDataRef = useRef(false)

  const load = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (!user?.id || !accessToken) return
      // Refresco en segundo plano: no se reemplaza la vista por un spinner de
      // pantalla completa si ya hay datos previos — solo un indicador sutil.
      if (opts.silent && hasDataRef.current) {
        setIsRefreshing(true)
      } else {
        setStatus("loading")
      }
      try {
        const result = await getIndividualDashboard(user.id, accessToken)
        setData(result)
        setError(null)
        setStatus("success")
        setLastUpdated(new Date())
        hasDataRef.current = true
      } catch (err) {
        const apiErr = err instanceof ApiError ? err : null
        const nextError = { message: apiErr?.message ?? "No se pudo cargar el panel.", status: apiErr?.status ?? 0 }
        // Si ya teníamos datos en pantalla, un refresco fallido no debe borrarlos:
        // se conserva la última información válida y solo se registra el error.
        if (!hasDataRef.current) {
          setStatus("error")
        }
        setError(nextError)
      } finally {
        setIsRefreshing(false)
      }
    },
    [user?.id, accessToken]
  )

  // Carga inicial + auto-refresco mientras la pestaña esté visible ("EN VIVO" real).
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

  // Refresca el texto relativo ("hace 30s") sin volver a llamar al API.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5_000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="mb-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E2EFE7] px-3 py-1 text-xs font-semibold text-[#2D5A43]">
            <span className={`h-1.5 w-1.5 rounded-full bg-[#30E398] ${isRefreshing ? "animate-pulse" : ""}`} /> EN VIVO
          </span>
          <h2 className="text-xl font-bold" style={{ color: "#1E3E2B" }}>
            Tu Panorama Biométrico
          </h2>
        </div>

        {status === "success" && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {isRefreshing ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" /> Actualizando…
              </span>
            ) : (
              lastUpdated && <span>Actualizado {timeAgoLabel(lastUpdated)}</span>
            )}
            <button
              type="button"
              onClick={() => load({ silent: true })}
              disabled={isRefreshing}
              aria-label="Actualizar panel"
              className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#2D5A43] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        )}
      </div>

      {status === "success" && error && (
        <div className="mb-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>El último refresco falló ({error.status || "sin respuesta"}); mostrando los últimos datos obtenidos.</span>
        </div>
      )}

      {status === "loading" ? (
        <div className="flex items-center justify-center gap-3 rounded-3xl bg-[#F0F3F9] p-10 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Cargando datos en vivo…</span>
        </div>
      ) : status === "error" ? (
        <div className="rounded-3xl bg-[#F0F3F9] p-6 space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              No se pudo cargar el panel en vivo ({error?.status || "sin respuesta"}). {error?.message}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-gray-500">
            Problema conocido del backend (Dashboard Service) — no es un error de esta app. Ver{" "}
            <code className="rounded bg-white px-1">docs/DASHBOARD_SERVICE_API.md</code>.
          </p>
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-50"
            style={{ color: "#2D5A43" }}
          >
            <RefreshCw className="h-4 w-4" /> Reintentar
          </button>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon={HeartPulse} label="Ritmo cardíaco" value={`${Math.round(data.biometrics?.heartRate ?? 0)} lpm`} />
            <MetricCard icon={Footprints} label="Pasos hoy" value={(data.activity?.dailySteps ?? 0).toLocaleString()} />
            <MetricCard icon={Flame} label="Calorías" value={`${Math.round(data.activity?.caloriesBurned ?? 0)} kcal`} />
            <MetricCard
              icon={Trophy}
              label="Puntos / racha"
              value={`${data.rewards?.points ?? 0} pts · ${data.rewards?.currentStreakDays ?? 0}d`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: "#2D5A43" }} />
                <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
                  Recomendaciones
                </h3>
              </div>
              {data.recommendations && data.recommendations.length > 0 ? (
                <ul className="space-y-2.5">
                  {data.recommendations.map((rec) => (
                    <li key={rec.recommendationId} className="rounded-xl bg-[#F4F9F5] p-3">
                      <p className="text-sm font-semibold text-gray-800">{rec.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{rec.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Sin recomendaciones por ahora.</p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <HeartPulse className="h-4 w-4" style={{ color: "#2D5A43" }} />
                <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
                  Notificaciones recientes
                </h3>
              </div>
              {data.notifications && data.notifications.length > 0 ? (
                <ul className="space-y-2.5">
                  {data.notifications.map((n) => (
                    <li key={n.id} className="rounded-xl bg-[#F4F9F5] p-3">
                      <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{n.message}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Sin notificaciones recientes.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
