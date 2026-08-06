"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Archive, Bell, Loader2, Plus, Star, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"
import { FormField } from "@/components/ui/FormField"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { useAuth } from "@/lib/auth/AuthContext"
import { ApiError } from "@/lib/api/client"
import {
  archiveNotification,
  deleteNotification,
  favoriteNotification,
  listNotifications,
  markNotificationRead,
  sendNotification,
} from "@/lib/api/notifications"
import type { NotificationDto } from "@/lib/api/notifications-types"
import { MAX_LENGTHS, sanitizeText, validateBoundedText, validateRequired } from "@/lib/validation/rules"

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export function NotificationsPanel() {
  const { user, accessToken } = useAuth()

  const [items, setItems] = useState<NotificationDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rowActionId, setRowActionId] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [titleError, setTitleError] = useState<string | undefined>(undefined)
  const [bodyError, setBodyError] = useState<string | undefined>(undefined)
  const [formError, setFormError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    if (!user?.id || !accessToken) return
    setLoading(true)
    setError(null)
    try {
      const data = await listNotifications({ userId: user.id }, accessToken)
      setItems([...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar las notificaciones.")
    } finally {
      setLoading(false)
    }
  }, [user?.id, accessToken])

  useEffect(() => {
    load()
  }, [load])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!user?.id || !accessToken) return
    setFormError(null)

    const titleMessage = validateRequired(title, "El título") ?? validateBoundedText(title, "El título", MAX_LENGTHS.notificationTitle)
    const bodyMessage = validateRequired(body, "El mensaje") ?? validateBoundedText(body, "El mensaje", MAX_LENGTHS.notificationBody)
    setTitleError(titleMessage ?? undefined)
    setBodyError(bodyMessage ?? undefined)
    if (titleMessage || bodyMessage) {
      setFormError("Revisa los campos marcados antes de continuar.")
      return
    }

    setSending(true)
    try {
      await sendNotification(
        { userId: user.id, title: sanitizeText(title), body: sanitizeText(body), type: 0, channel: 0 },
        accessToken
      )
      setTitle("")
      setBody("")
      setShowForm(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No se pudo enviar la notificación.")
    } finally {
      setSending(false)
    }
  }

  async function handleAction(id: string, action: "read" | "archive" | "favorite" | "delete") {
    if (!accessToken) return
    setRowActionId(id)
    try {
      if (action === "read") await markNotificationRead(id, accessToken)
      else if (action === "archive") await archiveNotification(id, accessToken)
      else if (action === "favorite") await favoriteNotification(id, accessToken)
      else if (action === "delete") await deleteNotification(id, accessToken)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo completar la acción.")
    } finally {
      setRowActionId(null)
    }
  }

  const unreadCount = items.filter((n) => !n.isRead).length
  const todayCount = items.filter((n) => isToday(n.createdAt)).length
  const archivedCount = items.filter((n) => n.isArchived).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Sin leer" value={String(unreadCount)} />
        <StatCard label="Hoy" value={String(todayCount)} />
        <StatCard label="Archivadas" value={String(archivedCount)} />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-[#416B51] px-4 py-2 text-sm font-bold text-white transition-all hover:bg-[#345641]"
        >
          <Plus className="h-4 w-4" /> Enviar notificación de prueba
        </button>
      </div>

      {showForm ? (
        <Card className="p-6">
          <form onSubmit={handleSend} className="space-y-4" noValidate>
            {formError ? <AlertMessage type="error">{formError}</AlertMessage> : null}
            <FormField
              label="Título"
              name="title"
              required
              maxLength={MAX_LENGTHS.notificationTitle}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (titleError) setTitleError(undefined)
              }}
              error={titleError}
            />
            <FormField
              label="Mensaje"
              name="body"
              required
              maxLength={MAX_LENGTHS.notificationBody}
              value={body}
              onChange={(e) => {
                setBody(e.target.value)
                if (bodyError) setBodyError(undefined)
              }}
              error={bodyError}
            />
            <div className="flex items-center gap-3">
              <SubmitButton loading={sending} className="w-auto px-6">
                Enviar
              </SubmitButton>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      ) : null}

      {error ? <AlertMessage type="error">{error}</AlertMessage> : null}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-3 p-10 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Cargando notificaciones…</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12 text-center text-slate-400">
            <Bell className="h-8 w-8" />
            <p className="text-sm font-medium">No tienes notificaciones todavía.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.map((n) => {
              const busy = rowActionId === n.id
              return (
                <li
                  key={n.id}
                  className={`flex items-start justify-between gap-4 px-5 py-4 ${!n.isRead ? "bg-emerald-50/40" : ""}`}
                >
                  <button
                    type="button"
                    disabled={n.isRead || busy}
                    onClick={() => handleAction(n.id, "read")}
                    className="flex flex-1 items-start gap-3 text-left"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.isRead ? "bg-emerald-500" : "bg-transparent"}`}
                    />
                    <div className="min-w-0">
                      <p className={`text-sm ${!n.isRead ? "font-bold text-emerald-900" : "font-semibold text-slate-600"}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-500">{n.body}</p>
                      <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString("es-GT")}</p>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleAction(n.id, "favorite")}
                      title="Favorito"
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-amber-50 hover:text-amber-600 disabled:opacity-40 ${
                        n.isFavorite ? "text-amber-500" : "text-slate-400"
                      }`}
                    >
                      <Star className="h-4 w-4" fill={n.isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleAction(n.id, "archive")}
                      title="Archivar"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-700 disabled:opacity-40"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleAction(n.id, "delete")}
                      title="Eliminar"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
