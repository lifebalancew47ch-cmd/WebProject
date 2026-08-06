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
import { MAX_LENGTHS } from "@/lib/validation/rules"

const MIN_PASSWORD_LENGTH = 12

export function ChangePasswordCard() {
  const { accessToken } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword.length < MIN_PASSWORD_LENGTH || newPassword.length > MAX_LENGTHS.password) {
      setError(`La nueva contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_LENGTHS.password} caracteres.`)
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (!accessToken) return

    setLoading(true)
    try {
      await changePassword({ currentPassword, newPassword, confirmNewPassword }, accessToken)
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
      <p className="mt-1 text-xs text-gray-500">Usa una contraseña de al menos 12 caracteres.</p>

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
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <PasswordField
          label="Nueva contraseña"
          name="newPassword"
          autoComplete="new-password"
          placeholder="Mínimo 12 caracteres"
          required
          maxLength={MAX_LENGTHS.password}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <PasswordField
          label="Confirmar nueva contraseña"
          name="confirmNewPassword"
          autoComplete="new-password"
          required
          maxLength={MAX_LENGTHS.password}
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />

        <SubmitButton loading={loading} className="w-auto px-6">
          Actualizar contraseña
        </SubmitButton>
      </form>
    </Card>
  )
}
