"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { ArrowRight, Download } from "lucide-react"

// Diferido: solo se monta tras el clic en "Solicitar Demo Técnica".
const DemoRequestModal = dynamic(() => import("./DemoRequestModal").then((mod) => mod.DemoRequestModal))

export function OverviewCTA() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <section>
      <h2 className="text-2xl font-bold text-[#1E3E2B] text-center mb-3">
        ¿Listo para transformar su entorno ejecutivo?
      </h2>
      <p className="text-sm text-gray-600 text-center mb-6 max-w-xl mx-auto">
        Únase a las empresas Fortune 500 que ya están utilizando LifeBalance para proteger el
        rendimiento y el bienestar de sus equipos ejecutivos.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setDemoOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#2D5A43] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1E3E2B]"
        >
          Solicitar Demo Técnica <ArrowRight className="h-4 w-4" />
        </button>
        <a
          href="/whitepaper.pdf"
          download
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Download className="h-4 w-4" /> Descargar Whitepaper
        </a>
      </div>

      <p className="mt-12 text-center text-[10px] text-gray-500">
        © 2026 LifeBalance Watch Enterprise. Todos los derechos reservados. | Privacidad | Términos.
      </p>

      <DemoRequestModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  )
}
