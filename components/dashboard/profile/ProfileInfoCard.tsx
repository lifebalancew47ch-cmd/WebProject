"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { AlertTriangle, Calendar, Clock, Loader2, Mail, Pencil, Phone, RefreshCw, X } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { FormField } from "@/components/ui/FormField"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { useAuth } from "@/lib/auth/AuthContext"
import { getProfile, updateProfile } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import type { UserProfileDto } from "@/lib/api/types"
import { MAX_LENGTHS, sanitizeText, validateName, validatePhone } from "@/lib/validation/rules"
import { flattenFieldErrors, profileUpdateSchema } from "@/lib/validation/schemas"

type EditForm = { firstName: string; lastName: string; phoneNumber: string }

function validateEditField(key: keyof EditForm, value: string): string | null {
  switch (key) {
    case "firstName":
      return validateName(value, "El nombre", MAX_LENGTHS.firstName)
    case "lastName":
      return validateName(value, "El apellido", MAX_LENGTHS.lastName)
    case "phoneNumber":
      return validatePhone(value)
    default:
      return null
  }
}

type Status = "loading" | "success" | "error"

function getInitials(firstName?: string | null, lastName?: string | null, fallback?: string | null) {
  const first = firstName?.trim()?.[0]
  const last = lastName?.trim()?.[0]
  if (first || last) return `${first ?? ""}${last ?? ""}`.toUpperCase()
  return fallback?.slice(0, 2).toUpperCase() ?? "?"
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("es-GT", { dateStyle: "medium", timeStyle: "short" })
}

export function ProfileInfoCard() {
  const { accessToken } = useAuth()
  const [status, setStatus] = useState<Status>("loading")
  const [profile, setProfile] = useState<UserProfileDto | null>(null)
  const [error, setError] = useState<{ message: string; status: number } | null>(null)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<EditForm>({ firstName: "", lastName: "", phoneNumber: "" })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof EditForm, string>>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!accessToken) return
    setStatus("loading")
    try {
      const data = await getProfile(accessToken)
      setProfile(data)
      setForm({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        phoneNumber: data.phoneNumber ?? "",
      })
      setStatus("success")
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null
      setError({ message: apiErr?.message ?? "No se pudo cargar el perfil.", status: apiErr?.status ?? 0 })
      setStatus("error")
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    // Re-entrancy guard: bloquea también un submit disparado por script
    // directo al <form>, que no respeta el atributo disabled del botón.
    if (saving) return
    if (!accessToken) return
    setSaveError(null)

    // Compuerta final antes de tocar la red — ver lib/validation/schemas.ts.
    const result = profileUpdateSchema.safeParse(form)
    if (!result.success) {
      setFieldErrors(flattenFieldErrors(result.error))
      setSaveError("Revisa los campos marcados antes de continuar.")
      return
    }
    setFieldErrors({})

    setSaving(true)
    try {
      const updated = await updateProfile(
        {
          firstName: sanitizeText(result.data.firstName),
          lastName: sanitizeText(result.data.lastName),
          phoneNumber: result.data.phoneNumber ? sanitizeText(result.data.phoneNumber) : undefined,
        },
        accessToken
      )
      setProfile(updated)
      setEditing(false)
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "No se pudo guardar el perfil.")
    } finally {
      setSaving(false)
    }
  }

  function updateField<K extends keyof EditForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handleBlur(key: keyof EditForm) {
    return () => {
      const message = validateEditField(key, form[key])
      setFieldErrors((prev) => ({ ...prev, [key]: message ?? undefined }))
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl bg-[#F0F3F9] p-10 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Cargando perfil…</span>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="rounded-3xl bg-[#F0F3F9] p-6 space-y-4">
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            No se pudo cargar el perfil ({error?.status || "sin respuesta"}). {error?.message}
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

  if (!profile) return null

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold"
            style={{ backgroundColor: "#E2EFE7", color: "#2D5A43" }}
          >
            {getInitials(profile.firstName, profile.lastName, profile.username)}
          </div>
          <div>
            <p className="text-base font-bold text-[#1E3E2B]">
              {[profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username}
            </p>
            <p className="text-sm text-gray-500">@{profile.username}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  profile.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}
              >
                {profile.isActive ? "Cuenta activa" : "Cuenta inactiva"}
              </span>
            </div>
          </div>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" /> Editar
          </button>
        ) : null}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="mt-6 space-y-4 border-t border-gray-100 pt-6" noValidate>
          {saveError ? <AlertMessage type="error">{saveError}</AlertMessage> : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Nombre"
              name="firstName"
              maxLength={MAX_LENGTHS.firstName}
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              onBlur={handleBlur("firstName")}
              error={fieldErrors.firstName}
            />
            <FormField
              label="Apellido"
              name="lastName"
              maxLength={MAX_LENGTHS.lastName}
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              onBlur={handleBlur("lastName")}
              error={fieldErrors.lastName}
            />
          </div>
          <FormField
            label="Teléfono"
            name="phoneNumber"
            type="tel"
            maxLength={MAX_LENGTHS.phoneNumber}
            value={form.phoneNumber}
            onChange={(e) => updateField("phoneNumber", e.target.value)}
            onBlur={handleBlur("phoneNumber")}
            error={fieldErrors.phoneNumber}
          />
          <div className="flex items-center gap-3">
            <SubmitButton loading={saving} className="w-auto px-6">
              Guardar cambios
            </SubmitButton>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setSaveError(null)
                setFieldErrors({})
                setForm({
                  firstName: profile.firstName ?? "",
                  lastName: profile.lastName ?? "",
                  phoneNumber: profile.phoneNumber ?? "",
                })
              }}
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4" /> Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Correo</p>
              <p className="text-sm text-gray-700">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Teléfono</p>
              <p className="text-sm text-gray-700">{profile.phoneNumber || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Miembro desde</p>
              <p className="text-sm text-gray-700">{formatDate(profile.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Último acceso</p>
              <p className="text-sm text-gray-700">{formatDate(profile.lastLoginAt)}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
