"use client"

import { useCallback, useEffect, useState } from "react"
import { History, Loader2, ShieldAlert, ShieldQuestion } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { useAuth } from "@/lib/auth/AuthContext"
import { getLoginHistory, getSecurityEvents } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import type { AuditLogDto, LoginHistoryDto } from "@/lib/api/types"
import { ChangePasswordCard } from "@/components/dashboard/profile/ChangePasswordCard"

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })
}

/**
 * `/api/v1/Audit/*` requiere rol Admin (ver docs/AUTH_PROFILE_API.md) —
 * con una cuenta normal el backend responde 403, así que en vez de mostrar
 * un error genérico se explica por qué no hay datos.
 */
function AdminOnlyNotice() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
      <ShieldAlert className="h-4 w-4 shrink-0" />
      Esta información requiere permisos de administrador.
    </div>
  )
}

function EmptyNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
      <ShieldQuestion className="h-4 w-4 shrink-0" />
      {children}
    </div>
  )
}

function LoginHistorySection() {
  const { accessToken } = useAuth()
  const [items, setItems] = useState<LoginHistoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    setForbidden(false)
    try {
      const result = await getLoginHistory({ page: 1, pageSize: 10 }, accessToken)
      setItems(result.items ?? [])
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true)
      else setError(err instanceof ApiError ? err.message : "No se pudo cargar el historial de inicios de sesión.")
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4" style={{ color: "#2D5A43" }} />
        <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
          Historial de inicios de sesión
        </h3>
      </div>
      <p className="mt-1 text-xs text-gray-500">Últimos accesos a tu cuenta, exitosos y fallidos.</p>

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : forbidden ? (
          <AdminOnlyNotice />
        ) : error ? (
          <AlertMessage type="error">{error}</AlertMessage>
        ) : items.length === 0 ? (
          <EmptyNotice>Sin inicios de sesión registrados todavía.</EmptyNotice>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Dispositivo</th>
                  <th className="px-3 py-2">IP</th>
                  <th className="px-3 py-2">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id ?? idx} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-2.5 text-slate-600">{formatDate(item.loginAt)}</td>
                    <td className="px-3 py-2.5 text-slate-600">{item.device ?? item.userAgent ?? "—"}</td>
                    <td className="px-3 py-2.5 text-slate-500">{item.ipAddress ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={item.success ? "success" : "danger"}>
                        {item.success ? "Exitoso" : item.failureReason || "Fallido"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  )
}

function SecurityEventsSection() {
  const { accessToken } = useAuth()
  const [items, setItems] = useState<AuditLogDto[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    setForbidden(false)
    try {
      const result = await getSecurityEvents({ page: 1, pageSize: 10 }, accessToken)
      setItems(result.items ?? [])
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true)
      else setError(err instanceof ApiError ? err.message : "No se pudo cargar los eventos de seguridad.")
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" style={{ color: "#2D5A43" }} />
        <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
          Eventos de seguridad
        </h3>
      </div>
      <p className="mt-1 text-xs text-gray-500">Auditoría de acciones sensibles sobre tu cuenta y organización.</p>

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : forbidden ? (
          <AdminOnlyNotice />
        ) : error ? (
          <AlertMessage type="error">{error}</AlertMessage>
        ) : items.length === 0 ? (
          <EmptyNotice>Sin eventos de seguridad registrados todavía.</EmptyNotice>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Acción</th>
                  <th className="px-3 py-2">Recurso</th>
                  <th className="px-3 py-2">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id ?? idx} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-2.5 text-slate-600">{formatDate(item.createdAt)}</td>
                    <td className="px-3 py-2.5 font-medium text-emerald-900">{item.action ?? "—"}</td>
                    <td className="px-3 py-2.5 text-slate-500">{item.resourceType ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={item.success ? "success" : "danger"}>
                        {item.success ? "Exitoso" : item.errorMessage || "Fallido"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  )
}

export function SecurityContent() {
  return (
    <div className="flex-1 space-y-6">
      <ChangePasswordCard />
      <LoginHistorySection />
      <SecurityEventsSection />
    </div>
  )
}
