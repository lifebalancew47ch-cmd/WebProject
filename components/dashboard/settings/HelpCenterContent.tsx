"use client"

import { useState } from "react"
import { CategoryNav } from "./CategoryNav"
import { FAQAccordion } from "./FAQAccordion"
import { BillingContent } from "./BillingContent"

export function HelpCenterContent() {
  const [activeCategory, setActiveCategory] = useState("General")

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <CategoryNav active={activeCategory} onSelect={setActiveCategory} />
      {activeCategory === "General" ? (
        <FAQAccordion />
      ) : activeCategory === "Planes y Facturación" ? (
        <BillingContent />
      ) : (
        <div className="flex-1 rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
          Aún no hay contenido de ayuda para &ldquo;{activeCategory}&rdquo;.
        </div>
      )}
    </div>
  )
}
