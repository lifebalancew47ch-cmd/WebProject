"use client"

import { Moon, Sun, Sunrise } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"

function getGreeting(hour: number) {
  if (hour >= 5 && hour < 12) {
    return { text: "Buenos días", note: "que tengas un día productivo.", icon: Sunrise }
  }
  if (hour >= 12 && hour < 19) {
    return { text: "Buenas tardes", note: "esperamos que tu jornada vaya excelente.", icon: Sun }
  }
  return { text: "Buenas noches", note: "gracias por seguir cuidando tu bienestar.", icon: Moon }
}

export function WelcomeGreeting() {
  const { user } = useAuth()
  if (!user) return null

  const { text, note, icon: Icon } = getGreeting(new Date().getHours())
  const firstName = user.firstName?.trim() || user.username || "de vuelta"

  return (
    <div
      key={text}
      className="relative mb-6 flex animate-fadeSlideUp items-center gap-4 overflow-hidden rounded-2xl border border-emerald-200/30 px-6 py-5 shadow-lg backdrop-blur-md"
    >
      {/* Fondo verde esmeralda translúcido, con el degradado desplazándose lento */}
      <div
        className="absolute inset-0 animate-gradientShift bg-gradient-to-r from-[#2D5A43]/85 via-[#3A6D53]/75 to-[#1E3E2B]/90"
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Resplandores decorativos, con pulso suave */}
      <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 animate-pulse rounded-full bg-white/10 blur-2xl" />
      <div
        className="pointer-events-none absolute -bottom-8 left-1/3 h-24 w-24 animate-pulse rounded-full bg-emerald-300/20 blur-2xl"
        style={{ animationDelay: "1s" }}
      />

      <span className="relative flex h-12 w-12 shrink-0 animate-iconPop items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
        <Icon className="h-6 w-6 text-white" strokeWidth={2} />
      </span>

      <p className="relative">
        <span className="block text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          {text}, {firstName}
        </span>
        <span className="mt-0.5 block text-sm font-medium text-white/80">{note}</span>
      </p>
    </div>
  )
}
