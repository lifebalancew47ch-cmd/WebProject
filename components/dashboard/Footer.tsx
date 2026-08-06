import Link from "next/link"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-10 border-t border-gray-100 pt-6 text-sm text-slate-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year}{" "}
          <span className="font-semibold text-emerald-700">LifeBalance</span>{" "}
          Enterprise Suite. Todos los derechos reservados.
        </p>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/dashboard/About"
            className="transition-colors hover:text-emerald-700"
          >
            Acerca de
          </Link>
          <Link href="#" className="transition-colors hover:text-emerald-700">
            Privacidad
          </Link>
          <Link href="#" className="transition-colors hover:text-emerald-700">
            Términos
          </Link>
          <Link href="#" className="transition-colors hover:text-emerald-700">
            Soporte
          </Link>
        </nav>
      </div>
    </footer>
  )
}
