"use client"

import { ArrowRight, Download } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"

// No existe todavía un endpoint/CRM real para recibir solicitudes de demo
// (ver docs/SECURITY.md sobre no fingir integraciones) — en vez de un
// formulario que simula un envío que nunca llega a nadie, se abre el
// cliente de correo del usuario con los datos ya precargados. Es menos
// pulido, pero es honesto: el clic sí hace algo real.
function buildDemoMailto(name: string, email: string): string {
  const subject = "Solicitud de demo técnica — LifeBalance Watch"
  const body = `Nombre: ${name || "(agrega tu nombre)"}\nCorreo: ${email || "(agrega tu correo)"}\nEmpresa: \n\nMensaje:\n`
  return `mailto:ventas@lifebalance.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function OverviewCTA() {
  const { user } = useAuth()
  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : ""

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
        <a
          href={buildDemoMailto(displayName, user?.email ?? "")}
          className="inline-flex items-center gap-2 rounded-full bg-[#2D5A43] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1E3E2B]"
        >
          Solicitar Demo Técnica <ArrowRight className="h-4 w-4" />
        </a>
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
    </section>
  )
}
