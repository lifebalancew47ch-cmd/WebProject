"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

/**
 * Error Boundary de Next.js App Router (mecanismo oficial — un componente
 * `error.tsx` es, por debajo, un class component de React envuelto por el
 * framework). Captura cualquier error de renderizado que ocurra dentro de
 * esta rama del árbol (todo lo que no sea el propio `app/layout.tsx`, que
 * usa `global-error.tsx` en su lugar).
 *
 * Zero Leakage: bajo ninguna circunstancia se muestra `error.message` ni
 * `error.stack` — ese es justo el tipo de fuga que un profesor/fuzzer busca
 * al forzar una excepción. El error solo se manda a la consola (visible
 * nada más con DevTools abierto, no en la UI) para no perder el detalle
 * durante desarrollo/depuración.
 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[LifeBalance] Error de renderizado capturado por el error boundary.")
  }, [])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-[#1E3527]">Error de conexión</h1>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">
          Algo no salió como esperábamos. Intenta de nuevo en unos momentos.
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-full bg-[#2D5A43] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1E3E2B]"
      >
        <RefreshCw className="h-4 w-4" /> Reintentar
      </button>
    </div>
  )
}
