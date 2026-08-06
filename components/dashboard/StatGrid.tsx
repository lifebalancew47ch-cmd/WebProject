import { StatCard } from "@/components/ui/StatCard"

type Stat = {
  label: string
  value: string
}

type StatGridProps = {
  stats: Stat[]
}

export function StatGrid({ stats }: StatGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </div>
  )
}
