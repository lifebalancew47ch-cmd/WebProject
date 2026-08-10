"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useIndividualDashboard } from "@/lib/dashboard/useIndividualDashboard"

/**
 * Colores de estado (good/warning/critical) tomados del palette de la skill
 * dataviz — fijos, nunca temáticos, reservados para severidad (nunca para
 * "serie 4"). Aquí indican qué tan sedentario ha sido el día real del
 * usuario, no una simulación.
 */
const STATUS_COLOR = { good: "#0ca30c", warning: "#fab219", critical: "#d03b3b" } as const

/**
 * Mockup del reloj inteligente LifeBalance: representa el dispositivo real
 * del producto (caja + banda + pantalla) con la hora en vivo y el anillo de
 * balance activo/sedentario de HOY, con datos reales de
 * `GET /api/v1/dashboard/individual` (mismo hook que usa LiveMetricsPanel,
 * cacheado — no dispara una segunda petición en esta misma página).
 */
function LiveWatchMockup() {
  const { data, status } = useIndividualDashboard()
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeLabel =
    now?.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true }) ?? "--:--"
  const dateLabel = now?.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" }) ?? ""

  const activeHours = (data?.activity?.activeMinutes ?? 0) / 60
  const sedentaryHours = data?.activity?.sedentaryHours ?? 0
  const totalHours = activeHours + sedentaryHours
  const hasData = status === "success" && totalHours > 0
  const sedentaryPct = hasData ? sedentaryHours / totalHours : 0

  const ringColor = !hasData
    ? "rgba(255,255,255,0.15)"
    : sedentaryPct < 0.5
      ? STATUS_COLOR.good
      : sedentaryPct < 0.75
        ? STATUS_COLOR.warning
        : STATUS_COLOR.critical

  const circumference = 2 * Math.PI * 46
  const dashOffset = hasData ? circumference * (1 - sedentaryPct) : 0

  const subLabel = status === "loading" ? "Cargando…" : hasData ? `${sedentaryHours.toFixed(1)}h sedentario hoy` : "Sin datos hoy"

  return (
    <div className="relative flex h-72 w-full flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-950 to-black">
      {/* Resplandor decorativo */}
      <div className="pointer-events-none absolute h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />

      {/* Rejilla sutil de fondo */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(48,227,152,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(48,227,152,0.5) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Reloj inteligente */}
      <div className="relative flex flex-col items-center">
        {/* Banda superior */}
        <div className="h-5 w-14 rounded-t-xl bg-gradient-to-b from-slate-700 to-slate-900" />

        {/* Caja / bisel */}
        <div
          className="relative flex items-center justify-center rounded-[2.25rem] p-2.5"
          style={{
            background: "linear-gradient(145deg, #334155, #0f172a)",
            boxShadow: "0 0 28px rgba(52,211,153,0.35), inset 0 1px 2px rgba(255,255,255,0.15)",
          }}
        >
          {/* Pantalla */}
          <div className="flex h-44 w-36 flex-col items-center justify-center gap-2 rounded-[1.75rem] bg-black px-3 py-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400/70">LifeBalance</span>

            {/* Anillo de balance activo/sedentario de hoy + hora */}
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 1s linear, stroke 0.6s ease" }}
                />
              </svg>
              {/* z-10 + relative: sin esto, el anillo (absolute) se pinta encima del
                  texto (estático) aunque vaya antes en el DOM — tapaba la hora. */}
              <div className="relative z-10 flex flex-col items-center">
                {status === "loading" && !data ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
                ) : (
                  <span
                    className="font-mono text-lg font-black text-emerald-100"
                    style={{ textShadow: "0 0 10px rgba(110,231,183,0.7)" }}
                  >
                    {timeLabel}
                  </span>
                )}
                <span className="text-center text-[9px] font-semibold uppercase tracking-wider text-emerald-300/80">
                  {subLabel}
                </span>
              </div>
            </div>

            <span className="capitalize text-[10px] font-medium text-emerald-100/70">{dateLabel}</span>
          </div>
        </div>

        {/* Banda inferior */}
        <div className="h-5 w-14 rounded-b-xl bg-gradient-to-t from-slate-700 to-slate-900" />
      </div>
    </div>
  )
}

export function AdminHeroSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
      {/* Columna izquierda */}
      <div>
        <span className="inline-block w-max mb-4 rounded-full bg-[#E2EFE7] px-3 py-1 text-xs font-medium text-[#2D5A43]">
          Proyecto LifeBalance
        </span>

        <h1 className="text-3xl font-bold mb-4 text-[#1E3E2B]">Vea LifeBalance en Acción</h1>

        <p className="text-sm leading-relaxed text-gray-600 mb-6">
          Nuestra tecnología avanzada de Computer Vision trasciende el monitoreo tradicional.
          LifeBalance analiza patrones biométricos en tiempo real para predecir el agotamiento
          antes de que ocurra, permitiendo una gestión ejecutiva proactiva y sostenible.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg bg-[#2D5A43] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1E3E2B]"
          >
            Agendar Demo Técnica
          </button>
        </div>
      </div>

      {/* Columna derecha: mockup del reloj inteligente en vivo */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        <LiveWatchMockup />
      </div>
    </section>
  )
}
