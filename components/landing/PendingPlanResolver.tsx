"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth/AuthContext"
import { useToast } from "@/components/ui/ToastProvider"
import { getPendingPlanId, clearPendingPlanId } from "@/lib/landing/pendingPlan"
import { changeSubscriptionPlan, createSubscription, listPlans, listSubscriptions } from "@/lib/api/organizations"

/**
 * Montado una vez en el layout raíz. En cuanto detecta que hay sesión
 * iniciada y un plan pendiente guardado (ver lib/landing/pendingPlan.ts),
 * lo asocia de verdad a la organización del usuario — cubre tanto "elegí un
 * plan sin cuenta → me registré → inicié sesión" como "elegí un plan sin
 * cuenta → ya tenía cuenta → inicié sesión".
 */
export function PendingPlanResolver() {
  const { status, accessToken, organizationId } = useAuth()
  const { showToast } = useToast()
  const resolvedRef = useRef(false)

  useEffect(() => {
    if (status !== "authenticated" || !accessToken || !organizationId) return
    if (resolvedRef.current) return
    const pendingPlanId = getPendingPlanId()
    if (!pendingPlanId) return

    resolvedRef.current = true

    ;(async () => {
      try {
        // pageSize alto + filtro por "Active": una org puede acumular suscripciones
        // canceladas y el orden de items no garantiza que la vigente quede primero
        // (ver nota en lib/landing/useMySubscription.ts).
        const existing = await listSubscriptions({ organizationId, pageIndex: 1, pageSize: 50 }, accessToken)
        const current = existing.items.find((s) => s.status === "Active")
        if (current) {
          await changeSubscriptionPlan(current.id, { newPlanId: pendingPlanId }, accessToken)
        } else {
          await createSubscription({ organizationId, planId: pendingPlanId, billingCycle: "monthly" }, accessToken)
        }

        const plans = await listPlans()
        const plan = plans.find((p) => p.id === pendingPlanId)
        showToast(`Listo, el plan ${plan?.name ?? "elegido"} ya quedó activo en tu cuenta.`)
      } catch {
        showToast(
          "No pudimos activar el plan que habías elegido. Selecciónalo de nuevo desde Planes y Facturación.",
          "error"
        )
      } finally {
        clearPendingPlanId()
      }
    })()
  }, [status, accessToken, organizationId, showToast])

  return null
}
