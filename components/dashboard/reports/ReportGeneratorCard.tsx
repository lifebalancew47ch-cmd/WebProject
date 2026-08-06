"use client"

import { useState, type FormEvent } from "react"
import { Download } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { FormField } from "@/components/ui/FormField"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { useAuth } from "@/lib/auth/AuthContext"
import { exportReport } from "@/lib/api/reporting"
import { ApiError } from "@/lib/api/client"
import type { ReportFormat, ReportScope } from "@/lib/api/reporting-types"
import { MAX_LENGTHS, sanitizeText, validateBoundedText, validateRequired } from "@/lib/validation/rules"

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

export function ReportGeneratorCard() {
  const { accessToken } = useAuth()
  const [scope, setScope] = useState<ReportScope>("individual")
  const [format, setFormat] = useState<ReportFormat>("pdf")
  const [metrics, setMetrics] = useState("heartRate")
  const [metricsError, setMetricsError] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setError(null)
    setSuccess(false)

    const message = validateRequired(metrics, "Las métricas") ?? validateBoundedText(metrics, "Las métricas", MAX_LENGTHS.reportMetrics)
    if (message) {
      setMetricsError(message)
      return
    }
    setMetricsError(undefined)

    setLoading(true)
    try {
      await exportReport({ scope, format, metrics: sanitizeText(metrics) }, accessToken)
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
        {success ? <AlertMessage type="success">Reporte generado correctamente.</AlertMessage> : null}
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

        <FormField
          label="Métricas"
          name="metrics"
          placeholder="heartRate,steps,sleep"
          maxLength={MAX_LENGTHS.reportMetrics}
          value={metrics}
          onChange={(e) => {
            setMetrics(e.target.value)
            if (metricsError) setMetricsError(undefined)
          }}
          error={metricsError}
        />

        <SubmitButton loading={loading} className="w-auto px-6">
          <Download className="h-4 w-4" /> Generar reporte
        </SubmitButton>
      </form>
    </Card>
  )
}
