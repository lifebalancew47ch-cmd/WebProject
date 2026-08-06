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

/**
 * Cache + pub/sub compartido por organizationId — la misma razón que
 * usePlans: About, Billing, Integrations, OrganizationsPanel y
 * PricingSection pueden pedir la suscripción de la misma organización en la
 * misma sesión. `notify` actualiza el cache y empuja el valor fresco a
 * *todos* los componentes montados que usan el hook (no solo al que disparó
 * el reload), para que una acción en un panel (cambiar/cancelar plan) se
 * refleje de inmediato en cualquier otro que muestre el mismo dato.
 */
const cache = new Map<string, SubscriptionDto | null>()
const inflight = new Map<string, Promise<SubscriptionDto | null>>()
const listeners = new Map<string, Set<(sub: SubscriptionDto | null) => void>>()

function notify(organizationId: string, sub: SubscriptionDto | null) {
  cache.set(organizationId, sub)
  listeners.get(organizationId)?.forEach((fn) => fn(sub))
}

function fetchSubscriptionOnce(organizationId: string, accessToken: string): Promise<SubscriptionDto | null> {
  const existing = inflight.get(organizationId)
  if (existing) return existing

  const promise = listSubscriptions({ organizationId, pageIndex: 1, pageSize: 50 }, accessToken)
    .then((result) => {
      const active = pickActiveSubscription(result.items)
      notify(organizationId, active)
      return active
    })
    .finally(() => {
      inflight.delete(organizationId)
    })

  inflight.set(organizationId, promise)
  return promise
}

export function useMySubscription() {
  const { accessToken, organizationId } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionDto | null>(
    organizationId ? (cache.get(organizationId) ?? null) : null
  )
  const [loading, setLoading] = useState(!(organizationId && cache.has(organizationId)))
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!accessToken || !organizationId) {
      setLoading(false)
      return
    }

    if (!listeners.has(organizationId)) listeners.set(organizationId, new Set())
    const set = listeners.get(organizationId)!
    set.add(setSubscription)

    if (cache.has(organizationId)) {
      setSubscription(cache.get(organizationId) ?? null)
      setLoading(false)
    } else {
      setLoading(true)
      setError(false)
      fetchSubscriptionOnce(organizationId, accessToken)
        .then(setSubscription)
        .catch(() => setError(true))
        .finally(() => setLoading(false))
    }

    return () => {
      set.delete(setSubscription)
    }
  }, [accessToken, organizationId])

  const reload = useCallback(async () => {
    if (!accessToken || !organizationId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    cache.delete(organizationId) // fuerza ignorar el cache y volver a pedir
    try {
      await fetchSubscriptionOnce(organizationId, accessToken)
      // fetchSubscriptionOnce -> notify() ya empujó el valor fresco a este
      // componente (y a cualquier otro montado) vía el listener registrado.
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [accessToken, organizationId])

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
      await reload()
    },
    [accessToken, organizationId, subscription, reload]
  )

  const cancelPlan = useCallback(async () => {
    if (!accessToken || !subscription) {
      throw new Error("No hay un plan activo para cancelar.")
    }
    await cancelSubscription(subscription.id, accessToken)
    await reload()
  }, [accessToken, subscription, reload])

  return { subscription, loading, error, selectPlan, cancelPlan }
}
