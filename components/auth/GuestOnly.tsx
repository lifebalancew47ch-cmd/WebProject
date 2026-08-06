"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthContext"

/**
 * El sitio se despliega como export estático (ver next.config.mjs / render.yaml),
 * por lo que no hay Middleware ni servidor Next en producción: toda la protección
 * de rutas (incluida esta, la inversa de AuthGuard) se resuelve en el cliente.
 */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard/Overview")
    }
  }, [status, router])

  if (status === "authenticated") {
    return null
  }

  return <>{children}</>
}
