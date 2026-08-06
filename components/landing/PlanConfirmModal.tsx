"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, X } from "lucide-react"
import type { PlanDto } from "@/lib/api/organizations-types"
import { formatPlanPrice } from "@/lib/landing/plans"

type PlanConfirmModalProps = {
  plan: PlanDto | null
  userEmail?: string | null
  onClose: () => void
  onConfirm: (planId: string) => Promise<void>
}

export function PlanConfirmModal({ plan, userEmail, onClose, onConfirm }: PlanConfirmModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!plan) return null

  async function handleConfirm() {
    if (!plan) return
    setSubmitting(true)
    setErrorMessage(null)
    try {
      await onConfirm(plan.id)
      setSubmitted(true)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "No se pudo asociar el plan. Intenta de nuevo.")
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
            <h3 className="mt-4 text-lg font-bold text-[#1E3527]">Plan asociado a tu cuenta</h3>
            <p className="mt-2 text-sm text-slate-500">
              El plan <strong>{plan.name}</strong> ya está activo en tu cuenta
              {userEmail ? ` (${userEmail})` : ""}.
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
            <h3 className="text-lg font-bold text-[#1E3527]">Confirmar plan {plan.name}</h3>
            <p className="mt-1 text-sm text-slate-500">
              <span className="text-2xl font-extrabold text-[#1E3527]">{formatPlanPrice(plan)}</span>
              {!plan.isCustomPricing && " /mes"}
            </p>

            <div className="mt-4 rounded-2xl bg-[#F4F9F5] p-4 text-sm text-emerald-900/80">
              Esta selección quedará asociada a tu cuenta{userEmail ? ` (${userEmail})` : ""}.
            </div>

            {errorMessage && (
              <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#2D5A43] py-3 text-sm font-bold text-white transition-colors hover:bg-[#1E3E2B] disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar selección
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
