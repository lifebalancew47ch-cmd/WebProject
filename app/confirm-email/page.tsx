"use client"

import { Suspense, useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AuthShell } from "@/components/auth/AuthShell"
import { FormField } from "@/components/ui/FormField"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { confirmEmail, sendConfirmation } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"

function ConfirmEmailInner() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") ?? ""
  const tokenParam = searchParams.get("token") ?? ""

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    emailParam && tokenParam ? "loading" : "idle"
  )
  const [message, setMessage] = useState<string | null>(null)

  const [resendEmail, setResendEmail] = useState(emailParam)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  useEffect(() => {
    if (!emailParam || !tokenParam) return
    let cancelled = false
    confirmEmail({ email: emailParam, token: tokenParam })
      .then(() => {
        if (!cancelled) setStatus("success")
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus("error")
          setMessage(err instanceof ApiError ? err.message : "No se pudo confirmar el correo.")
        }
      })
    return () => {
      cancelled = true
    }
  }, [emailParam, tokenParam])

  async function handleResend(e: FormEvent) {
    e.preventDefault()
    setResendLoading(true)
    try {
      await sendConfirmation({ email: resendEmail })
      setResendSent(true)
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "No se pudo reenviar la confirmación.")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <AuthShell
      title="Confirmación de correo"
      subtitle="Verifica tu dirección de correo para activar todas las funciones."
      footer={
        <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
          Volver a iniciar sesión
        </Link>
      }
    >
      <div className="space-y-6">
        {status === "loading" ? <AlertMessage type="success">Confirmando tu correo…</AlertMessage> : null}
        {status === "success" ? (
          <AlertMessage type="success">¡Tu correo fue confirmado correctamente!</AlertMessage>
        ) : null}
        {status === "error" ? <AlertMessage type="error">{message}</AlertMessage> : null}

        <div className="border-t border-emerald-100 pt-6">
          <p className="text-sm text-emerald-900/70 mb-3">
            ¿No recibiste el correo o el enlace expiró? Reenvía la confirmación:
          </p>
          {resendSent ? (
            <AlertMessage type="success">Enlace de confirmación reenviado. Revisa tu correo.</AlertMessage>
          ) : (
            <form onSubmit={handleResend} className="space-y-3">
              <FormField
                label="Correo electrónico"
                type="email"
                name="resendEmail"
                required
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
              <SubmitButton loading={resendLoading}>Reenviar confirmación</SubmitButton>
            </form>
          )}
        </div>
      </div>
    </AuthShell>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmEmailInner />
    </Suspense>
  )
}
