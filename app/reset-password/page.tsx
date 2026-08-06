"use client"

import { Suspense, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthShell } from "@/components/auth/AuthShell"
import { FormField } from "@/components/ui/FormField"
import { PasswordField } from "@/components/ui/PasswordField"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { resetPassword } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { MAX_LENGTHS, sanitizeText, validateEmail, validateRequired } from "@/lib/validation/rules"

const MIN_PASSWORD_LENGTH = 12

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState(searchParams.get("email") ?? "")
  const [token] = useState(searchParams.get("token") ?? "")
  const [manualToken, setManualToken] = useState("")
  const hasTokenFromLink = token.length > 0
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [emailError, setEmailError] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const emailMessage = validateRequired(email, "El correo") ?? validateEmail(email)
    if (emailMessage) {
      setEmailError(emailMessage)
      return
    }
    setEmailError(undefined)

    if (newPassword.length < MIN_PASSWORD_LENGTH || newPassword.length > MAX_LENGTHS.password) {
      setError(`La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_LENGTHS.password} caracteres.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)
    try {
      await resetPassword({
        email: sanitizeText(email),
        token: sanitizeText(hasTokenFromLink ? token : manualToken),
        newPassword,
        confirmPassword,
      })
      router.push("/login?reset=1")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo restablecer la contraseña.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Restablecer contraseña"
      subtitle="Ingresa el código que recibiste por correo y tu nueva contraseña."
      footer={
        <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
          Volver a iniciar sesión
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error ? <AlertMessage type="error">{error}</AlertMessage> : null}

        <FormField
          label="Correo electrónico"
          type="email"
          name="email"
          autoComplete="email"
          required
          maxLength={MAX_LENGTHS.email}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (emailError) setEmailError(undefined)
          }}
          error={emailError}
        />

        {!hasTokenFromLink ? (
          <FormField
            label="Código"
            name="token"
            placeholder="Pega aquí el código recibido por correo"
            required
            maxLength={MAX_LENGTHS.resetToken}
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
          />
        ) : null}

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
          name="confirmPassword"
          autoComplete="new-password"
          required
          maxLength={MAX_LENGTHS.password}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <SubmitButton loading={loading}>Restablecer contraseña</SubmitButton>
      </form>
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
