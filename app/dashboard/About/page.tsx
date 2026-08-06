import type { Metadata } from "next"
import { Info } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { AboutStats } from "@/components/dashboard/about/AboutStats"
import { AboutInfoCard } from "@/components/dashboard/about/AboutInfoCard"

export const metadata: Metadata = {
  title: "Acerca de | LifeBalance Admin",
}

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Info}
        title="Acerca de"
        description="Información sobre la versión y el equipo detrás de LifeBalance."
      />
      <AboutStats />
      <AboutInfoCard />
    </div>
  )
}
