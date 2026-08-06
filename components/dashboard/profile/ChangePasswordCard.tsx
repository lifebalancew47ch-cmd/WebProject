"use client"

import { useState, type FormEvent } from "react"
import { Lock } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { PasswordField } from "@/components/ui/PasswordField"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { useAuth } from "@/lib/auth/AuthContext"
import { changePassword } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { MAX_LENGTHS, MIN_PASSWORD_LENGTH } from "@/lib/validation/rules"
import { changePasswordSchema, flattenFieldErrors } from "@/lib/validation/schemas"

export function ChangePasswordCard() {
  const { accessToken } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmNewPassword?: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Re-entrancy guard: bloquea también un submit disparado por script
    // directo al <form>, que no respeta el atributo disabled del botón.
    if (loading) return
    setError(null)
    setSuccess(false)

    const result = changePasswordSchema.safeParse({ currentPassword, newPassword, confirmNewPassword })
    if (!result.success) {
      const errors = flattenFieldErrors(result.error)
      setFieldErrors(errors)
      setError(Object.values(errors)[0] ?? "Revisa los campos antes de continuar.")
      return
    }
    setFieldErrors({})
    if (!accessToken) return

    setLoading(true)
    try {
      await changePassword(result.data, accessToken)
      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar la contraseña.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4" style={{ color: "#2D5A43" }} />
        <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
          Cambiar contraseña
        </h3>
      </div>
      <p className="mt-1 text-xs text-gray-500">Usa una contraseña de al menos {MIN_PASSWORD_LENGTH} caracteres.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        {success ? <AlertMessage type="success">Contraseña actualizada correctamente.</AlertMessage> : null}
        {error ? <AlertMessage type="error">{error}</AlertMessage> : null}

        <PasswordField
          label="Contraseña actual"
          name="currentPassword"
          autoComplete="current-password"
          required
          maxLength={MAX_LENGTHS.password}
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value)
            if (fieldErrors.currentPassword) setFieldErrors((prev) => ({ ...prev, currentPassword: undefined }))
          }}
          error={fieldErrors.currentPassword}
        />
        <PasswordField
          label="Nueva contraseña"
          name="newPassword"
          autoComplete="new-password"
          placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
          required
          maxLength={MAX_LENGTHS.password}
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value)
            if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: undefined }))
          }}
          error={fieldErrors.newPassword}
        />
        <PasswordField
          label="Confirmar nueva contraseña"
          name="confirmNewPassword"
          autoComplete="new-password"
          required
          maxLength={MAX_LENGTHS.password}
          value={confirmNewPassword}
          onChange={(e) => {
            setConfirmNewPassword(e.target.value)
            if (fieldErrors.confirmNewPassword) setFieldErrors((prev) => ({ ...prev, confirmNewPassword: undefined }))
          }}
          error={fieldErrors.confirmNewPassword}
        />

        <SubmitButton loading={loading} className="w-auto px-6">
          Actualizar contraseña
        </SubmitButton>
      </form>
    </Card>
  )
}
