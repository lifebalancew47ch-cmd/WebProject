"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { DashedPillButton } from "./DashedPillButton"

const navLinks = [
  { href: "#comprar-reloj", label: "Comprar Reloj" },
  { href: "#caracteristicas", label: "Características" },
  { href: "#funcionamiento", label: "Funcionamiento" },
  { href: "#planes", label: "Planes" },
  { href: "#preguntas-frecuentes", label: "FAQ" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#F4F9F5]/90 px-6 py-4 border-b border-emerald-100/50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-950">
            LifeBalance <span className="font-light text-emerald-700">Watch</span>
          </span>
        </div>

        <div className="hidden lg:flex space-x-8 font-medium text-emerald-900/80">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-emerald-700 transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center space-x-4">
          <Link href="/login" className="text-emerald-900 font-medium hover:text-emerald-700 transition-colors">
            Iniciar Sesión
          </Link>
          <DashedPillButton href="/register" className="px-5 py-2 text-sm">
            Comenzar Ahora
          </DashedPillButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-full text-emerald-900 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="lg:hidden max-w-7xl mx-auto mt-4 flex flex-col gap-4 border-t border-emerald-100/50 pt-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-medium text-emerald-900/80 hover:text-emerald-700 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-4 pt-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-emerald-900 font-medium hover:text-emerald-700 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <DashedPillButton href="/register" className="px-5 py-2 text-sm">
              Comenzar Ahora
            </DashedPillButton>
          </div>
        </div>
      ) : null}
    </nav>
  )
}
