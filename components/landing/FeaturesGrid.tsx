import { Network, ShieldCheck, Watch } from "lucide-react"

const WAVEFORM_HEIGHTS = [30, 55, 40, 70, 45, 90, 60, 35, 75, 50, 65, 40, 80, 55, 30]

function MetricPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
      {children}
    </span>
  )
}

const bottomCards = [
  {
    icon: Network,
    title: "Executive Insights",
    description: "Reportes ejecutivos que traducen datos biométricos en decisiones de negocio.",
  },
  {
    icon: Watch,
    title: "Integración Total",
    description: "Sincronización nativa con los principales dispositivos wearables del mercado.",
  },
  {
    icon: ShieldCheck,
    title: "Privacidad de Datos",
    description: "Cifrado de extremo a extremo y cumplimiento normativo en cada métrica capturada.",
  },
]

export function FeaturesGrid() {
  return (
    <section id="caracteristicas" className="py-20 bg-white border-t border-emerald-100/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3527] tracking-tight">
            Ingeniería para el Alto Rendimiento
          </h2>
          <p className="text-emerald-700 font-medium tracking-wide text-sm uppercase">
            Tecnología de precisión aplicada a la salud ejecutiva.
          </p>
        </div>

        {/* Fila superior: 2 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-8">
          {/* Tarjeta blanca */}
          <div className="p-8 rounded-3xl bg-[#F4F9F5] border border-emerald-100/50 hover:border-emerald-300 transition-all hover:shadow-xl hover:shadow-emerald-50/50 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-emerald-100/50 mb-6">
                🧘‍♂️
              </div>
              <h3 className="text-xl font-bold text-[#1E3527]">Reducción Inteligente de Sedentarismo</h3>
              <p className="mt-3 text-slate-600 leading-relaxed text-sm">
                Detección inteligente basada en sensores de actividad. El sistema evalúa cuándo necesitas
                una pausa de reactivación muscular sin interrumpir tus momentos de foco profundo.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-100/40 flex flex-wrap gap-2">
              <MetricPill>+32% Mejora Postural</MetricPill>
              <MetricPill>-45% Estrés Físico</MetricPill>
            </div>
          </div>

          {/* Tarjeta verde menthol */}
          <div
            className="p-8 rounded-3xl border transition-all hover:shadow-xl flex flex-col justify-between"
            style={{ backgroundColor: "#D7F2E4", borderColor: "#BFE6D3" }}
          >
            <div>
              <div className="w-12 h-12 bg-white/70 rounded-2xl flex items-center justify-center text-xl shadow-sm mb-6">
                🧠
              </div>
              <h3 className="text-xl font-bold text-[#1E3527]">Rendimiento Cognitivo</h3>
              <p className="mt-3 text-emerald-900/70 leading-relaxed text-sm">
                Métricas avanzadas para analizar tus ventanas de máxima concentración y sincronizar tu
                jornada laboral con tus ritmos circadianos para optimizar la toma de decisiones.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-[#0F2A1D] p-4 flex items-end gap-1 h-20">
              {WAVEFORM_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full bg-emerald-400/80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Fila inferior: 3 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {bottomCards.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="p-8 rounded-3xl bg-[#F4F9F5] border border-emerald-100/50 hover:border-emerald-300 transition-all hover:shadow-xl hover:shadow-emerald-50/50"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100/50 mb-6 text-emerald-700">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-[#1E3527]">{title}</h3>
              <p className="mt-2 text-slate-600 leading-relaxed text-sm">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
