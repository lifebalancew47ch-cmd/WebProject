import type { Metadata } from "next"
import { ReportsHeader } from "@/components/dashboard/reports/ReportsHeader"
import { ReportGeneratorCard } from "@/components/dashboard/reports/ReportGeneratorCard"
import { ReportHistoryPanel } from "@/components/dashboard/reports/ReportHistoryPanel"

export const metadata: Metadata = {
  title: "Reports | LifeBalance Admin",
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <ReportsHeader />
      <ReportGeneratorCard />
      <ReportHistoryPanel />
    </div>
  )
}
