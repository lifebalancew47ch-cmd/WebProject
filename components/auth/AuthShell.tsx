import Link from "next/link"
import type { ReactNode } from "react"

type AuthShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#F4F9F5] text-slate-800 font-sans flex">
      {/* Panel de marca (oculto en móvil) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-[#1E3527] flex-col justify-between p-12 overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute top-10 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />

        <Link href="/" className="relative z-10 text-2xl font-bold tracking-tight text-white">
          LifeBalance <span className="font-light text-emerald-300">Watch</span>
        </Link>

        <div className="relative z-10 space-y-4 max-w-md">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider text-emerald-200 uppercase bg-emerald-800/40 rounded-full border border-emerald-700/50">
            ✦ SISTEMA COMPLETO
          </span>
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Optimice su productividad mediante el equilibrio biológico.
          </h2>
          <p className="text-emerald-100/70 leading-relaxed">
            La primera plataforma de bio-gestión diseñada para líderes que exigen el máximo
            rendimiento mental sin comprometer su salud física.
          </p>
        </div>

        <p className="relative z-10 text-xs text-emerald-200/50">
          © {new Date().getFullYear()} LifeBalance. Todos los derechos reservados.
        </p>
      </div>

      {/* Panel del formulario */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="lg:hidden inline-block mb-8 text-xl font-bold text-emerald-950">
            LifeBalance <span className="font-light text-emerald-700">Watch</span>
          </Link>

          <h1 className="text-2xl font-extrabold text-[#1E3527] tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-emerald-900/60">{subtitle}</p> : null}

          <div className="mt-8">{children}</div>

          {footer ? <div className="mt-8 text-center text-sm text-emerald-900/70">{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}
