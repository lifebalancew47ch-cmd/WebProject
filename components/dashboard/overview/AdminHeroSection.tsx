"use client"

import { useEffect, useId, useState } from "react"

/**
 * Mockup del reloj inteligente LifeBalance: en vez de un reloj digital
 * genérico, representa el dispositivo real del producto (caja + banda +
 * pantalla) con la hora en vivo y el anillo de puntuación sedentaria que
 * describe el resto de la sección ("Vea LifeBalance en Acción").
 */
function LiveWatchMockup() {
  const gradientId = useId()
  const [now, setNow] = useState<Date | null>(null)
  const [secondsInactive, setSecondsInactive] = useState(0)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => {
      setNow(new Date())
      // Simula minutos sedentarios acumulados para el anillo (0-45 min, en loop).
      setSecondsInactive((prev) => (prev + 1) % 46)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const timeLabel =
    now?.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true }) ?? "--:--"
  const dateLabel = now?.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" }) ?? ""

  const ringPct = secondsInactive / 45
  const circumference = 2 * Math.PI * 46
  const dashOffset = circumference * (1 - ringPct)

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

            {/* Anillo de puntuación sedentaria + hora */}
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="16%" stopColor="#f97316" />
                    <stop offset="33%" stopColor="#eab308" />
                    <stop offset="50%" stopColor="#22c55e" />
                    <stop offset="66%" stopColor="#06b6d4" />
                    <stop offset="83%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              {/* z-10 + relative: sin esto, el anillo (absolute) se pinta encima del
                  texto (estático) aunque vaya antes en el DOM — tapaba la hora. */}
              <div className="relative z-10 flex flex-col items-center">
                <span
                  className="font-mono text-lg font-black text-emerald-100"
                  style={{ textShadow: "0 0 10px rgba(110,231,183,0.7)" }}
                >
                  {timeLabel}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-300/80">
                  {secondsInactive >= 45 ? "¡Muévete!" : `${45 - secondsInactive} min hasta pausa`}
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
