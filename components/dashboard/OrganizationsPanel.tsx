"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react"
import { Card } from "@/components/ui/Card"
import { FormField } from "@/components/ui/FormField"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { useAuth } from "@/lib/auth/AuthContext"
import { ApiError } from "@/lib/api/client"
import {
  activateOrganization,
  createOrganization,
  deleteOrganization,
  listOrganizations,
  restoreOrganization,
  suspendOrganization,
} from "@/lib/api/organizations"
import type { OrganizationDto, OrgPagedResult } from "@/lib/api/organizations-types"
import {
  MAX_LENGTHS,
  sanitizeText,
  validateBoundedText,
  validateEmail,
  validateName,
  validatePhone,
  validateRequired,
} from "@/lib/validation/rules"

const PAGE_SIZE = 8

const emptyForm = {
  name: "",
  taxId: "",
  planId: "",
  contactEmail: "",
  contactPhone: "",
  contactPerson: "",
  street: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
}

type OrgForm = typeof emptyForm

const ORG_FIELD_LABELS: Record<keyof OrgForm, string> = {
  name: "El nombre",
  taxId: "El Tax ID",
  planId: "El plan",
  contactEmail: "El email de contacto",
  contactPhone: "El teléfono",
  contactPerson: "La persona de contacto",
  street: "La calle",
  city: "La ciudad",
  state: "El estado/provincia",
  country: "El país",
  zipCode: "El código postal",
}

function validateOrgField(key: keyof OrgForm, value: string): string | null {
  switch (key) {
    case "name":
      return validateBoundedText(value, ORG_FIELD_LABELS.name, MAX_LENGTHS.organizationName)
    case "taxId":
      return validateBoundedText(value, ORG_FIELD_LABELS.taxId, MAX_LENGTHS.taxId)
    case "planId":
      return validateBoundedText(value, ORG_FIELD_LABELS.planId, MAX_LENGTHS.planId)
    case "contactEmail":
      return validateEmail(value)
    case "contactPhone":
      return validatePhone(value)
    case "contactPerson":
      return validateName(value, ORG_FIELD_LABELS.contactPerson, MAX_LENGTHS.contactPerson)
    case "street":
      return validateBoundedText(value, ORG_FIELD_LABELS.street, MAX_LENGTHS.street)
    case "city":
      return validateBoundedText(value, ORG_FIELD_LABELS.city, MAX_LENGTHS.city)
    case "state":
      return validateBoundedText(value, ORG_FIELD_LABELS.state, MAX_LENGTHS.state)
    case "country":
      return validateBoundedText(value, ORG_FIELD_LABELS.country, MAX_LENGTHS.country)
    case "zipCode":
      return validateBoundedText(value, ORG_FIELD_LABELS.zipCode, MAX_LENGTHS.zipCode)
    default:
      return null
  }
}

const REQUIRED_ORG_FIELDS: (keyof OrgForm)[] = ["name", "taxId", "planId", "zipCode"]

function StatusBadge({ org }: { org: OrganizationDto }) {
  const status = org.status ?? "Activa"
  const isSuspended = /suspend/i.test(status)
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isSuspended ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {status}
    </span>
  )
}

export function OrganizationsPanel() {
  const { accessToken } = useAuth()
  const [result, setResult] = useState<OrgPagedResult<OrganizationDto> | null>(null)
  const [pageIndex, setPageIndex] = useState(1)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rowActionId, setRowActionId] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof OrgForm, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      const data = await listOrganizations({ pageIndex, pageSize: PAGE_SIZE, search }, accessToken)
      setResult(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar las organizaciones.")
    } finally {
      setLoading(false)
    }
  }, [pageIndex, search, accessToken])

  useEffect(() => {
    load()
  }, [load])

  function updateField<K extends keyof OrgForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handleFieldBlur(key: keyof OrgForm) {
    return () => {
      const message = REQUIRED_ORG_FIELDS.includes(key)
        ? (validateRequired(form[key], ORG_FIELD_LABELS[key]) ?? validateOrgField(key, form[key]))
        : validateOrgField(key, form[key])
      setFieldErrors((prev) => ({ ...prev, [key]: message ?? undefined }))
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setFormError(null)

    const nextErrors: Partial<Record<keyof OrgForm, string>> = {}
    ;(Object.keys(emptyForm) as (keyof OrgForm)[]).forEach((key) => {
      const message = REQUIRED_ORG_FIELDS.includes(key)
        ? (validateRequired(form[key], ORG_FIELD_LABELS[key]) ?? validateOrgField(key, form[key]))
        : validateOrgField(key, form[key])
      if (message) nextErrors[key] = message
    })
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setFormError("Revisa los campos marcados antes de continuar.")
      return
    }

    setCreating(true)
    try {
      await createOrganization(
        {
          name: sanitizeText(form.name),
          taxId: sanitizeText(form.taxId),
          planId: sanitizeText(form.planId),
          contactInfo: {
            email: form.contactEmail ? sanitizeText(form.contactEmail) : null,
            phone: form.contactPhone ? sanitizeText(form.contactPhone) : null,
            contactPerson: form.contactPerson ? sanitizeText(form.contactPerson) : null,
          },
          address: {
            street: form.street ? sanitizeText(form.street) : null,
            city: form.city ? sanitizeText(form.city) : null,
            state: form.state ? sanitizeText(form.state) : null,
            country: form.country ? sanitizeText(form.country) : null,
            zipCode: form.zipCode ? sanitizeText(form.zipCode) : null,
          },
        },
        accessToken
      )
      setForm(emptyForm)
      setFieldErrors({})
      setShowForm(false)
      setPageIndex(1)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No se pudo crear la organización.")
    } finally {
      setCreating(false)
    }
  }

  async function handleRowAction(id: string, action: "activate" | "suspend" | "restore" | "delete") {
    if (!accessToken) return
    setRowActionId(id)
    try {
      if (action === "activate") await activateOrganization(id, accessToken)
      else if (action === "suspend") await suspendOrganization(id, accessToken)
      else if (action === "restore") await restoreOrganization(id, accessToken)
      else if (action === "delete") await deleteOrganization(id, accessToken)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo completar la acción.")
    } finally {
      setRowActionId(null)
    }
  }

  const items = result?.items ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setPageIndex(1)
            setSearch(searchInput)
          }}
          className="relative flex-1 min-w-[220px] max-w-md"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar organización…"
            maxLength={MAX_LENGTHS.search}
            className="w-full rounded-full border border-emerald-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </form>

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#416B51] px-4 py-2 text-sm font-bold text-white transition-all hover:bg-[#345641]"
        >
          <Plus className="h-4 w-4" /> Nueva organización
        </button>
      </div>

      {showForm ? (
        <Card className="p-6">
          <form onSubmit={handleCreate} className="space-y-4" noValidate>
            {formError ? <AlertMessage type="error">{formError}</AlertMessage> : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Nombre"
                name="name"
                required
                maxLength={MAX_LENGTHS.organizationName}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                onBlur={handleFieldBlur("name")}
                error={fieldErrors.name}
              />
              <FormField
                label="Tax ID"
                name="taxId"
                required
                maxLength={MAX_LENGTHS.taxId}
                value={form.taxId}
                onChange={(e) => updateField("taxId", e.target.value)}
                onBlur={handleFieldBlur("taxId")}
                error={fieldErrors.taxId}
              />
            </div>

            <FormField
              label="Plan"
              name="planId"
              placeholder="free / pro / business / enterprise"
              required
              maxLength={MAX_LENGTHS.planId}
              value={form.planId}
              onChange={(e) => updateField("planId", e.target.value)}
              onBlur={handleFieldBlur("planId")}
              error={fieldErrors.planId}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                label="Email de contacto"
                type="email"
                name="contactEmail"
                maxLength={MAX_LENGTHS.email}
                value={form.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                onBlur={handleFieldBlur("contactEmail")}
                error={fieldErrors.contactEmail}
              />
              <FormField
                label="Teléfono"
                name="contactPhone"
                maxLength={MAX_LENGTHS.phoneNumber}
                value={form.contactPhone}
                onChange={(e) => updateField("contactPhone", e.target.value)}
                onBlur={handleFieldBlur("contactPhone")}
                error={fieldErrors.contactPhone}
              />
              <FormField
                label="Persona de contacto"
                name="contactPerson"
                maxLength={MAX_LENGTHS.contactPerson}
                value={form.contactPerson}
                onChange={(e) => updateField("contactPerson", e.target.value)}
                onBlur={handleFieldBlur("contactPerson")}
                error={fieldErrors.contactPerson}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <FormField
                label="Calle"
                name="street"
                className="lg:col-span-2"
                maxLength={MAX_LENGTHS.street}
                value={form.street}
                onChange={(e) => updateField("street", e.target.value)}
                onBlur={handleFieldBlur("street")}
                error={fieldErrors.street}
              />
              <FormField
                label="Ciudad"
                name="city"
                maxLength={MAX_LENGTHS.city}
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                onBlur={handleFieldBlur("city")}
                error={fieldErrors.city}
              />
              <FormField
                label="Estado/Provincia"
                name="state"
                maxLength={MAX_LENGTHS.state}
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                onBlur={handleFieldBlur("state")}
                error={fieldErrors.state}
              />
              <FormField
                label="País"
                name="country"
                maxLength={MAX_LENGTHS.country}
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                onBlur={handleFieldBlur("country")}
                error={fieldErrors.country}
              />
              <FormField
                label="Código postal"
                name="zipCode"
                required
                maxLength={MAX_LENGTHS.zipCode}
                value={form.zipCode}
                onChange={(e) => updateField("zipCode", e.target.value)}
                onBlur={handleFieldBlur("zipCode")}
                error={fieldErrors.zipCode}
              />
            </div>

            <div className="flex items-center gap-3">
              <SubmitButton loading={creating} className="w-auto px-6">
                Crear organización
              </SubmitButton>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFieldErrors({})
                  setFormError(null)
                }}
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
            <span className="text-sm font-medium">Cargando organizaciones…</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12 text-center text-slate-400">
            <Building2 className="h-8 w-8" />
            <p className="text-sm font-medium">No hay organizaciones para mostrar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3">Organización</th>
                  <th className="px-5 py-3">Tax ID</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((org, idx) => {
                  const id = org.id ?? String(idx)
                  const isSuspended = /suspend/i.test(org.status ?? "")
                  const busy = rowActionId === id
                  return (
                    <tr key={id} className="border-b border-gray-50 last:border-0 hover:bg-black/[0.02]">
                      <td className="px-5 py-3 font-semibold text-emerald-900">{org.name ?? "—"}</td>
                      <td className="px-5 py-3 text-slate-500">{org.taxId ?? "—"}</td>
                      <td className="px-5 py-3 text-slate-500">{org.planId ?? "—"}</td>
                      <td className="px-5 py-3">
                        <StatusBadge org={org} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {isSuspended ? (
                            <button
                              type="button"
                              disabled={busy || !org.id}
                              onClick={() => org.id && handleRowAction(org.id, "activate")}
                              title="Activar"
                              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busy || !org.id}
                              onClick={() => org.id && handleRowAction(org.id, "suspend")}
                              title="Suspender"
                              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-700 disabled:opacity-40"
                            >
                              <Pause className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busy || !org.id}
                            onClick={() => org.id && handleRowAction(org.id, "restore")}
                            title="Restaurar"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-700 disabled:opacity-40"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={busy || !org.id}
                            onClick={() => org.id && handleRowAction(org.id, "delete")}
                            title="Eliminar"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {result ? (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm text-slate-500">
            <span>
              Página {result.pageIndex} de {Math.max(result.totalPages, 1)} · {result.totalCount} organizaciones
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!result.hasPreviousPage}
                onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-black/5 hover:text-emerald-700 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={!result.hasNextPage}
                onClick={() => setPageIndex((p) => p + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-black/5 hover:text-emerald-700 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
