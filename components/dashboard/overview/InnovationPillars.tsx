import { Brain, Calendar, Link2, Scan, ShieldCheck, Users, Zap } from "lucide-react"

export function InnovationPillars() {
  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#1E3E2B]">Pilares de Innovación</h2>
        <p className="mt-2 text-sm text-gray-500">
          Arquitectura diseñada para la excelencia operativa y el bienestar humano.
        </p>
      </div>

      {/* Fila 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Scan className="h-5 w-5" strokeWidth={2} />
          </div>
          <h3 className="text-base font-bold text-[#1E3E2B]">Visión Espacial</h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Mapeo ergonómico tridimensional del espacio de trabajo, sin necesidad de sensores
            vestibles ni wearables.
          </p>
        </div>

        <div className="rounded-2xl bg-[#3A6D53] p-6 text-white shadow-md">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Brain className="h-5 w-5" strokeWidth={2} />
          </div>
          <h3 className="text-base font-bold">Métricas de Fatiga</h3>
          <p className="mt-2 text-sm text-white/80 leading-relaxed">
            Algoritmos de IA que miden la fatiga cognitiva mediante micro-gestos faciales y
            frecuencia de parpadeo.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-5 w-5" strokeWidth={2} />
          </div>
          <h3 className="text-base font-bold text-[#1E3E2B]">Privacidad</h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Procesamiento local on-edge: ninguna imagen facial sale del dispositivo del usuario.
          </p>
        </div>
      </div>

      {/* Fila 2: layout asimétrico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl p-6" style={{ backgroundColor: "#BCECE0" }}>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-[#1E3E2B]">
            <Zap className="h-5 w-5" strokeWidth={2} />
          </div>
          <h3 className="text-base font-bold text-[#1E3E2B]">Latencia Cero</h3>
          <p className="mt-2 text-sm text-[#1E3E2B]/70 leading-relaxed">
            Respuesta en milisegundos para alertas críticas de salud ejecutiva.
          </p>
        </div>

        <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6">
          <div>
            <h3 className="text-base font-bold text-[#1E3E2B]">Ecosistema Abierto</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-md">
              Integración nativa con CRM, calendarios y software de gestión empresarial.
            </p>
          </div>
          <div className="flex items-center -space-x-2 shrink-0">
            {[Calendar, Users, Link2].map((Icon, i) => (
              <div
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-emerald-50 text-emerald-700"
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
