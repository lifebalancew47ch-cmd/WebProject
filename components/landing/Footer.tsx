import { Globe } from "lucide-react"

const MERCADOLIBRE_URL =
  "https://www.mercadolibre.com.mx/reloj-samsung-galaxy-watch-6-classic-smartwatch-47mm-color-plateado-excelente-reacondicionado/p/MLM2010725090"

const productLinks = [
  { label: "Características", href: "#caracteristicas" },
  { label: "Hardware", href: MERCADOLIBRE_URL, external: true },
  { label: "API & Docs", href: "#" },
  { label: "Seguridad", href: "#" },
]
const companyLinks = ["Acerca de", "Carreras", "Contacto", "Prensa"]
const socialLinks = ["LinkedIn", "Instagram", "X"]

export function Footer() {
  return (
    <footer className="bg-white border-t border-emerald-100/50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <span className="text-2xl font-bold tracking-tight text-emerald-950">
              LifeBalance <span className="font-light text-emerald-700">Watch</span>
            </span>
            <p className="mt-3 text-sm text-slate-500 max-w-xs">
              Bio-gestión de precisión para líderes que exigen el máximo rendimiento.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Products</p>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-slate-600 hover:text-emerald-700 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Compañía</p>
            <ul className="space-y-3">
              {companyLinks.map((label) => (
                <li key={label}>
                  <a href="#" className="text-sm text-slate-600 hover:text-emerald-700 transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-emerald-100/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">© 2026 LifeBalance Tech S.A. Todos los derechos reservados.</p>

          <div className="flex items-center gap-6">
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-700 transition-colors"
            >
              <Globe className="h-4 w-4" strokeWidth={2} />
              ES
            </button>
            <div className="flex items-center gap-4">
              {socialLinks.map((label) => (
                <a key={label} href="#" className="text-sm text-slate-500 hover:text-emerald-700 transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
