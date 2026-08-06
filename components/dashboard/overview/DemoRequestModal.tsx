"use client"

import { useState, type FormEvent } from "react"
import { CheckCircle2 } from "lucide-react"
import { FormField } from "@/components/ui/FormField"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { Modal } from "@/components/ui/Modal"
import { useAuth } from "@/lib/auth/AuthContext"
import { MAX_LENGTHS, validateBoundedText, validateEmail, validateName, validateRequired } from "@/lib/validation/rules"

type DemoRequestModalProps = {
  open: boolean
  onClose: () => void
}

type Form = { name: string; email: string; company: string; message: string }

export function DemoRequestModal({ open, onClose }: DemoRequestModalProps) {
  const { user } = useAuth()
  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : ""

  const [form, setForm] = useState<Form>({
    name: displayName,
    email: user?.email ?? "",
    company: "",
    message: "",
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const [submitted, setSubmitted] = useState(false)

  function update<K extends keyof Form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handleClose() {
    setSubmitted(false)
    setFieldErrors({})
    onClose()
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const nextErrors: Partial<Record<keyof Form, string>> = {}
    const nameMsg = validateRequired(form.name, "El nombre") ?? validateName(form.name, "El nombre", MAX_LENGTHS.firstName + MAX_LENGTHS.lastName)
    const emailMsg = validateRequired(form.email, "El correo") ?? validateEmail(form.email)
    const companyMsg = validateBoundedText(form.company, "La empresa", MAX_LENGTHS.organizationName)
    const messageMsg = validateBoundedText(form.message, "El mensaje", MAX_LENGTHS.notificationBody)
    if (nameMsg) nextErrors.name = nameMsg
    if (emailMsg) nextErrors.email = emailMsg
    if (companyMsg) nextErrors.company = companyMsg
    if (messageMsg) nextErrors.message = messageMsg

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // No hay todavía un endpoint/CRM real al que enviar esto (ver
    // docs/SECURITY.md sobre no fingir integraciones) — se registra la
    // intención localmente y se le pide al usuario el mismo dato por otro
    // canal mientras tanto.
    setSubmitted(true)
  }

  return (
    <Modal open={open} onClose={handleClose} titleId="demo-request-title" maxWidth="max-w-md">
      {submitted ? (
        <div className="py-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 id="demo-request-title" className="mt-4 text-lg font-bold text-[#1E3E2B]">
            Solicitud enviada
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Recibimos tu solicitud de demo técnica. Nuestro equipo se pondrá en contacto contigo a{" "}
            <strong>{form.email}</strong> para coordinar un horario.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-6 w-full rounded-full bg-[#2D5A43] py-3 text-sm font-bold text-white transition-colors hover:bg-[#1E3E2B]"
          >
            Entendido
          </button>
        </div>
      ) : (
        <>
          <h3 id="demo-request-title" className="text-lg font-bold text-[#1E3E2B]">
            Solicitar demo técnica
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Cuéntanos un poco sobre tu equipo y te contactamos para agendar una sesión.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            <FormField
              label="Nombre"
              name="name"
              required
              maxLength={MAX_LENGTHS.firstName + MAX_LENGTHS.lastName}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              error={fieldErrors.name}
            />
            <FormField
              label="Correo electrónico"
              type="email"
              name="email"
              required
              maxLength={MAX_LENGTHS.email}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              error={fieldErrors.email}
            />
            <FormField
              label="Empresa (opcional)"
              name="company"
              maxLength={MAX_LENGTHS.organizationName}
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              error={fieldErrors.company}
            />
            <FormField
              label="Mensaje (opcional)"
              name="message"
              maxLength={MAX_LENGTHS.notificationBody}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              error={fieldErrors.message}
            />

            <SubmitButton>Enviar solicitud</SubmitButton>
          </form>
        </>
      )}
    </Modal>
  )
}
