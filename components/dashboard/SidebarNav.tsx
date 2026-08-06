"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { dashboardNavItems } from "@/lib/dashboard/navigation"
import { useSidebar } from "@/components/dashboard/SidebarContext"

export function SidebarNav() {
  const pathname = usePathname()
  const { close } = useSidebar()

  return (
    <nav className="flex flex-col py-1">
      {dashboardNavItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={close}
            className={[
              "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-emerald-500 bg-black/5 text-emerald-700 border-r-2"
                : "border-transparent text-slate-500 hover:border-emerald-500 hover:bg-black/5 hover:text-emerald-700",
            ].join(" ")}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
