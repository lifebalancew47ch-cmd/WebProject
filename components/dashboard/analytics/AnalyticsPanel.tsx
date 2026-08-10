"use client"

import { useCallback, useEffect, useState } from "react"
import {
  AlertTriangle,
  Armchair,
  Award,
  Flame,
  Footprints,
  HeartPulse,
  Loader2,
  RefreshCw,
  Stethoscope,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { useAuth } from "@/lib/auth/AuthContext"
import { useIndividualDashboard } from "@/lib/dashboard/useIndividualDashboard"
import { getIndividualHeatmap, getIndividualStatistics } from "@/lib/api/dashboard"
import { ApiError } from "@/lib/api/client"
import type {
  IndividualDashboardResponse,
  IndividualHeatmapResponse,
  IndividualStatisticsResponse,
} from "@/lib/api/dashboard-types"

type Status = "loading" | "success" | "error"

/**
 * Colores de las 2 gráficas categóricas de este panel (Balance semanal),
 * validados con la skill dataviz — node scripts/validate_palette.js
 * "#1baf7a,#eb6834" --mode light --surface "#ffffff":
 * PASS en bandas de lightness/chroma, separación CVD (ΔE 9.2) y visión
 * normal (ΔE 27.6). WARN de contraste vs superficie para el verde (2.82 <
 * 3:1) — la mitigación exigida por la skill es no depender del color solo:
 * por eso el valor y el % siempre van en texto (leyenda), nunca solo el
 * color del segmento.
 */
/** Status palette de la skill dataviz — fijo, reservado para severidad. */
const STATUS_COLOR = { good: "#0ca30c", warning: "#fab219", critical: "#d03b3b" } as const
type Tone = keyof typeof STATUS_COLOR

/**
 * Meter: "A single ratio against a limit" (ver choosing-a-form.md) — el
 * relleno lleva el color de severidad, la pista vacía es un gris fijo. El
 * valor va etiquetado directamente (nunca solo el color).
 */
function Meter({ value, min, max, tone }: { value: number; min: number; max: number; tone: Tone }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
  return (
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: STATUS_COLOR[tone] }}
      />
    </div>
  )
}

function MeterCard({
  icon: Icon,
  label,
  value,
  unit,
  rangeLabel,
  tone,
  meter,
}: {
  icon: LucideIcon
  label: string
  value: string
  unit?: string
  rangeLabel: string
  tone: Tone
  meter: { value: number; min: number; max: number }
}) {
  return (
    <div className="rounded-2xl bg-white p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "#E2EFE7" }}>
        <Icon className="h-4 w-4" strokeWidth={2} style={{ color: "#2D5A43" }} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold" style={{ color: "#1E3E2B" }}>
        {value}
        {unit ? <span className="ml-1 text-sm font-semibold text-gray-500">{unit}</span> : null}
      </p>
      <Meter value={meter.value} min={meter.min} max={meter.max} tone={tone} />
      <p className="mt-1.5 text-[11px] text-gray-500">{rangeLabel}</p>
    </div>
  )
}

/** Zonas típicas de ritmo cardíaco en reposo (AHA) — no inventadas. */
function heartRateTone(bpm: number): Tone {
  if (bpm < 50 || bpm > 120) return "critical"
  if (bpm < 60 || bpm > 100) return "warning"
  return "good"
}

/**
 * Tono según el progreso hacia la meta de pasos — usa `stepsProgress`/
 * `dailyStepsTarget` reales del backend (confirmado en vivo el 2026-08-09,
 * ver dashboard-types.ts) en vez de una referencia genérica inventada.
 */
function stepsTone(progressPct: number): Tone {
  if (progressPct >= 100) return "good"
  if (progressPct >= 50) return "warning"
  return "critical"
}

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

/**
 * Mapa de calor real: celdas coloreadas por intensidad (escala secuencial
 * de un solo hue, ver color-formula.md — "sequential = one hue, light→dark"),
 * no barras. 24 valores reales de `getIndividualHeatmap`.
 */
function HeatmapGrid({ hourlyHeatmap }: { hourlyHeatmap: number[] }) {
  const max = Math.max(1, ...hourlyHeatmap)
  return (
    <div className="rounded-2xl bg-white p-6">
      <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
        Mapa de calor · Actividad por hora
      </h3>
      <p className="mt-1 text-xs text-gray-500">Intensidad de actividad en cada una de las últimas 24 horas.</p>

      <div className="mt-6 grid grid-cols-12 gap-1.5 sm:grid-cols-[repeat(24,minmax(0,1fr))]">
        {hourlyHeatmap.map((value, hour) => {
          const intensity = max > 0 ? value / max : 0
          return (
            <div key={hour} className="group relative aspect-square">
              {/* Tooltip por celda: hover y foco de teclado */}
              <div
                role="tooltip"
                className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                style={{ backgroundColor: "#1E3E2B" }}
              >
                {hour}:00 · {value}
              </div>
              <div
                tabIndex={0}
                aria-label={`${hour}:00 — ${value}`}
                className="h-full w-full cursor-default rounded-md outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-emerald-400"
                style={{ backgroundColor: `rgba(45,90,67,${0.08 + intensity * 0.82})` }}
              />
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-gray-500">
        <span>00h</span>
        <span>06h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>

      {/* Leyenda de la escala — nunca solo color, siempre con texto a los extremos. */}
      <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-500">
        <span>Menos activo</span>
        <div
          className="h-2 flex-1 rounded-full"
          style={{ background: "linear-gradient(to right, rgba(45,90,67,0.08), rgba(45,90,67,0.9))" }}
        />
        <span>Más activo</span>
      </div>
    </div>
  )
}

/** Umbrales estándar AHA (mmHg) — no inventados. */
function bloodPressureStatus(systolic: number, diastolic: number): { label: string; tone: "success" | "warning" | "danger" } {
  if (systolic >= 130 || diastolic >= 80) return { label: "Alta", tone: "danger" }
  if (systolic >= 120) return { label: "Elevada", tone: "warning" }
  return { label: "Normal", tone: "success" }
}

/** Umbrales AHA por componente, para los mini-meters de sistólica/diastólica. */
function systolicTone(systolic: number): Tone {
  if (systolic >= 130) return "critical"
  if (systolic >= 120) return "warning"
  return "good"
}
function diastolicTone(diastolic: number): Tone {
  if (diastolic >= 90) return "critical"
  if (diastolic >= 80) return "warning"
  return "good"
}

/** Umbrales estándar OMS de IMC — no inventados. */
function bmiStatus(bmi: number): { label: string; tone: "success" | "warning" | "danger" } {
  if (bmi < 18.5) return { label: "Bajo peso", tone: "warning" }
  if (bmi < 25) return { label: "Normal", tone: "success" }
  if (bmi < 30) return { label: "Sobrepeso", tone: "warning" }
  return { label: "Obesidad", tone: "danger" }
}
function bmiTone(bmi: number): Tone {
  const status = bmiStatus(bmi)
  return status.tone === "success" ? "good" : status.tone === "warning" ? "warning" : "critical"
}

function BiometricsSection({ dashboard }: { dashboard: IndividualDashboardResponse | null }) {
  const bio = dashboard?.biometrics
  // El endpoint del Dashboard Service devuelve `recordedAt` con la hora
  // actual incluso cuando no hay ninguna lectura real — verificado en vivo
  // el 2026-08-07 (cuenta demo, todo en 0) y otra vez el 2026-08-09 (usuario
  // real: heartRate=80 real, pero systolicBp/diastolicBp/bmi en 0). Por eso
  // NO basta un solo "¿algún campo es real?" para la tarjeta completa: cada
  // sub-tarjeta (presión, IMC) se muestra solo si SUS PROPIOS campos son
  // distintos de 0 — si no, mostraría "0/0 mmHg · Normal" como si fuera una
  // lectura real cuando en realidad nunca se tomó. No mostramos peso: no
  // hay ningún endpoint en los 6 microservicios documentados donde el
  // usuario pueda registrarlo (ver memoria del proyecto).
  const hasBp = Boolean(bio && (bio.systolicBp || bio.diastolicBp))
  const hasBmi = Boolean(bio && bio.bmi)

  return (
    <div className="rounded-2xl bg-white p-6">
      <div className="flex items-center gap-2">
        <Stethoscope className="h-4 w-4" style={{ color: "#2D5A43" }} />
        <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
          Última lectura médica
        </h3>
      </div>

      {!hasBp && !hasBmi ? (
        <p className="mt-3 text-sm text-gray-500">
          Todavía no hay una lectura de presión arterial o IMC registrada.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {hasBp && (
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Presión arterial</p>
                <Badge tone={bloodPressureStatus(bio!.systolicBp, bio!.diastolicBp).tone}>
                  {bloodPressureStatus(bio!.systolicBp, bio!.diastolicBp).label}
                </Badge>
              </div>
              <p className="mt-1 text-xl font-extrabold" style={{ color: "#1E3E2B" }}>
                {bio!.systolicBp}/{bio!.diastolicBp} <span className="text-sm font-semibold text-gray-500">mmHg</span>
              </p>

              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Sistólica</p>
              <Meter value={bio!.systolicBp} min={80} max={180} tone={systolicTone(bio!.systolicBp)} />
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Diastólica</p>
              <Meter value={bio!.diastolicBp} min={50} max={120} tone={diastolicTone(bio!.diastolicBp)} />
              <p className="mt-2 text-[11px] text-gray-500">Referencia AHA: normal &lt;120/80 mmHg.</p>
            </div>
          )}

          {hasBmi && (
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Índice de masa corporal</p>
                <Badge tone={bmiStatus(bio!.bmi).tone}>{bmiStatus(bio!.bmi).label}</Badge>
              </div>
              <p className="mt-1 text-xl font-extrabold" style={{ color: "#1E3E2B" }}>
                {bio!.bmi.toFixed(1)}
              </p>
              <Meter value={bio!.bmi} min={15} max={35} tone={bmiTone(bio!.bmi)} />
              <p className="mt-2 text-[11px] text-gray-500">Referencia OMS: normal 18.5–24.9.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Verificado en vivo el 2026-08-09: `/individual/rewards` (endpoint
 * dedicado) y `/individual` (agregado) coinciden exactamente — a diferencia
 * de biometrics, aquí un 0 sí es un 0 real, no un placeholder del backend.
 */
function RewardsSection({ dashboard }: { dashboard: IndividualDashboardResponse | null }) {
  const rewards = dashboard?.rewards
  const recentRewards = rewards?.recentRewards ?? []

  return (
    <div className="rounded-2xl bg-white p-6">
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4" style={{ color: "#2D5A43" }} />
        <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
          Recompensas
        </h3>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-extrabold" style={{ color: "#1E3E2B" }}>
            {rewards?.badgesUnlocked ?? 0}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Insignias</p>
        </div>
        <div className="rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-extrabold" style={{ color: "#1E3E2B" }}>
            {rewards?.points ?? 0}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Puntos</p>
        </div>
        <div className="rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-extrabold" style={{ color: "#1E3E2B" }}>
            {rewards?.currentStreakDays ?? 0}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Días de racha</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Insignias recientes</p>
        {recentRewards.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {recentRewards.map((reward, idx) => (
              <li
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F9F5] px-3 py-1.5 text-xs font-semibold text-emerald-900"
              >
                <Award className="h-3 w-3" style={{ color: "#2D5A43" }} />
                {reward}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-500">Aún no hay insignias desbloqueadas.</p>
        )}
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

  // Compartido con LiveMetricsPanel / AdminHeroSection (Overview) — mismo
  // cache por userId, así que si el usuario ya visitó Overview en esta
  // sesión, calorías/insignias/biométricos aparecen sin esperar red.
  const { data: dashboard } = useIndividualDashboard()

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

  const heartRate = stats?.averageHeartRate ?? 0
  const dailySteps = dashboard?.activity?.dailySteps ?? 0
  // dailyStepsTarget/stepsProgress: meta y progreso reales que ya calcula el
  // backend (confirmado en vivo el 2026-08-09) — con fallback a 8,000 solo
  // si el backend no los manda (cuenta sin meta configurada todavía).
  const stepsTarget = dashboard?.activity?.dailyStepsTarget ?? 8000
  const stepsProgress = dashboard?.activity?.stepsProgress ?? (stepsTarget > 0 ? (dailySteps / stepsTarget) * 100 : 0)

  return (
    <div className="space-y-6">
      {/* Meters: valores con un límite/rango de referencia real (ver
          choosing-a-form.md — "a single ratio against a limit" = Meter). */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MeterCard
          icon={HeartPulse}
          label="Ritmo cardíaco promedio"
          value={`${Math.round(heartRate)}`}
          unit="lpm"
          rangeLabel="Reposo saludable: 60–100 lpm (AHA)."
          tone={heartRateTone(heartRate)}
          meter={{ value: heartRate, min: 40, max: 140 }}
        />
        <MeterCard
          icon={Footprints}
          label="Pasos hoy"
          value={dailySteps.toLocaleString()}
          rangeLabel={`Meta de hoy: ${stepsTarget.toLocaleString()} pasos (${Math.round(stepsProgress)}% completado).`}
          tone={stepsTone(stepsProgress)}
          meter={{ value: dailySteps, min: 0, max: stepsTarget }}
        />
        <MeterCard
          icon={Armchair}
          label="Horas sedentarias esta semana"
          value={(stats?.sedentaryHoursThisWeek ?? 0).toFixed(1)}
          unit="h"
          rangeLabel="Referencia: por debajo de 30h/semana es la zona más saludable."
          tone={(stats?.sedentaryHoursThisWeek ?? 0) <= 30 ? "good" : (stats?.sedentaryHoursThisWeek ?? 0) <= 45 ? "warning" : "critical"}
          meter={{ value: stats?.sedentaryHoursThisWeek ?? 0, min: 0, max: 60 }}
        />
        <StatCard icon={Flame} label="Calorías hoy" value={`${Math.round(dashboard?.activity?.caloriesBurned ?? 0)} kcal`} />
      </div>

      <HeatmapGrid hourlyHeatmap={heatmap?.hourlyHeatmap ?? Array(24).fill(0)} />

      <BiometricsSection dashboard={dashboard} />
      <RewardsSection dashboard={dashboard} />
    </div>
  )
}
