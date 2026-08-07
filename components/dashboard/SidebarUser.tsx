"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import { useSidebar } from "@/components/dashboard/SidebarContext"

function getInitials(firstName?: string | null, lastName?: string | null, fallback?: string | null) {
  const first = firstName?.trim()?.[0]
  const last = lastName?.trim()?.[0]
  if (first || last) return `${first ?? ""}${last ?? ""}`.toUpperCase()
  return fallback?.slice(0, 2).toUpperCase() ?? "?"
}

export function SidebarUser() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { close } = useSidebar()

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || user.email
    : "Invitado"

  const isActive = pathname === "/dashboard/Profile" || pathname?.startsWith("/dashboard/Profile/")

  async function handleLogout() {
    await logout()
    router.push("/login")
  }

  return (
    <div className="border-t border-gray-100 px-5 py-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/Profile"
          onClick={close}
          className={`-m-2 flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 transition-colors ${
            isActive ? "bg-black/5" : "hover:bg-black/5"
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
            {getInitials(user?.firstName, user?.lastName, user?.username)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-emerald-900">{displayName}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
