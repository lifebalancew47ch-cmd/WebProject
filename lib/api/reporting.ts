import { jsonFetch } from "./client"
import type { ExportReportParams, PaginatedReportResult, ReportHistoryItemDto } from "./reporting-types"

/**
 * Cliente para el microservicio Reporting (docs/REPORTING_API.md).
 *
 * ⚠️ Verificado en vivo: dashboard-summary, individual, statistics y trends
 * devuelven 503 "User profile ... unavailable" (mismo bug que Dashboard
 * Service). Solo `history` está confirmado funcionando; `export` también
 * falla con el mismo 503 pero se intenta igual para reflejar el estado real.
 */

export const REPORTING_API_BASE_URL =
  process.env.NEXT_PUBLIC_REPORTING_API_URL ?? "https://lifebalance-reporting-service.onrender.com"

function reportingFetch<T>(path: string, token?: string | null) {
  return jsonFetch<T>(REPORTING_API_BASE_URL, path, { method: "GET" }, token)
}

export const getReportHistory = (
  params: { pageIndex: number; pageSize: number; scope?: string; format?: string },
  token: string
) => {
  const query = new URLSearchParams({
    pageIndex: String(params.pageIndex),
    pageSize: String(params.pageSize),
    ...(params.scope ? { scope: params.scope } : {}),
    ...(params.format ? { format: params.format } : {}),
  })
  return reportingFetch<PaginatedReportResult<ReportHistoryItemDto>>(`/api/v1/reports/history?${query.toString()}`, token)
}

export const exportReport = (params: ExportReportParams, token: string) => {
  const query = new URLSearchParams({
    scope: params.scope,
    format: params.format,
    metrics: params.metrics,
    ...(params.scopeId ? { scopeId: params.scopeId } : {}),
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
  })
  return reportingFetch<unknown>(`/api/v1/reports/export?${query.toString()}`, token)
}
