"use client"

import { Moon, Sun, Sunrise } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"

function getGreeting(hour: number) {
  if (hour >= 5 && hour < 12) {
    return { text: "Buenos días", note: "que tengas un día productivo.", icon: Sunrise, tint: "#F5A623" }
  }
  if (hour >= 12 && hour < 19) {
    return { text: "Buenas tardes", note: "esperamos que tu jornada vaya excelente.", icon: Sun, tint: "#E08B2C" }
  }
  return { text: "Buenas noches", note: "gracias por seguir cuidando tu bienestar.", icon: Moon, tint: "#5B6FD8" }
}

export function WelcomeGreeting() {
  const { user } = useAuth()
  if (!user) return null

  const { text, note, icon: Icon, tint } = getGreeting(new Date().getHours())
  const firstName = user.firstName?.trim() || user.username || "de vuelta"

  return (
    <div
      key={text}
      className="mb-6 flex animate-fadeSlideUp items-center gap-3 rounded-2xl bg-white px-5 py-3.5 shadow-sm"
    >
      <span
        className="flex h-9 w-9 shrink-0 animate-iconPop items-center justify-center rounded-full"
        style={{ backgroundColor: `${tint}1A` }}
      >
        <Icon className="h-[18px] w-[18px]" style={{ color: tint }} strokeWidth={2} />
      </span>
      <p className="text-sm text-gray-600">
        <span className="font-bold text-[#1E3E2B]">
          {text}, {firstName}
        </span>{" "}
        — {note}
      </p>
    </div>
  )
}
