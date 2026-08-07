"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, FileText, Loader2, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"
import { useAuth } from "@/lib/auth/AuthContext"
import { getReportHistory } from "@/lib/api/reporting"
import { ApiError } from "@/lib/api/client"
import type { PaginatedReportResult, ReportHistoryItemDto } from "@/lib/api/reporting-types"

type Status = "loading" | "success" | "error"

export function ReportHistoryPanel() {
  const { accessToken } = useAuth()
  const [status, setStatus] = useState<Status>("loading")
  const [result, setResult] = useState<PaginatedReportResult<ReportHistoryItemDto> | null>(null)
  const [error, setError] = useState<{ message: string; status: number } | null>(null)

  const load = useCallback(async () => {
    if (!accessToken) return
    setStatus("loading")
    try {
      const data = await getReportHistory({ pageIndex: 1, pageSize: 10 }, accessToken)
      setResult(data)
      setStatus("success")
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null
      setError({ message: apiErr?.message ?? "No se pudo cargar el historial.", status: apiErr?.status ?? 0 })
      setStatus("error")
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Reportes generados" value={status === "success" ? String(result?.totalItems ?? 0) : "—"} />
        <StatCard label="Página actual" value={status === "success" ? `${result?.pageIndex ?? 1} de ${Math.max(result?.totalPages ?? 1, 1)}` : "—"} />
        <StatCard label="Tamaño de página" value={status === "success" ? String(result?.pageSize ?? 0) : "—"} />
      </div>

      <Card className="overflow-hidden">
        {status === "loading" ? (
          <div className="flex items-center justify-center gap-3 p-10 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Cargando historial…</span>
          </div>
        ) : status === "error" ? (
          <div className="space-y-4 p-6">
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                No se pudo cargar el historial ({error?.status || "sin respuesta"}). {error?.message}
              </span>
            </div>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" /> Reintentar
            </button>
          </div>
        ) : (result?.items.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12 text-center text-slate-500">
            <FileText className="h-8 w-8" />
            <p className="text-sm font-medium">No hay reportes generados todavía.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {result?.items.map((item, idx) => (
              <li key={item.id ?? idx} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700">{item.scope ?? "—"}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.generatedAt ?? "—"}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  {item.format ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
