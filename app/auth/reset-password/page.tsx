"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

/**
 * El backend de Auth & Profile genera el link de "restablecer contraseña"
 * apuntando a /auth/reset-password (no a /reset-password, que es donde
 * vive la página real). Este shim solo reenvía la query string.
 */
function RedirectToResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    router.replace(`/reset-password?${searchParams.toString()}`)
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F9F5]">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-700" />
    </div>
  )
}

export default function AuthResetPasswordRedirect() {
  return (
    <Suspense fallback={null}>
      <RedirectToResetPassword />
    </Suspense>
  )
}
