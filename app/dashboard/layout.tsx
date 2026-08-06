import type { Metadata } from "next"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Topbar } from "@/components/dashboard/Topbar"
import { Footer } from "@/components/dashboard/Footer"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { SidebarProvider } from "@/components/dashboard/SidebarContext"

export const metadata: Metadata = {
  title: "LifeBalance | Admin",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex h-screen text-slate-800 bg-[#faf9fe]">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
              <div className="flex-1">{children}</div>
              <Footer />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
