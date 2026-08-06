import type { Metadata } from "next"
import { Building2 } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { OrganizationsPanel } from "@/components/dashboard/OrganizationsPanel"

export const metadata: Metadata = {
  title: "Organización | LifeBalance Admin",
}

export default function OrganizationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Building2}
        title="Organización"
        description="Administra empresas, planes y estado de cuenta en el Organization & SaaS Service."
      />
      <OrganizationsPanel />
    </div>
  )
}
