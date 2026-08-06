"use client"

import { Suspense, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthShell } from "@/components/auth/AuthShell"
import { FormField } from "@/components/ui/FormField"
import { PasswordField } from "@/components/ui/PasswordField"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { useAuth } from "@/lib/auth/AuthContext"
import { ApiError } from "@/lib/api/client"
import { GuestOnly } from "@/components/auth/GuestOnly"
import { MAX_LENGTHS, sanitizeText } from "@/lib/validation/rules"
import { flattenFieldErrors, loginSchema } from "@/lib/validation/schemas"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const [email, setEmail] = useState(searchParams.get("email") ?? "")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState<string | undefined>(undefined)
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const infoMessage = searchParams.get("registered")
    ? "Cuenta creada correctamente. Inicia sesión para continuar."
    : searchParams.get("reset")
      ? "Tu contraseña se actualizó correctamente. Inicia sesión."
      : null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Re-entrancy guard: además de que el botón se deshabilita mientras
    // `loading`, esto bloquea también un submit disparado por script directo
    // al <form> (form.requestSubmit() / evento "submit" sintético), que no
    // respeta el atributo disabled del botón.
    if (loading) return
    setError(null)

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const fieldErrors = flattenFieldErrors(result.error)
      setEmailError(fieldErrors.email)
      setPasswordError(fieldErrors.password)
      if (!fieldErrors.email && !fieldErrors.password) {
        setError("Revisa los campos antes de continuar.")
      }
      return
    }
    setEmailError(undefined)
    setPasswordError(undefined)

    setLoading(true)
    try {
      await login({ email: sanitizeText(result.data.email), password: result.data.password })
      router.push("/dashboard/Overview")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para continuar en LifeBalance Watch."
      footer={
        <>
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {infoMessage ? <AlertMessage type="success">{infoMessage}</AlertMessage> : null}
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

        <div>
          <PasswordField
            label="Contraseña"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            required
            maxLength={MAX_LENGTHS.password}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (passwordError) setPasswordError(undefined)
            }}
            error={passwordError}
          />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <SubmitButton loading={loading}>Iniciar sesión</SubmitButton>
      </form>
    </AuthShell>
  )
}

export default function LoginPage() {
  return (
    <GuestOnly>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </GuestOnly>
  )
}
