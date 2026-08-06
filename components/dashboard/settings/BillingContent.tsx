"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Check, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import { useToast } from "@/components/ui/ToastProvider"
import { usePlans } from "@/lib/landing/usePlans"
import { useMySubscription } from "@/lib/landing/useMySubscription"
import { formatPlanPrice, getPlanCheckoutUrl, sortPlansForDisplay } from "@/lib/landing/plans"
import type { PlanDto } from "@/lib/api/organizations-types"

// Solo se necesitan tras una interacción (clic en "Seleccionar Plan" /
// "Cancelar plan") — cargarlos de forma diferida evita que su JS entre en
// el bundle inicial de la página de Settings.
const PlanConfirmModal = dynamic(() =>
  import("@/components/landing/PlanConfirmModal").then((mod) => mod.PlanConfirmModal)
)
const CancelPlanModal = dynamic(() =>
  import("@/components/dashboard/settings/CancelPlanModal").then((mod) => mod.CancelPlanModal)
)

function FeatureItem({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${light ? "text-white" : "text-emerald-600"}`} strokeWidth={2.5} />
      <span className={light ? "text-white/80" : "text-slate-600"}>{children}</span>
    </li>
  )
}

/**
 * Misma lógica de selección de plan que la landing (ver
 * components/landing/PricingSection.tsx): dentro del dashboard el usuario
 * siempre está autenticado, así que solo hay dos caminos — redirigir a un
 * Payment Link de Stripe si está configurado, o abrir el modal de
 * confirmación, que asocia el plan de verdad a la organización propia del
 * usuario vía Organization & SaaS (ver lib/landing/useMySubscription.ts).
 */
export function BillingContent() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { plans, loading, error } = usePlans()
  const { subscription, loading: loadingSubscription, selectPlan, cancelPlan } = useMySubscription()
  const [activePlan, setActivePlan] = useState<PlanDto | null>(null)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  const currentPlan = plans?.find((p) => p.id === subscription?.planId) ?? null

  function handleSelectPlan(plan: PlanDto) {
    const checkoutUrl = getPlanCheckoutUrl(plan)
    if (checkoutUrl) {
      const url = new URL(checkoutUrl)
      if (user?.id) url.searchParams.set("client_reference_id", user.id)
      window.location.href = url.toString()
      return
    }
    setActivePlan(plan)
  }

  async function handleConfirmPlan(planId: string) {
    await selectPlan(planId)
    showToast("Plan actualizado correctamente.")
  }

  async function handleConfirmCancel() {
    await cancelPlan()
    showToast("Tu plan fue cancelado.")
  }

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
          Tu plan actual
        </h3>
        <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          {loadingSubscription ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Consultando tu suscripción...
            </span>
          ) : currentPlan ? (
            <>
              <span>
                Tienes activo el plan <strong className="text-[#1E3E2B]">{currentPlan.name}</strong> (
                {formatPlanPrice(currentPlan)}
                {!currentPlan.isCustomPricing && " /mes"}
                {subscription?.status ? ` · ${subscription.status}` : ""}).
              </span>
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="shrink-0 rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
              >
                Cancelar plan
              </button>
            </>
          ) : (
            "No tienes ningún plan de pago activo todavía. Elige uno de los planes disponibles para empezar."
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
          Planes disponibles
        </h3>

        {loading && (
          <div className="mt-3 flex justify-center rounded-2xl border border-gray-100 bg-white py-10 text-[#2D5A43]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="mt-3 rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-500">
            No pudimos cargar los planes disponibles. Intenta recargar la página en unos minutos.
          </div>
        )}

        {!loading && !error && plans && (
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {sortPlansForDisplay(plans).map((plan) => {
              const isCurrent = plan.id === currentPlan?.id
              return (
                <div
                  key={plan.id}
                  className={
                    plan.isHighlighted
                      ? "flex flex-col rounded-2xl p-6 text-white"
                      : "flex flex-col rounded-2xl border border-gray-100 bg-white p-6"
                  }
                  style={plan.isHighlighted ? { backgroundColor: "#2D5A43" } : undefined}
                >
                  {plan.isHighlighted && (
                    <span className="inline-block w-max rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Más popular
                    </span>
                  )}
                  <h4 className={`mt-3 text-base font-bold ${plan.isHighlighted ? "" : "text-[#1E3E2B]"}`}>
                    {plan.name}
                  </h4>
                  <p className="mt-3">
                    <span className={`text-3xl font-extrabold ${plan.isHighlighted ? "" : "text-[#1E3E2B]"}`}>
                      {formatPlanPrice(plan)}
                    </span>
                    {!plan.isCustomPricing && (
                      <span className={plan.isHighlighted ? "text-white/60" : "text-gray-400"}> /mes</span>
                    )}
                  </p>
                  <ul className="mt-4 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <FeatureItem key={feature} light={plan.isHighlighted}>
                        {feature}
                      </FeatureItem>
                    ))}
                  </ul>
                  {plan.isCustomPricing ? (
                    <a
                      href="mailto:ventas@lifebalance.com"
                      className="mt-6 w-full rounded-full border border-gray-200 py-2.5 text-center text-sm font-bold text-[#2D5A43] transition-colors hover:bg-gray-50"
                    >
                      Contactar Ventas
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isCurrent}
                      className={
                        isCurrent
                          ? "mt-6 w-full rounded-full border border-gray-200 py-2.5 text-sm font-bold text-gray-400"
                          : plan.isHighlighted
                            ? "mt-6 w-full rounded-full bg-white py-2.5 text-sm font-bold text-[#2D5A43] transition-colors hover:bg-white/90"
                            : "mt-6 w-full rounded-full border border-gray-200 py-2.5 text-sm font-bold text-[#2D5A43] transition-colors hover:bg-gray-50"
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

      <CancelPlanModal
        open={cancelModalOpen}
        plan={currentPlan}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  )
}
