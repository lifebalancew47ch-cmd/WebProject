"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, X } from "lucide-react"
import type { PlanDto } from "@/lib/api/organizations-types"

type CancelPlanModalProps = {
  open: boolean
  plan: PlanDto | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

/**
 * Confirmación antes de cancelar la suscripción (acción irreversible desde el
 * lado del usuario: ver lib/api/organizations.ts#cancelSubscription — no hay
 * endpoint de "reactivar", cancelar es inmediato).
 */
export function CancelPlanModal({ open, plan, onClose, onConfirm }: CancelPlanModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!open) return null

  async function handleConfirm() {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      await onConfirm()
      setSubmitted(true)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "No se pudo cancelar el plan. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    setSubmitted(false)
    setErrorMessage(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} aria-hidden="true" />

      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#1E3527]">Plan cancelado</h3>
            <p className="mt-2 text-sm text-slate-500">
              Tu plan{plan ? ` ${plan.name}` : ""} ya no está activo. Puedes elegir uno nuevo cuando quieras.
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
            <h3 className="text-lg font-bold text-[#1E3527]">
              ¿Cancelar {plan ? `el plan ${plan.name}` : "tu plan"}?
            </h3>

            <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              La cancelación es inmediata: perderás el acceso a los beneficios de este plan de una vez, no hasta el
              final del ciclo de facturación.
            </div>

            {errorMessage && (
              <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Sí, cancelar plan
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Volver
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
