import type { Metadata } from "next"
import { Info } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatGrid } from "@/components/dashboard/StatGrid"
import { LoremCard } from "@/components/dashboard/LoremCard"

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
      <StatGrid
        stats={[
          { label: "Versión", value: "2.4.0" },
          { label: "Última actualización", value: "Jul 2026" },
          { label: "Licencia", value: "Enterprise" },
        ]}
      />
      <LoremCard />
    </div>
  )
}
