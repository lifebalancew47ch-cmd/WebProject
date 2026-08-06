"use client"

import { useEffect, useState } from "react"
import { listPlans } from "@/lib/api/organizations"
import type { PlanDto } from "@/lib/api/organizations-types"

/**
 * Trae los planes reales desde Organization & SaaS (`GET /api/v1/plans`,
 * público). No hay fallback a datos hardcodeados: si la API falla, se
 * muestra un estado de error explícito en vez de precios/beneficios
 * inventados que podrían no coincidir con lo que se le cobra al usuario.
 */
export function usePlans() {
  const [plans, setPlans] = useState<PlanDto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    listPlans()
      .then((data) => {
        if (cancelled) return
        setPlans(data.filter((plan) => plan.isActive))
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { plans, loading, error }
}
