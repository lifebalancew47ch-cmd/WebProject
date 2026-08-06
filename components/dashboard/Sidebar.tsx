"use client"

import { X } from "lucide-react"
import { SidebarBrand } from "@/components/dashboard/SidebarBrand"
import { SidebarNav } from "@/components/dashboard/SidebarNav"
import { SidebarUser } from "@/components/dashboard/SidebarUser"
import { useSidebar } from "@/components/dashboard/SidebarContext"

export function Sidebar() {
  const { isOpen, close } = useSidebar()

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-gray-100 bg-white transition-transform duration-200 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar menú"
          className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-black/5 lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>

        <SidebarBrand />
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <SidebarUser />
      </aside>
    </>
  )
}
