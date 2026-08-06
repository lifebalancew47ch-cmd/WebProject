export function SupportCTABanner() {
  return (
    <div className="relative mt-8 overflow-hidden rounded-3xl p-8 text-white" style={{ backgroundColor: "#2D5A43" }}>
      <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10" />
      <div className="relative">
        <h2 className="text-2xl font-bold mb-2">¿Aún tienes dudas?</h2>
        <p className="text-sm text-emerald-100 max-w-lg">
          Nuestro equipo de soporte técnico está disponible 24/7 para ayudarte con cualquier
          inconveniente que tengas con la plataforma.
        </p>
      </div>
    </div>
  )
}
