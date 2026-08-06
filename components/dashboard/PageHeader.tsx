import type { LucideIcon } from "lucide-react"

type PageHeaderProps = {
  icon?: LucideIcon | null
  title: string
  description: string
}

export function PageHeader({
  icon: Icon,
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      {Icon && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-emerald-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {description}
          
        </p>
      </div>
    </div>
  )
}