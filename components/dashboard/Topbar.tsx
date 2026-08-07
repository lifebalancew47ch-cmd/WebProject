"use client"

import Link from "next/link"
import { Search, Bell, Info, Menu } from "lucide-react"
import { useSidebar } from "@/components/dashboard/SidebarContext"

export function Topbar() {
  const { open } = useSidebar()

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-100 bg-white/90 px-4 backdrop-blur-md sm:gap-4 sm:px-6">
      <button
        type="button"
        onClick={open}
        aria-label="Abrir menú"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-black/5 hover:text-emerald-700 lg:hidden"
      >
        <Menu className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>

      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          placeholder="Buscar en la base de conocimeintos..."
          className="w-full rounded-sm border bg-[#F1F3FF] py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:bg-white"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Link
          href="/dashboard/Notifications"
          aria-label="Notificaciones"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-black/5 hover:text-emerald-700"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
        </Link>
        <Link
          href="/dashboard/About"
          aria-label="Acerca de"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-black/5 hover:text-emerald-700"
        >
          <Info className="h-[18px] w-[18px]" strokeWidth={2} />
        </Link>
      </div>
    </header>
  )
}
