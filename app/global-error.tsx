"use client"

import { useEffect } from "react"

/**
 * Último recurso: se activa solo si el propio `app/layout.tsx` (o algo
 * que envuelve a TODA la app, como AuthProvider) truena al renderizar.
 * Por eso reemplaza el layout completo, incluyendo <html>/<body> — no puede
 * asumir que Tailwind, AuthProvider, ToastProvider, etc. sigan funcionando,
 * así que usa estilos inline y cero dependencias.
 *
 * Zero Leakage: igual que app/error.tsx, nunca se renderiza error.message
 * ni error.stack en la UI.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[LifeBalance] Error crítico capturado por el global error boundary.")
  }, [])

  return (
    <html lang="es">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "24px",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#1E3527" }}>Error de conexión</h1>
          <p style={{ maxWidth: "360px", fontSize: "14px", color: "#64748b" }}>
            Algo no salió como esperábamos. Intenta de nuevo en unos momentos.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              borderRadius: "9999px",
              backgroundColor: "#2D5A43",
              color: "white",
              fontWeight: 700,
              fontSize: "14px",
              padding: "10px 20px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
