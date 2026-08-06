import type { PlanDto } from "@/lib/api/organizations-types"

/**
 * Orden de visualización fijo (Individual → Corporativo → Enterprise),
 * independiente del orden en que el backend devuelva el arreglo.
 */
const TIER_DISPLAY_ORDER = ["individual", "corporativo", "enterprise"]

export function sortPlansForDisplay(plans: PlanDto[]): PlanDto[] {
  return [...plans].sort((a, b) => {
    const ai = TIER_DISPLAY_ORDER.indexOf(a.tier.toLowerCase())
    const bi = TIER_DISPLAY_ORDER.indexOf(b.tier.toLowerCase())
    return (ai === -1 ? TIER_DISPLAY_ORDER.length : ai) - (bi === -1 ? TIER_DISPLAY_ORDER.length : bi)
  })
}

export function formatPlanPrice(plan: PlanDto): string {
  return plan.isCustomPricing ? "Consultar" : `$${plan.priceMonthly}`
}

/**
 * Si el equipo configura un Stripe Payment Link para un plan (variable de
 * entorno, clave = tier del plan en minúsculas), el clic en "Seleccionar
 * Plan" redirige directo ahí — sin backend propio, Stripe es quien procesa
 * el pago. Sin URL configurada, se usa el modal de confirmación como
 * fallback (ver PlanConfirmModal).
 */
const STRIPE_CHECKOUT_URLS: Record<string, string | undefined> = {
  individual: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL_INDIVIDUAL,
  corporativo: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL_CORPORATIVO,
}

export function getPlanCheckoutUrl(plan: PlanDto): string | undefined {
  return STRIPE_CHECKOUT_URLS[plan.tier.toLowerCase()]
}
