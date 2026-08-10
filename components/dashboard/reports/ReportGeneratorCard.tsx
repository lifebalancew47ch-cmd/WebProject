"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { ChevronDown, Download } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { useAuth } from "@/lib/auth/AuthContext"
import { exportReport } from "@/lib/api/reporting"
import { ApiError } from "@/lib/api/client"
import type { ReportFormat, ReportScope } from "@/lib/api/reporting-types"

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-emerald-950">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-emerald-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/**
 * Códigos de métrica reales aceptados por `GET /api/v1/reports/export`,
 * confirmados en vivo el 2026-08-09 probando ~35 nombres candidatos uno por
 * uno (ver docs/REPORTING_API.md punto 9) — cualquier otro código responde
 * 422 "Unknown metric code". Con nombre técnico -> nombre entendible para
 * quien no conoce la API.
 *
 * El catálogo completo también acepta weight/height/systolicBp/diastolicBp/
 * spo2/hrv, pero esos 6 vienen de MedicalDataService, que no tiene ningún
 * endpoint de escritura en toda la app (ver memoria del proyecto) — y
 * probando en vivo con la cuenta demo Y con una cuenta real, los 6 siempre
 * regresan en 0. Ofrecerlos como "métrica a incluir" generaría reportes con
 * datos vacíos disfrazados de reales, así que solo se listan los 2 campos
 * que sí se confirmaron con valores reales en esta sesión.
 */
const METRIC_OPTIONS: { code: string; label: string }[] = [
  { code: "heartRate", label: "Ritmo cardíaco" },
  { code: "steps", label: "Pasos" },
]

/** Desplegable de selección múltiple: un botón que abre un panel con checkboxes. */
function MetricsDropdown({
  selected,
  onChange,
  error,
}: {
  selected: string[]
  onChange: (codes: string[]) => void
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  function toggle(code: string) {
    onChange(selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code])
  }

  const summary =
    selected.length === 0
      ? "Selecciona una o más métricas"
      : selected.length === 1
        ? (METRIC_OPTIONS.find((m) => m.code === selected[0])?.label ?? "1 métrica")
        : `${selected.length} métricas seleccionadas`

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-1.5 block text-sm font-semibold text-emerald-950">Métricas a incluir</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm outline-none transition-colors focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-emerald-200 focus:border-emerald-400 focus:ring-emerald-100"
        } ${selected.length === 0 ? "text-slate-400" : "text-slate-800"}`}
      >
        {summary}
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-20 mt-1.5 w-full rounded-xl border border-emerald-200 bg-white p-2 shadow-lg"
        >
          {METRIC_OPTIONS.map((opt) => (
            <label
              key={opt.code}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-emerald-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.code)}
                onChange={() => toggle(opt.code)}
                className="h-4 w-4 rounded border-emerald-300 text-emerald-700 focus:ring-emerald-400"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  )
}

export function ReportGeneratorCard() {
  const { accessToken } = useAuth()
  const [scope, setScope] = useState<ReportScope>("individual")
  const [format, setFormat] = useState<ReportFormat>("pdf")
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["heartRate"])
  const [metricsError, setMetricsError] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setError(null)
    setSuccess(false)

    if (selectedMetrics.length === 0) {
      setMetricsError("Selecciona al menos una métrica.")
      return
    }
    setMetricsError(undefined)

    setLoading(true)
    try {
      const file = await exportReport({ scope, format, metrics: selectedMetrics }, accessToken)
      downloadBlob(file.blob, file.filename ?? `reporte-${scope}.${format}`)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo generar el reporte.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
        Generar nuevo reporte
      </h3>
      <p className="mt-1 text-xs text-gray-500">Exporta un reporte con las métricas que necesites.</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
        {success ? <AlertMessage type="success">Reporte generado y descargado correctamente.</AlertMessage> : null}
        {error ? <AlertMessage type="error">{error}</AlertMessage> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Alcance"
            value={scope}
            onChange={(v) => setScope(v as ReportScope)}
            options={[
              { value: "individual", label: "Individual" },
              { value: "family", label: "Familia" },
              { value: "company", label: "Empresa" },
            ]}
          />
          <SelectField
            label="Formato"
            value={format}
            onChange={(v) => setFormat(v as ReportFormat)}
            options={[
              { value: "pdf", label: "PDF" },
              { value: "csv", label: "CSV" },
            ]}
          />
        </div>

        <MetricsDropdown selected={selectedMetrics} onChange={setSelectedMetrics} error={metricsError} />

        <SubmitButton loading={loading} className="w-auto px-6">
          <Download className="h-4 w-4" /> Generar reporte
        </SubmitButton>
      </form>
    </Card>
  )
}
