"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqItems = [
  {
    question: "¿Cómo sincronizo mis datos de salud con el panel?",
    answer:
      "Para sincronizar tus datos, dirígete a la sección de 'Configuración de Perfil' y selecciona 'Fuentes de Datos'. Allí podrás vincular dispositivos wearable compatibles como Apple Watch, Garmin o Fitbit. La sincronización ocurre automáticamente cada 15 minutos.",
  },
  {
    question: "¿Puedo exportar reportes mensuales en formato PDF?",
    answer:
      "Sí, en la pestaña de 'Reportes' puedes seleccionar el rango de fechas que necesites y exportar el resumen completo en formato PDF con un solo clic.",
  },
  {
    question: "¿Cómo funciona el análisis predictivo de bienestar?",
    answer:
      "Utilizamos modelos de machine learning para analizar tendencias en tus métricas biométricas históricas y anticipar señales tempranas de fatiga o estrés antes de que se vuelvan críticas.",
  },
  {
    question: "¿Qué navegadores son compatibles con LifeBalance Admin?",
    answer:
      "Recomendamos utilizar las versiones más recientes de Google Chrome, Microsoft Edge o Safari para garantizar una experiencia óptima y segura.",
  },
]

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="flex-1 space-y-4">
      {faqItems.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div key={item.question} className="rounded-xl border border-gray-100 bg-white p-5">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="text-sm font-semibold text-gray-800">{item.question}</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
              )}
            </button>
            {isOpen ? <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.answer}</p> : null}
          </div>
        )
      })}
    </div>
  )
}
