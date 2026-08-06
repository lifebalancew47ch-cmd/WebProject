"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqItems = [
  {
    question: "¿Qué mide exactamente LifeBalance Watch?",
    answer:
      "Ritmo cardíaco, niveles de oxígeno en sangre, calidad del sueño y patrones de sedentarismo, combinados con nuestros algoritmos de análisis para predecir señales tempranas de fatiga y estrés antes de que afecten tu rendimiento.",
  },
  {
    question: "¿Mis datos biométricos están seguros?",
    answer:
      "Sí. Toda la información se transmite y almacena cifrada de extremo a extremo, y nunca se comparte con terceros sin tu consentimiento explícito. Puedes solicitar la eliminación de tus datos en cualquier momento desde tu perfil.",
  },
  {
    question: "¿Puedo cambiar o cancelar mi plan en cualquier momento?",
    answer:
      "Sí, puedes cambiar de plan o cancelar tu suscripción cuando quieras desde el panel de administración, sin permanencia forzosa ni penalizaciones.",
  },
  {
    question: "¿El reloj es compatible con iOS y Android?",
    answer:
      "Sí, LifeBalance Watch se sincroniza de forma nativa con ambos sistemas operativos a través de nuestra app complementaria.",
  },
  {
    question: "¿Qué pasa si necesito ayuda técnica?",
    answer:
      "Todos los planes incluyen soporte por correo, y el plan Corporativo cuenta con soporte prioritario 24/7. También puedes escribirnos desde el Centro de Ayuda dentro de tu panel.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="preguntas-frecuentes" className="py-20 bg-white border-t border-emerald-100/40">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3527] tracking-tight">
            Preguntas frecuentes
          </h2>
          <p className="text-emerald-700 font-medium tracking-wide text-sm uppercase">
            Todo lo que necesitas saber antes de empezar.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={item.question}
                className="rounded-2xl border border-emerald-100/60 bg-[#F4F9F5] p-5 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-bold text-[#1E3527] sm:text-base">{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 shrink-0 text-emerald-700" />
                  ) : (
                    <ChevronDown className="h-5 w-5 shrink-0 text-emerald-700" />
                  )}
                </button>
                {isOpen ? (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
