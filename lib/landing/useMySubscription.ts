"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/AuthContext"
import { cancelSubscription, changeSubscriptionPlan, createSubscription, listSubscriptions } from "@/lib/api/organizations"
import type { SubscriptionDto } from "@/lib/api/organizations-types"

/**
 * Toda cuenta tiene una organización auto-provisionada por el backend desde
 * el registro/login (JWT trae `organization_id`), incluso los usuarios
 * individuales — verificado en vivo el 2026-08-05.
 *
 * Ojo: `GET /api/v1/organizations/{id}` NO refleja el plan activo —
 * `planId`/`subscriptionId` se quedan vacíos ahí aunque la suscripción sí se
 * haya creado (verificado en vivo: `POST /api/v1/subscriptions` responde
 * 201 con los datos correctos, pero el organization no se actualiza). La
 * única fuente confiable es `GET /api/v1/subscriptions?organizationId=...`.
 *
 * Ojo 2: una organización puede acumular varias suscripciones a lo largo del
 * tiempo (p. ej. una `Canceled` de antes + una `Active` nueva creada después
 * de cancelar — verificado en vivo el 2026-08-05, cancelar no borra el
 * registro, solo cambia su status). El orden de `items` NO garantiza que la
 * vigente quede primero, así que se pide una página grande y se busca la que
 * tenga `status === "Active"` en vez de asumir `items[0]`.
 */
function pickActiveSubscription(items: SubscriptionDto[]): SubscriptionDto | null {
  return items.find((s) => s.status === "Active") ?? null
}

export function useMySubscription() {
  const { accessToken, organizationId } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const reload = useCallback(() => {
    if (!accessToken || !organizationId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    listSubscriptions({ organizationId, pageIndex: 1, pageSize: 50 }, accessToken)
      .then((result) => setSubscription(pickActiveSubscription(result.items)))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [accessToken, organizationId])

  useEffect(() => {
    reload()
  }, [reload])

  const selectPlan = useCallback(
    async (planId: string) => {
      if (!accessToken || !organizationId) {
        throw new Error("Debes iniciar sesión para seleccionar un plan.")
      }
      if (subscription) {
        await changeSubscriptionPlan(subscription.id, { newPlanId: planId }, accessToken)
      } else {
        // Sin suscripción activa (nunca tuvo una o la canceló): se crea una nueva.
        // Verificado en vivo: hacer change-plan sobre una ya Canceled NO la reactiva.
        await createSubscription({ organizationId, planId, billingCycle: "monthly" }, accessToken)
      }
      reload()
    },
    [accessToken, organizationId, subscription, reload]
  )

  const cancelPlan = useCallback(async () => {
    if (!accessToken || !subscription) {
      throw new Error("No hay un plan activo para cancelar.")
    }
    await cancelSubscription(subscription.id, accessToken)
    reload()
  }, [accessToken, subscription, reload])

  return { subscription, loading, error, selectPlan, cancelPlan }
}
