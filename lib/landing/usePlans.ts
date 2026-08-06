"use client"

import { useEffect, useState } from "react"
import { listPlans } from "@/lib/api/organizations"
import type { PlanDto } from "@/lib/api/organizations-types"

/**
 * Trae los planes reales desde Organization & SaaS (`GET /api/v1/plans`,
 * público). No hay fallback a datos hardcodeados: si la API falla, se
 * muestra un estado de error explícito en vez de precios/beneficios
 * inventados que podrían no coincidir con lo que se le cobra al usuario.
 *
 * Cache compartido a nivel de módulo: varios componentes independientes
 * llaman este hook en la misma sesión (About, Billing, Integrations,
 * OrganizationsPanel, PricingSection) — sin esto, cada uno dispara su
 * propia petición idéntica a /api/v1/plans. No es SWR/React Query, pero
 * elimina el N+1 de red sin agregar una dependencia nueva al proyecto.
 */
let cachedPlans: PlanDto[] | null = null
let inflightRequest: Promise<PlanDto[]> | null = null

function fetchPlansOnce(): Promise<PlanDto[]> {
  if (cachedPlans) return Promise.resolve(cachedPlans)
  if (!inflightRequest) {
    inflightRequest = listPlans()
      .then((data) => {
        cachedPlans = data.filter((plan) => plan.isActive)
        return cachedPlans
      })
      .finally(() => {
        inflightRequest = null
      })
  }
  return inflightRequest
}

export function usePlans() {
  const [plans, setPlans] = useState<PlanDto[] | null>(cachedPlans)
  const [loading, setLoading] = useState(!cachedPlans)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (cachedPlans) {
      setPlans(cachedPlans)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)

    fetchPlansOnce()
      .then((data) => {
        if (!cancelled) setPlans(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { plans, loading, error }
}
