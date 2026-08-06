import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth/AuthContext"
import { ToastProvider } from "@/components/ui/ToastProvider"
import { PendingPlanResolver } from "@/components/landing/PendingPlanResolver"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LifeBalance",
  description: "LifeBalance Web Frontend",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <PendingPlanResolver />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
