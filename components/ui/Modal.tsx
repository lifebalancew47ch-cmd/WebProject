"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

type ModalProps = {
  open: boolean
  onClose: () => void
  titleId: string
  children: React.ReactNode
  maxWidth?: string
}

/**
 * Diálogo accesible compartido por todos los modales de la app (antes cada
 * uno reimplementaba backdrop + botón de cerrar + estructura por separado,
 * sin manejo de teclado). Centraliza:
 * - role="dialog" + aria-modal + aria-labelledby (el caller decide qué
 *   elemento lleva `id={titleId}`, normalmente el <h3> del título).
 * - Cierre con tecla Escape.
 * - Focus trap: el foco entra al abrir y no se puede escapar con Tab hacia
 *   el contenido de fondo; al cerrar, vuelve a quien tenía el foco antes.
 */
export function Modal({ open, onClose, titleId, children, maxWidth = "max-w-sm" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) triggerRef.current = document.activeElement as HTMLElement
    else triggerRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const node = dialogRef.current
    const focusables = node?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusables?.[0]?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key !== "Tab" || !focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full ${maxWidth} rounded-3xl bg-white p-6 shadow-xl`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}
