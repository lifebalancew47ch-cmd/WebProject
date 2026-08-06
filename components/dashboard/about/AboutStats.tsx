"use client"

import { StatGrid } from "@/components/dashboard/StatGrid"
import { usePlans } from "@/lib/landing/usePlans"
import { useMySubscription } from "@/lib/landing/useMySubscription"

/**
 * "Licencia" en Acerca de refleja el plan real que el usuario contrató,
 * cruzando la suscripción activa de su organización (useMySubscription) con
 * el catálogo de planes (usePlans) — misma fuente de verdad que usa
 * BillingContent para "Tu plan actual".
 */
export function AboutStats() {
  const { plans } = usePlans()
  const { subscription, loading } = useMySubscription()

  const currentPlan = plans?.find((p) => p.id === subscription?.planId) ?? null

  const licenseLabel = loading ? "Consultando…" : currentPlan ? currentPlan.name : "Sin plan activo"

  return (
    <StatGrid
      stats={[
        { label: "Versión", value: "2.4.0" },
        { label: "Última actualización", value: "Jul 2026" },
        { label: "Licencia", value: licenseLabel },
      ]}
    />
  )
}
