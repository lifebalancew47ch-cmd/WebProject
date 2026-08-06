"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import { useToast } from "@/components/ui/ToastProvider"
import { usePlans } from "@/lib/landing/usePlans"
import { useMySubscription } from "@/lib/landing/useMySubscription"
import { formatPlanPrice, getPlanCheckoutUrl, sortPlansForDisplay } from "@/lib/landing/plans"
import { setPendingPlanId } from "@/lib/landing/pendingPlan"
import type { PlanDto } from "@/lib/api/organizations-types"
import { PlanConfirmModal } from "./PlanConfirmModal"

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" strokeWidth={2.5} />
      <span className="text-slate-600">{children}</span>
    </li>
  )
}

export function PricingSection() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const { plans, loading, error } = usePlans()
  const { subscription, selectPlan } = useMySubscription()
  const [activePlan, setActivePlan] = useState<PlanDto | null>(null)

  /**
   * Sin sesión: no hay a quién asociar la selección todavía, así que se
   * guarda el planId (ver lib/landing/pendingPlan.ts — el query param
   * `?plan=` no sobrevive el flujo de registro → login, se pierde) y se
   * manda a registrarse; en cuanto haya sesión, PendingPlanResolver lo
   * asocia solo. Con sesión y un Payment Link de Stripe configurado para el
   * plan: redirige directo ahí, mandando el userId como `client_reference_id`
   * para poder asociar el pago a la cuenta desde el webhook de Stripe. Sin
   * Payment Link configurado (caso actual): abre el modal de confirmación,
   * que asocia el plan de verdad a la organización propia del usuario vía
   * Organization & SaaS (ver lib/landing/useMySubscription.ts).
   */
  function handleSelectPlan(plan: PlanDto) {
    if (!user) {
      setPendingPlanId(plan.id)
      router.push(`/register?plan=${plan.id}`)
      return
    }

    const checkoutUrl = getPlanCheckoutUrl(plan)
    if (checkoutUrl) {
      const url = new URL(checkoutUrl)
      if (user.id) url.searchParams.set("client_reference_id", user.id)
      window.location.href = url.toString()
      return
    }

    setActivePlan(plan)
  }

  async function handleConfirmPlan(planId: string) {
    await selectPlan(planId)
    showToast("Plan actualizado correctamente.")
  }

  const currentPlanId = subscription?.planId || null

  return (
    <section id="planes" className="py-20 bg-white border-t border-emerald-100/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3527] tracking-tight">Planes para cada equipo</h2>
          <p className="text-emerald-700 font-medium tracking-wide text-sm uppercase">
            Elige el nivel de bio-gestión que tu organización necesita.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12 text-emerald-700">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-emerald-200 bg-[#F4F9F5] p-6 text-center text-sm text-emerald-900/70">
            No pudimos cargar los planes en este momento. Intenta recargar la página en unos minutos.
          </div>
        )}

        {!loading && !error && plans && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {sortPlansForDisplay(plans).map((plan) => {
              const isCurrent = plan.id === currentPlanId
              return (
              <div
                key={plan.id}
                className={
                  plan.isHighlighted
                    ? "relative flex flex-col rounded-3xl bg-white p-8"
                    : "flex flex-col rounded-3xl border border-emerald-100 bg-[#F4F9F5] p-8"
                }
                style={
                  plan.isHighlighted ? { border: "2px solid #2D5A43", transform: "translateY(-8px)" } : undefined
                }
              >
                {plan.isHighlighted && (
                  <span
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: "#1E3E2B" }}
                  >
                    Más Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-[#1E3527]">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-[#1E3527]">{formatPlanPrice(plan)}</span>
                  {!plan.isCustomPricing && <span className="text-slate-500"> /mes</span>}
                </p>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <FeatureItem key={feature}>{feature}</FeatureItem>
                  ))}
                </ul>
                {plan.isCustomPricing ? (
                  <Link
                    href="#cta-demo"
                    className="mt-8 w-full text-center rounded-full border border-emerald-300 py-3 text-sm font-bold text-emerald-900 transition-colors hover:bg-emerald-50"
                  >
                    Contactar Ventas
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent}
                    className={
                      isCurrent
                        ? "mt-8 w-full text-center rounded-full border border-emerald-200 py-3 text-sm font-bold text-emerald-400"
                        : plan.isHighlighted
                          ? "mt-8 w-full text-center rounded-full bg-[#3A6D53] py-3 text-sm font-bold text-white transition-colors hover:bg-[#2D5A43]"
                          : "mt-8 w-full text-center rounded-full border border-emerald-300 py-3 text-sm font-bold text-emerald-900 transition-colors hover:bg-emerald-50"
                    }
                  >
                    {isCurrent ? "Plan actual" : "Seleccionar Plan"}
                  </button>
                )}
              </div>
              )
            })}
          </div>
        )}
      </div>

      <PlanConfirmModal
        plan={activePlan}
        userEmail={user?.email}
        onClose={() => setActivePlan(null)}
        onConfirm={handleConfirmPlan}
      />
    </section>
  )
}
