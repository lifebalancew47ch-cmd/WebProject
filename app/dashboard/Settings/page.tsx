import type { Metadata } from "next"
import { HelpCenterHeader } from "@/components/dashboard/settings/HelpCenterHeader"
import { HelpCenterContent } from "@/components/dashboard/settings/HelpCenterContent"
import { SupportCTABanner } from "@/components/dashboard/settings/SupportCTABanner"

export const metadata: Metadata = {
  title: "Settings | LifeBalance Admin",
}

export default function SettingsPage() {
  return (
    <div>
      <HelpCenterHeader />
      <HelpCenterContent />
      <SupportCTABanner />
    </div>
  )
}
