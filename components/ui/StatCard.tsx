import { Card } from "@/components/ui/Card"

type StatCardProps = {
  label: string
  value: string
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold text-emerald-900">{value}</p>
    </Card>
  )
}
