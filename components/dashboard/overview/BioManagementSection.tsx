import { Heart, HeartPulse, PersonStanding, Wind } from "lucide-react"

const metrics = [
  {
    icon: PersonStanding,
    title: "Monitoreo de Postura",
    description: "Detección de tensión cervical.",
  },
  {
    icon: HeartPulse,
    title: "Frecuencia Cardíaca",
    description: "Análisis rPPG (Remote Photoplethysmography) mediante cambios sutiles en la piel facial.",
  },
  {
    icon: Wind,
    title: "Niveles de Oxígeno",
    description: "Estimación de saturación de O2 para sugerir micro-pausas.",
  },
]

export function BioManagementSection() {
  return (
    <section className="rounded-3xl p-8 mb-12" style={{ backgroundColor: "#F0F3F9" }}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E3E2B]">Metodología Bio-Management</h2>
        <p className="mt-2 text-sm text-gray-500">
          Ciencia biométrica aplicada al rendimiento ejecutivo sostenible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Columna izquierda: 3 sub-cards */}
        <div className="space-y-4">
          {metrics.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4 rounded-2xl bg-white p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1E3E2B]">{title}</h3>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Columna derecha: anillo biométrico */}
        <div className="flex justify-center">
          <div
            className="relative flex h-72 w-72 flex-col items-center justify-center rounded-full bg-white"
            style={{ border: "4px solid #30E398" }}
          >
            <span
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#1E3E2B] shadow-md"
            >
              Análisis rPPG Activo
            </span>

            <Heart className="h-7 w-7 text-[#30E398] mb-2" fill="#30E398" strokeWidth={1.5} />
            <span className="text-5xl font-extrabold text-[#1E3E2B]">98%</span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Precisión Predictiva
            </span>

            <span
              className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#1E3E2B] shadow-md"
            >
              Calidad de Oxígeno Óptima
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
