"use client"

import { useEffect, useState } from "react"

function DigitTile({ value }: { value: string }) {
  return (
    <div
      className="flex h-14 w-10 items-center justify-center rounded-xl font-mono text-2xl font-black text-emerald-200 md:h-16 md:w-12 md:text-3xl"
      style={{
        background: "linear-gradient(180deg, rgba(16,185,129,0.18) 0%, rgba(2,6,23,0.95) 100%)",
        border: "1px solid rgba(110,231,183,0.45)",
        boxShadow: "0 0 22px rgba(52,211,153,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
        textShadow: "0 0 14px rgba(110,231,183,0.9)",
      }}
    >
      {value}
    </div>
  )
}

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const h24 = now?.getHours() ?? 0
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  const hh = String(h12).padStart(2, "0")
  const mm = String(now?.getMinutes() ?? 0).padStart(2, "0")
  const ss = String(now?.getSeconds() ?? 0).padStart(2, "0")
  const meridiem = h24 >= 12 ? "PM" : "AM"

  const dateLabel =
    now?.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" }) ?? ""

  return (
    <div className="relative flex h-72 w-full flex-col items-center justify-center gap-5 overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-950 to-black">
      {/* Resplandor decorativo */}
      <div className="pointer-events-none absolute h-56 w-56 rounded-full bg-emerald-400/25 blur-3xl" />

      {/* Rejilla sutil de fondo */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(48,227,152,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(48,227,152,0.5) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Reloj digital de dígitos cuadrados */}
      <div className="relative flex items-center gap-1.5 md:gap-2">
        <DigitTile value={hh[0]} />
        <DigitTile value={hh[1]} />
        <span className="mx-0.5 animate-pulse text-3xl font-black text-emerald-300 md:text-4xl">:</span>
        <DigitTile value={mm[0]} />
        <DigitTile value={mm[1]} />
        <span className="mx-0.5 animate-pulse text-3xl font-black text-emerald-300 md:text-4xl">:</span>
        <DigitTile value={ss[0]} />
        <DigitTile value={ss[1]} />
        <span
          className="ml-2 self-start rounded-md px-2 py-1 text-xs font-bold tracking-wider text-emerald-300"
          style={{ backgroundColor: "rgba(52,211,153,0.18)", border: "1px solid rgba(110,231,183,0.35)" }}
        >
          {meridiem}
        </span>
      </div>

      <p className="relative capitalize text-sm font-medium text-emerald-100/80">{dateLabel}</p>
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
          <button
            type="button"
            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Explorar Casos
          </button>
        </div>
      </div>

      {/* Columna derecha: reloj en tiempo real */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        <LiveClock />
      </div>
    </section>
  )
}
