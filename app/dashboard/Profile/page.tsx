import type { Metadata } from "next"
import { ProfileHeader } from "@/components/dashboard/profile/ProfileHeader"
import { ProfileInfoCard } from "@/components/dashboard/profile/ProfileInfoCard"
import { PreferencesCard } from "@/components/dashboard/profile/PreferencesCard"
import { ChangePasswordCard } from "@/components/dashboard/profile/ChangePasswordCard"

export const metadata: Metadata = {
  title: "Perfil | LifeBalance Admin",
}

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <ProfileHeader />
      <ProfileInfoCard />
      <PreferencesCard />
      <ChangePasswordCard />
    </div>
  )
}
