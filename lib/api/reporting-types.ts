// Tipos derivados de docs/REPORTING_API.md (LifeBalance Reporting Service)

export interface PaginatedReportResult<T> {
  items: T[]
  totalItems: number
  pageIndex: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ReportHistoryItemDto {
  id?: string
  scope?: string
  format?: string
  generatedAt?: string
  status?: string
  [key: string]: unknown
}

export type ReportScope = "individual" | "family" | "company"
export type ReportFormat = "pdf" | "csv"

export interface ExportReportParams {
  scope: ReportScope
  scopeId?: string
  format: ReportFormat
  from?: string
  to?: string
  metrics: string
}
