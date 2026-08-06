"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { AuthShell } from "@/components/auth/AuthShell"
import { FormField } from "@/components/ui/FormField"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { forgotPassword } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { MAX_LENGTHS, sanitizeText, validateEmail, validateRequired } from "@/lib/validation/rules"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const message = validateRequired(email, "El correo") ?? validateEmail(email)
    if (message) {
      setEmailError(message)
      return
    }
    setEmailError(undefined)

    setLoading(true)
    try {
      await forgotPassword({ email: sanitizeText(email) })
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo procesar la solicitud.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Recupera tu contraseña"
      subtitle="Ingresa tu correo y te enviaremos instrucciones para restablecerla."
      footer={
        <>
          ¿Ya la recordaste?{" "}
          <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Volver a iniciar sesión
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <AlertMessage type="success">
            Si existe una cuenta con ese correo, recibirás un email con instrucciones para
            restablecer tu contraseña.
          </AlertMessage>
          <Link
            href={`/reset-password?email=${encodeURIComponent(sanitizeText(email))}`}
            className="block text-center text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Ya tengo un código, continuar →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error ? <AlertMessage type="error">{error}</AlertMessage> : null}

          <FormField
            label="Correo electrónico"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            required
            maxLength={MAX_LENGTHS.email}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) setEmailError(undefined)
            }}
            error={emailError}
          />

          <SubmitButton loading={loading}>Enviar instrucciones</SubmitButton>
        </form>
      )}
    </AuthShell>
  )
}
