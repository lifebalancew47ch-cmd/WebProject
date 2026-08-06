"use client"

import { CheckCircle2, CreditCard, Loader2, Plug, XCircle } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { usePlans } from "@/lib/landing/usePlans"
import { useMySubscription } from "@/lib/landing/useMySubscription"
import { sortPlansForDisplay } from "@/lib/landing/plans"

type Capability = {
  key: "apiAccess" | "notificationsEnabled" | "reportsAvailable" | "dashboardsAvailable"
  label: string
  description: string
}

const CAPABILITIES: Capability[] = [
  { key: "apiAccess", label: "Acceso a la API", description: "Integra LifeBalance con tus propios sistemas." },
  { key: "notificationsEnabled", label: "Notificaciones", description: "Alertas automáticas por email y push." },
  { key: "reportsAvailable", label: "Reportes exportables", description: "Genera reportes en PDF/CSV." },
  { key: "dashboardsAvailable", label: "Dashboards ejecutivos", description: "Paneles en tiempo real para tu equipo." },
]

function CapabilityBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {enabled ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {enabled ? "Habilitado" : "No incluido"}
    </span>
  )
}

function PlanCapabilitiesCard() {
  const { plans, loading: plansLoading } = usePlans()
  const { subscription, loading: subLoading } = useMySubscription()

  const currentPlan = plans?.find((p) => p.id === subscription?.planId) ?? null
  const loading = plansLoading || subLoading

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <Plug className="h-4 w-4" style={{ color: "#2D5A43" }} />
        <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
          Integraciones incluidas en tu plan
        </h3>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {currentPlan
          ? `Según tu plan actual: ${currentPlan.name}.`
          : "Activa un plan para desbloquear integraciones — ver Planes y Facturación."}
      </p>

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.key}
                className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-emerald-950">{cap.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{cap.description}</p>
                </div>
                <CapabilityBadge enabled={Boolean(currentPlan?.limits?.[cap.key])} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

function StripeIntegrationCard() {
  const { plans } = usePlans()
  const orderedPlans = plans ? sortPlansForDisplay(plans) : []

  const stripeUrls: Record<string, string | undefined> = {
    individual: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL_INDIVIDUAL,
    corporativo: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL_CORPORATIVO,
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4" style={{ color: "#2D5A43" }} />
        <h3 className="text-sm font-bold" style={{ color: "#1E3E2B" }}>
          Cobros con Stripe
        </h3>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Cuando hay un Payment Link configurado, &ldquo;Seleccionar Plan&rdquo; redirige directo a Stripe.
      </p>

      <div className="mt-4 space-y-2">
        {orderedPlans.length === 0 ? (
          <p className="py-2 text-sm text-gray-400">No se pudieron cargar los planes.</p>
        ) : (
          orderedPlans.map((plan) => {
            const configured = Boolean(stripeUrls[plan.tier.toLowerCase()])
            return (
              <div key={plan.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                <span className="text-sm font-medium text-slate-700">{plan.name}</span>
                <CapabilityBadge enabled={configured} />
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}

export function IntegrationsContent() {
  return (
    <div className="flex-1 space-y-6">
      <PlanCapabilitiesCard />
      <StripeIntegrationCard />
    </div>
  )
}
