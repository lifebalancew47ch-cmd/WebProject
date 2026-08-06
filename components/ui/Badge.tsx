import type { LucideIcon } from "lucide-react"

type Tone = "success" | "neutral" | "danger" | "warning"

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-emerald-100 text-emerald-700",
  neutral: "bg-gray-100 text-gray-600",
  danger: "bg-red-100 text-red-600",
  warning: "bg-amber-100 text-amber-700",
}

type BadgeProps = {
  tone: Tone
  icon?: LucideIcon
  children: React.ReactNode
}

/**
 * Pill de estado reutilizable — antes cada panel (organizaciones,
 * integraciones, seguridad) reimplementaba la misma cadena de clases
 * Tailwind con variaciones cosméticas menores.
 */
export function Badge({ tone, icon: Icon, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {children}
    </span>
  )
}
