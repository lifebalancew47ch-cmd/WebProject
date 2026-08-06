const steps = [
  {
    number: "01",
    title: "Conectar",
    description: "Sincroniza tu dispositivo LifeBalance Watch con la plataforma en menos de dos minutos.",
  },
  {
    number: "02",
    title: "Monitorear",
    description: "Análisis continuo de ritmo cardíaco, niveles de estrés y oxígeno en sangre durante tu jornada.",
  },
  {
    number: "03",
    title: "Optimizar",
    description: "Recibe insights y alertas personalizadas para ajustar tu rutina en tiempo real.",
  },
]

const BAR_HEIGHTS = [40, 65, 50, 80, 60, 90, 45]

function DashboardMockup() {
  return (
    <div
      className="bg-[#0B1A14] p-6"
      style={{ borderRadius: "20px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
    >
      <div className="flex items-center gap-1.5 mb-5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {["Foco", "Energía", "Recuperación"].map((label, i) => (
          <div key={label} className="rounded-xl bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-wider text-emerald-200/50">{label}</p>
            <p className="mt-1 text-lg font-bold text-white">{[94, 87, 76][i]}%</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white/5 p-4 flex items-end gap-2 h-32">
        {BAR_HEIGHTS.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-500 to-sky-400" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

export function ProcessSection() {
  return (
    <section id="funcionamiento" className="py-20 bg-[#F4F9F5]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3527] tracking-tight">
            El Camino hacia la Excelencia
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-400">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1E3527]">{step.title}</h3>
                  <p className="mt-1.5 text-slate-600 leading-relaxed text-sm max-w-md">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}
