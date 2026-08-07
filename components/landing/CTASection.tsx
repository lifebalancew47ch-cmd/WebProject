import Link from "next/link"

export function CTASection() {
  return (
    <section id="cta-demo" className="py-20 bg-[#F4F9F5]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1E3527] tracking-tight">
          ¿Listo para transformar su organización?
        </h2>
        <p className="mt-4 text-lg text-emerald-900/70 max-w-2xl mx-auto">
          Únase a las empresas que ya están optimizando el bienestar de sus líderes con LifeBalance Watch.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#1E3E2B" }}
          >
            Solicitar Demo Gratuita
          </Link>
          <span className="text-sm text-slate-500">No se requiere tarjeta de crédito</span>
        </div>
      </div>
    </section>
  )
}
