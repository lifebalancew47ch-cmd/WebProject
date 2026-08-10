import { jsonFetch, blobFetch } from "./client"
import type { ExportedReportFile, ExportReportParams, PaginatedReportResult, ReportHistoryItemDto } from "./reporting-types"

/**
 * Cliente para el microservicio Reporting (docs/REPORTING_API.md).
 *
 * ⚠️ Verificado en vivo 2026-08-06: dashboard-summary, history y trends ya
 * responden 200. individual y statistics siguen fallando (ahora 500 en vez
 * del 503 "User profile ... unavailable" original). El bloqueante real sigue
 * siendo que el servicio no manda headers CORS en ninguna respuesta (ni
 * siquiera en las que sí devuelven 200) — el navegador descarta la respuesta
 * antes de que este cliente pueda leerla, aunque el backend haya generado el
 * dato/archivo correctamente. Pendiente de que el equipo de Reporting lo
 * habilite; no hay forma de esquivarlo desde este frontend (export estático,
 * sin proxy propio).
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

// No usa `reportingFetch`/`jsonFetch`: este endpoint responde un archivo
// binario (`application/pdf` o `text/csv` con `Content-Disposition:
// attachment`), no el envelope JSON. `jsonFetch` intentaría hacer
// `JSON.parse` sobre el PDF y fallaría siempre con "La respuesta del
// servidor no se pudo interpretar", aun si el backend genera el archivo bien.
export const exportReport = (params: ExportReportParams, token: string): Promise<ExportedReportFile> => {
  // El backend espera `metrics` repetido una vez por valor (?metrics=heartRate&metrics=steps),
  // NO una sola lista separada por comas — verificado en vivo el 2026-08-09:
  // mandar "heartRate,steps" completo lo interpreta como un solo código
  // desconocido y responde 422 ("Unknown metric code 'heartRate,steps'").
  const query = new URLSearchParams({
    scope: params.scope,
    format: params.format,
    ...(params.scopeId ? { scopeId: params.scopeId } : {}),
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
  })
  params.metrics.forEach((metric) => query.append("metrics", metric))
  return blobFetch(REPORTING_API_BASE_URL, `/api/v1/reports/export?${query.toString()}`, { method: "GET" }, token)
}
