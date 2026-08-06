"use client"

import { useEffect, useRef, useState, type TouchEvent } from "react"
import Image from "next/image"
import { BadgeCheck, ChevronLeft, ChevronRight, ExternalLink, ShieldCheck, Star, Truck } from "lucide-react"

const AUTOPLAY_MS = 5000
const SWIPE_THRESHOLD_PX = 50

type Product = {
  name: string
  condition: string
  price: string
  currency: string
  installments: string
  rating: number
  reviews: number
  imageUrl: string
  storeUrl: string
  storeName: string
}

/**
 * Datos tomados a mano de cada listado real (no hay API pública que permita
 * traer esto en vivo de un tercero — ver docs/SECURITY.md). Para agregar un
 * reloj más al carrusel, solo hay que empujar otro objeto aquí con sus
 * datos reales; el carrusel (flechas + puntos) se activa solo en cuanto hay
 * más de uno.
 */
const PRODUCTS: Product[] = [
  {
    name: "Samsung Galaxy Watch 6 Classic 47mm — Plateado",
    condition: "Reacondicionado · Estado Excelente",
    price: "$2,999",
    currency: "MXN",
    installments: "15 meses sin intereses de $199.93",
    rating: 5.0,
    reviews: 1,
    imageUrl: "https://http2.mlstatic.com/D_NQ_NP_919023-MLA99991008379_112025-O.webp",
    storeUrl:
      "https://www.mercadolibre.com.mx/reloj-samsung-galaxy-watch-6-classic-smartwatch-47mm-color-plateado-excelente-reacondicionado/p/MLM2010725090",
    storeName: "MercadoLibre",
  },
  {
    name: "Samsung Galaxy Watch 6 40mm — Gold",
    condition: "Nuevo",
    price: "$3,593.68",
    currency: "MXN",
    installments: "15 meses sin intereses de $239.58",
    rating: 4.7,
    reviews: 504,
    imageUrl: "https://http2.mlstatic.com/D_NQ_NP_675828-MLU77283295096_072024-O.webp",
    storeUrl:
      "https://www.mercadolibre.com.mx/reloj-samsung-galaxy-watch-6-smartwatch-40mm-ip68-color-gold-color-de-la-caja-graphite-color-de-la-correa-blanco-color-del-bisel-dorado-diseno-de-la-correa-lisa/p/MLM26002450",
    storeName: "MercadoLibre",
  },
  {
    name: "Samsung Galaxy Watch 6 Classic 44mm — Plateado",
    condition: "Reacondicionado · Estado Excelente",
    price: "$2,625.20",
    currency: "MXN",
    installments: "9 meses sin intereses de $291.68",
    rating: 3.6,
    reviews: 21,
    imageUrl: "https://m.media-amazon.com/images/I/71fGT1H-AaL._AC_SX679_.jpg",
    storeUrl: "https://www.amazon.com.mx/dp/B0CZ759CSM",
    storeName: "Amazon",
  },
  {
    name: "Samsung Galaxy Watch 6 Classic 47mm — Negro",
    condition: "Reacondicionado · Estado Excelente",
    price: "$3,033.41",
    currency: "MXN",
    installments: "9 meses sin intereses de $337.04",
    rating: 4.2,
    reviews: 1966,
    imageUrl: "https://m.media-amazon.com/images/I/51kGT4FQ4tL._AC_SX679_.jpg",
    storeUrl: "https://www.amazon.com.mx/dp/B0CR7858WN",
    storeName: "Amazon",
  },
]

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center rounded-3xl bg-white p-8 md:p-10 border border-emerald-100/60">
      {/* Imagen */}
      <div className="flex justify-center">
        <div className="relative aspect-square w-full max-w-xs rounded-3xl bg-[#F4F9F5] p-8">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-contain"
          />
        </div>
      </div>

      {/* Info */}
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <BadgeCheck className="h-3.5 w-3.5" /> {product.condition}
        </span>

        <h3 className="mt-4 text-2xl font-bold text-[#1E3527] leading-snug">{product.name}</h3>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-slate-700">{product.rating.toFixed(1)}</span>
          <span>
            ({product.reviews} {product.reviews === 1 ? "reseña" : "reseñas"})
          </span>
        </div>

        <div className="mt-5">
          <span className="text-4xl font-extrabold text-[#1E3527]">{product.price}</span>
          <span className="ml-1.5 text-slate-500">{product.currency}</span>
          <p className="mt-1 text-sm text-emerald-700 font-medium">{product.installments}</p>
        </div>

        <div className="mt-6 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <Truck className="h-4 w-4 shrink-0 text-emerald-600" />
            Envío disponible a todo México
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            Vendido y protegido por {product.storeName}
          </div>
        </div>

        <a
          href={product.storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 sm:w-auto"
          style={{ backgroundColor: "#1E3E2B" }}
        >
          Comprar en {product.storeName} <ExternalLink className="h-4 w-4" />
        </a>
        <p className="mt-3 text-xs text-slate-400">
          Se abre en una pestaña nueva. La compra se procesa directamente en {product.storeName}.
        </p>
      </div>
    </div>
  )
}

export function WatchProductSection() {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const hasCarousel = PRODUCTS.length > 1

  function goTo(i: number) {
    setIndex((i + PRODUCTS.length) % PRODUCTS.length)
  }

  // Autoplay: se reinicia solo cada vez que `index` cambia (por autoplay,
  // flechas, puntos o swipe), y se pausa mientras el mouse esté encima o
  // haya un swipe en curso.
  useEffect(() => {
    if (!hasCarousel || isPaused) return
    const timer = setTimeout(() => goTo(index + 1), AUTOPLAY_MS)
    return () => clearTimeout(timer)
  }, [index, hasCarousel, isPaused])

  function handleTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    setIsPaused(true)
  }

  function handleTouchEnd(e: TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta > SWIPE_THRESHOLD_PX) goTo(index - 1)
    else if (delta < -SWIPE_THRESHOLD_PX) goTo(index + 1)
    touchStartX.current = null
    setIsPaused(false)
  }

  return (
    <section id="comprar-reloj" className="py-20 bg-[#F4F9F5]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3527] tracking-tight">
            Consigue tu LifeBalance Watch
          </h2>
          <p className="text-emerald-700 font-medium tracking-wide text-sm uppercase">
            El dispositivo que hace posible todo lo anterior.
          </p>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {PRODUCTS.map((product) => (
                <div key={product.storeUrl} className="w-full shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {hasCarousel ? (
            <>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="Reloj anterior"
                className="absolute left-0 top-1/2 hidden -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white p-2.5 text-emerald-800 shadow-lg transition-transform hover:scale-105 md:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label="Siguiente reloj"
                className="absolute right-0 top-1/2 hidden translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white p-2.5 text-emerald-800 shadow-lg transition-transform hover:scale-105 md:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="mt-6 flex items-center justify-center gap-2">
                {PRODUCTS.map((product, i) => (
                  <button
                    key={product.storeUrl}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Ir al reloj ${i + 1}`}
                    aria-current={i === index}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: i === index ? "24px" : "8px",
                      backgroundColor: i === index ? "#2D5A43" : "#D6E3DA",
                    }}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
