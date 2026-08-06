"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

/**
 * Igual que /auth/reset-password: el backend probablemente genera el link
 * de confirmación de email con el mismo prefijo /auth. Reenviamos por si acaso.
 */
function RedirectToConfirmEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    router.replace(`/confirm-email?${searchParams.toString()}`)
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F9F5]">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-700" />
    </div>
  )
}

export default function AuthConfirmEmailRedirect() {
  return (
    <Suspense fallback={null}>
      <RedirectToConfirmEmail />
    </Suspense>
  )
}
