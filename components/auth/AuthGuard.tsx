"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"

/**
 * El sitio se despliega como export estático (ver next.config.mjs / render.yaml),
 * por lo que no hay Middleware ni servidor Next en producción: la protección de
 * /dashboard se resuelve enteramente en el cliente con la sesión guardada localmente.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router])

  if (status !== "authenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#faf9fe]">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-700" />
      </div>
    )
  }

  return <>{children}</>
}
