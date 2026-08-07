"use client"

import { useCallback, useEffect, useState } from "react"
import { Activity, AlertTriangle, Armchair, HeartPulse, Loader2, RefreshCw, type LucideIcon } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import { getIndividualHeatmap, getIndividualStatistics } from "@/lib/api/dashboard"
import { ApiError } from "@/lib/api/client"
import type { IndividualHeatmapResponse, IndividualStatisticsResponse } from "@/lib/api/dashboard-types"

type Status = "loading" | "success" | "error"

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
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

function HeatmapChart({ hourlyHeatmap }: { hourlyHeatmap: number[] }) {
  const max = Math.max(1, ...hourlyHeatmap)
  return (
    <div className="rounded-2xl bg-white p-6">
      <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
        Actividad por hora
      </h3>
      <p className="mt-1 text-xs text-gray-500">Distribución de actividad a lo largo de las últimas 24 horas.</p>
      <div className="mt-6 flex h-32 items-end gap-1.5">
        {hourlyHeatmap.map((value, hour) => (
          <div key={hour} className="group relative flex-1">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-[#2D5A43] to-[#30E398] transition-all"
              style={{ height: `${Math.max(4, (value / max) * 100)}%` }}
              title={`${hour}:00 — ${value}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-gray-500">
        <span>00h</span>
        <span>06h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
    </div>
  )
}

export function AnalyticsPanel() {
  const { user, accessToken } = useAuth()
  const [status, setStatus] = useState<Status>("loading")
  const [stats, setStats] = useState<IndividualStatisticsResponse | null>(null)
  const [heatmap, setHeatmap] = useState<IndividualHeatmapResponse | null>(null)
  const [error, setError] = useState<{ message: string; status: number } | null>(null)

  const load = useCallback(async () => {
    if (!user?.id || !accessToken) return
    setStatus("loading")
    try {
      const [statsResult, heatmapResult] = await Promise.all([
        getIndividualStatistics(user.id, accessToken),
        getIndividualHeatmap(user.id, accessToken),
      ])
      setStats(statsResult)
      setHeatmap(heatmapResult)
      setStatus("success")
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null
      setError({ message: apiErr?.message ?? "No se pudo cargar la analítica.", status: apiErr?.status ?? 0 })
      setStatus("error")
    }
  }, [user?.id, accessToken])

  useEffect(() => {
    load()
  }, [load])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl bg-[#F0F3F9] p-10 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Cargando analítica…</span>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="rounded-3xl bg-[#F0F3F9] p-6 space-y-4">
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            No se pudo cargar la analítica ({error?.status || "sin respuesta"}). {error?.message}
          </span>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-50"
          style={{ color: "#2D5A43" }}
        >
          <RefreshCw className="h-4 w-4" /> Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={HeartPulse} label="Ritmo cardíaco promedio" value={`${Math.round(stats?.averageHeartRate ?? 0)} lpm`} />
        <StatCard icon={Activity} label="Horas activas esta semana" value={`${(stats?.activeHoursThisWeek ?? 0).toFixed(1)} h`} />
        <StatCard icon={Armchair} label="Horas sedentarias esta semana" value={`${(stats?.sedentaryHoursThisWeek ?? 0).toFixed(1)} h`} />
      </div>

      <HeatmapChart hourlyHeatmap={heatmap?.hourlyHeatmap ?? Array(24).fill(0)} />
    </div>
  )
}
