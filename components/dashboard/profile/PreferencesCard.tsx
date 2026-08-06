"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { useAuth } from "@/lib/auth/AuthContext"
import { getPreferences, updatePreferences } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import type { UserPreferenceDto } from "@/lib/api/types"
import { useToast } from "@/components/ui/ToastProvider"

type Status = "loading" | "success" | "error"

function SelectRow({
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

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <p className="text-sm text-gray-700">{label}</p>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ backgroundColor: checked ? "#2D5A43" : "#E2E5E3" }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out"
          style={{ transform: checked ? "translateX(16px)" : "translateX(0px)" }}
        />
      </button>
    </div>
  )
}

export function PreferencesCard() {
  const { accessToken } = useAuth()
  const { showToast } = useToast()
  const [status, setStatus] = useState<Status>("loading")
  const [prefs, setPrefs] = useState<UserPreferenceDto | null>(null)
  const [error, setError] = useState<{ message: string; status: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!accessToken) return
    setStatus("loading")
    try {
      const data = await getPreferences(accessToken)
      setPrefs(data)
      setStatus("success")
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null
      setError({ message: apiErr?.message ?? "No se pudieron cargar las preferencias.", status: apiErr?.status ?? 0 })
      setStatus("error")
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  function update<K extends keyof UserPreferenceDto>(key: K, value: UserPreferenceDto[K]) {
    setPrefs((p) => (p ? { ...p, [key]: value } : p))
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!accessToken || !prefs) return
    setSaveError(null)
    setSaving(true)
    try {
      const updated = await updatePreferences(
        {
          theme: prefs.theme ?? undefined,
          language: prefs.language ?? undefined,
          timezone: prefs.timezone ?? undefined,
          unitsSystem: prefs.unitsSystem ?? undefined,
          notificationsEnabled: prefs.notificationsEnabled,
          emailNotificationsEnabled: prefs.emailNotificationsEnabled,
          pushNotificationsEnabled: prefs.pushNotificationsEnabled,
          profileVisibility: prefs.profileVisibility ?? undefined,
          marketingConsent: prefs.marketingConsent,
          activitySharing: prefs.activitySharing,
        },
        accessToken
      )
      setPrefs(updated)
      showToast("Preferencias guardadas correctamente.")
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "No se pudieron guardar las preferencias.")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl bg-[#F0F3F9] p-10 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Cargando preferencias…</span>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="rounded-3xl bg-[#F0F3F9] p-6 space-y-4">
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            No se pudieron cargar las preferencias ({error?.status || "sin respuesta"}). {error?.message}
          </span>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-50"
          style={{ color: "#2D5A43" }}
        >
          <RefreshCw className="h-4 w-4" /> Reintentar
        </button>
      </div>
    )
  }

  if (!prefs) return null

  return (
    <Card className="p-6">
      <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
        Preferencias
      </h3>
      <p className="mt-1 text-xs text-gray-500">Idioma, unidades y notificaciones de la plataforma.</p>

      <form onSubmit={handleSave} className="mt-5 space-y-6">
        {saveError ? <AlertMessage type="error">{saveError}</AlertMessage> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectRow
            label="Tema"
            value={prefs.theme ?? "light"}
            onChange={(v) => update("theme", v)}
            options={[
              { value: "light", label: "Claro" },
              { value: "dark", label: "Oscuro" },
            ]}
          />
          <SelectRow
            label="Idioma"
            value={prefs.language ?? "es"}
            onChange={(v) => update("language", v)}
            options={[
              { value: "es", label: "Español" },
              { value: "en", label: "English" },
            ]}
          />
          <SelectRow
            label="Unidades"
            value={prefs.unitsSystem ?? "metric"}
            onChange={(v) => update("unitsSystem", v)}
            options={[
              { value: "metric", label: "Métrico" },
              { value: "imperial", label: "Imperial" },
            ]}
          />
          <SelectRow
            label="Visibilidad del perfil"
            value={prefs.profileVisibility ?? "public"}
            onChange={(v) => update("profileVisibility", v)}
            options={[
              { value: "public", label: "Público" },
              { value: "private", label: "Privado" },
            ]}
          />
        </div>

        <div className="divide-y divide-gray-100 border-y border-gray-100">
          <ToggleRow
            label="Notificaciones habilitadas"
            checked={prefs.notificationsEnabled}
            onChange={(v) => update("notificationsEnabled", v)}
          />
          <ToggleRow
            label="Notificaciones por correo"
            checked={prefs.emailNotificationsEnabled}
            onChange={(v) => update("emailNotificationsEnabled", v)}
          />
          <ToggleRow
            label="Notificaciones push"
            checked={prefs.pushNotificationsEnabled}
            onChange={(v) => update("pushNotificationsEnabled", v)}
          />
          <ToggleRow
            label="Compartir actividad"
            checked={prefs.activitySharing}
            onChange={(v) => update("activitySharing", v)}
          />
          <ToggleRow
            label="Consentimiento de marketing"
            checked={prefs.marketingConsent}
            onChange={(v) => update("marketingConsent", v)}
          />
        </div>

        <SubmitButton loading={saving} className="w-auto px-6">
          Guardar preferencias
        </SubmitButton>
      </form>
    </Card>
  )
}
