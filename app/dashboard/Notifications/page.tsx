import type { Metadata } from "next"
import { Bell } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel"

export const metadata: Metadata = {
  title: "Notificaciones | LifeBalance Admin",
}

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bell}
        title="Notificaciones"
        description="Revisa las alertas y avisos recientes de la plataforma."
      />
      <NotificationsPanel />
    </div>
  )
}
