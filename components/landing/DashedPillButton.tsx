import Link from "next/link"
import type { ReactNode } from "react"

type DashedPillButtonProps = {
  href: string
  children: ReactNode
  className?: string
}

/**
 * Botón primario envuelto en un contenedor con borde punteado desfasado
 * (border: 2px dashed #2D5A43), dando el efecto de "píldora" doble.
 * `className` debe traer su propio padding/tamaño de texto — la base no
 * define ninguno para evitar utilidades de Tailwind en conflicto.
 */
export function DashedPillButton({ href, children, className = "" }: DashedPillButtonProps) {
  return (
    <span className="inline-flex rounded-full p-1" style={{ border: "2px dashed #2D5A43" }}>
      <Link
        href={href}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#3A6D53] font-bold text-white transition-all hover:bg-[#2D5A43] ${className}`}
      >
        {children}
      </Link>
    </span>
  )
}
