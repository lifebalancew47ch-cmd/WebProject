import type { Metadata } from "next"
import { WelcomeGreeting } from "@/components/dashboard/overview/WelcomeGreeting"
import { AdminHeroSection } from "@/components/dashboard/overview/AdminHeroSection"
import { LiveMetricsPanel } from "@/components/dashboard/overview/LiveMetricsPanel"
import { InnovationPillars } from "@/components/dashboard/overview/InnovationPillars"
import { BioManagementSection } from "@/components/dashboard/overview/BioManagementSection"
import { OverviewCTA } from "@/components/dashboard/overview/OverviewCTA"

export const metadata: Metadata = {
  title: "Overview | LifeBalance Admin",
}

export default function OverviewPage() {
  return (
    <div>
      <WelcomeGreeting />
      <AdminHeroSection />
      <LiveMetricsPanel />
      <InnovationPillars />
      <BioManagementSection />
      <OverviewCTA />
    </div>
  )
}
