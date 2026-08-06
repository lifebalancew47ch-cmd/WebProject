import type { Metadata } from "next"
import { AnalyticsHeader } from "@/components/dashboard/analytics/AnalyticsHeader"
import { AnalyticsPanel } from "@/components/dashboard/analytics/AnalyticsPanel"

export const metadata: Metadata = {
  title: "Analytics | LifeBalance Admin",
}

export default function AnalyticsPage() {
  return (
    <div>
      <AnalyticsHeader />
      <AnalyticsPanel />
    </div>
  )
}
