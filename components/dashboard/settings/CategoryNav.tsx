import { ArrowRight } from "lucide-react"

const categories = ["General", "Integraciones", "Seguridad", "Planes y Facturación"]

type CategoryNavProps = {
  active: string
  onSelect: (category: string) => void
}

export function CategoryNav({ active, onSelect }: CategoryNavProps) {
  return (
    <div className="w-full md:w-64 shrink-0">
      <span className="mb-3 block text-xs font-bold tracking-wider text-gray-400">CATEGORÍAS</span>
      <div className="flex flex-col gap-3">
        {categories.map((category) => {
          const isActive = category === active
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              className={`flex items-center justify-between rounded-xl bg-white p-3 text-left text-sm transition-colors ${
                isActive
                  ? "border border-[#2D5A43] font-semibold text-[#2D5A43]"
                  : "border border-transparent text-gray-600 hover:border-gray-200"
              }`}
            >
              {category}
              {isActive ? <ArrowRight className="h-4 w-4" /> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
