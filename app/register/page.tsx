"use client"

import { useState, type FocusEvent, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthShell } from "@/components/auth/AuthShell"
import { FormField } from "@/components/ui/FormField"
import { PasswordField } from "@/components/ui/PasswordField"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { useAuth } from "@/lib/auth/AuthContext"
import { ApiError } from "@/lib/api/client"
import { GuestOnly } from "@/components/auth/GuestOnly"
import {
  MAX_LENGTHS,
  sanitizeText,
  stripInvalidSlugChars,
  validateEmail,
  validateName,
  validatePhone,
  validateRequired,
  validateUsername,
} from "@/lib/validation/rules"

const MIN_PASSWORD_LENGTH = 12

type FormFields = {
  firstName: string
  lastName: string
  email: string
  username: string
  phoneNumber: string
  password: string
  confirmPassword: string
}

function validateField(key: keyof FormFields, value: string): string | null {
  switch (key) {
    case "firstName":
      return validateRequired(value, "El nombre") ?? validateName(value, "El nombre", MAX_LENGTHS.firstName)
    case "lastName":
      return validateRequired(value, "El apellido") ?? validateName(value, "El apellido", MAX_LENGTHS.lastName)
    case "email":
      return validateRequired(value, "El correo") ?? validateEmail(value)
    case "username":
      return validateRequired(value, "El nombre de usuario") ?? validateUsername(value)
    case "phoneNumber":
      return validatePhone(value)
    default:
      return null
  }
}

function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()

  const [form, setForm] = useState<FormFields>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormFields, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function update<K extends keyof FormFields>(key: K, value: string) {
    const nextValue = key === "username" ? stripInvalidSlugChars(value) : value
    setForm((prev) => ({ ...prev, [key]: nextValue }))
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handleBlur(key: keyof FormFields) {
    return (_e: FocusEvent<HTMLInputElement>) => {
      const message = validateField(key, form[key])
      setFieldErrors((prev) => ({ ...prev, [key]: message ?? undefined }))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const nextErrors: Partial<Record<keyof FormFields, string>> = {}
    ;(["firstName", "lastName", "email", "username", "phoneNumber"] as const).forEach((key) => {
      const message = validateField(key, form[key])
      if (message) nextErrors[key] = message
    })
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setError("Revisa los campos marcados antes de continuar.")
      return
    }

    if (form.password.length < MIN_PASSWORD_LENGTH || form.password.length > MAX_LENGTHS.password) {
      setError(`La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_LENGTHS.password} caracteres.`)
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)
    try {
      await register({
        firstName: sanitizeText(form.firstName),
        lastName: sanitizeText(form.lastName),
        email: sanitizeText(form.email),
        username: sanitizeText(form.username),
        phoneNumber: form.phoneNumber ? sanitizeText(form.phoneNumber) : undefined,
        password: form.password,
        confirmPassword: form.confirmPassword,
      })
      router.push(`/login?registered=1&email=${encodeURIComponent(sanitizeText(form.email))}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la cuenta.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Empieza a optimizar tu equilibrio biológico hoy mismo."
      footer={
        <>
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error ? <AlertMessage type="error">{error}</AlertMessage> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Nombre"
            name="firstName"
            autoComplete="given-name"
            required
            maxLength={MAX_LENGTHS.firstName}
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            onBlur={handleBlur("firstName")}
            error={fieldErrors.firstName}
          />
          <FormField
            label="Apellido"
            name="lastName"
            autoComplete="family-name"
            required
            maxLength={MAX_LENGTHS.lastName}
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            onBlur={handleBlur("lastName")}
            error={fieldErrors.lastName}
          />
        </div>

        <FormField
          label="Correo electrónico"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          required
          maxLength={MAX_LENGTHS.email}
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          onBlur={handleBlur("email")}
          error={fieldErrors.email}
        />

        <FormField
          label="Nombre de usuario"
          name="username"
          autoComplete="username"
          required
          maxLength={MAX_LENGTHS.username}
          placeholder="letras, números, - y _"
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          onBlur={handleBlur("username")}
          error={fieldErrors.username}
        />

        <FormField
          label="Teléfono (opcional)"
          type="tel"
          name="phoneNumber"
          autoComplete="tel"
          maxLength={MAX_LENGTHS.phoneNumber}
          value={form.phoneNumber}
          onChange={(e) => update("phoneNumber", e.target.value)}
          onBlur={handleBlur("phoneNumber")}
          error={fieldErrors.phoneNumber}
        />

        <PasswordField
          label="Contraseña"
          name="password"
          autoComplete="new-password"
          placeholder="Mínimo 12 caracteres"
          required
          maxLength={MAX_LENGTHS.password}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />

        <PasswordField
          label="Confirmar contraseña"
          name="confirmPassword"
          autoComplete="new-password"
          required
          maxLength={MAX_LENGTHS.password}
          value={form.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
        />

        <SubmitButton loading={loading}>Crear cuenta</SubmitButton>
      </form>
    </AuthShell>
  )
}

export default function RegisterPage() {
  return (
    <GuestOnly>
      <RegisterForm />
    </GuestOnly>
  )
}
