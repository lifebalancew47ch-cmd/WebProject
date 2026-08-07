"use client"

import { useRef, useState } from "react"
import { DashedPillButton } from "./DashedPillButton"

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    video.play()
    setIsPlaying(true)
  }

  return (
    <header className="px-6 pt-12 pb-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Columna Izquierda */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <span
            className="inline-flex items-center text-xs font-semibold tracking-wider uppercase rounded-full"
            style={{ backgroundColor: "#E2EFE7", color: "#2D5A43", padding: "6px 16px" }}
          >
            🌿 BIENESTAR CONSCIENTE
          </span>

          <p className="text-base font-semibold text-emerald-800/80">
            Tu bienestar merece un balance. ¡Nos alegra tenerte aquí!
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1E3527] leading-tight">
            Optimice su Productividad mediante el equilibrio biológico.
          </h1>

          <p className="text-lg text-emerald-900/70 max-w-xl leading-relaxed">
            La primera plataforma de bio-gestión diseñada para líderes que exigen el máximo
            rendimiento mental sin comprometer su salud física.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <DashedPillButton href="/register" className="px-8 py-3.5 text-base">
              Comenzar Ahora <span>→</span>
            </DashedPillButton>

            <button
              type="button"
              onClick={handlePlay}
              className="inline-flex items-center gap-2 bg-white text-emerald-900 font-bold transition-all hover:bg-emerald-50"
              style={{ borderRadius: "9999px", border: "1px solid #E0E0E0", padding: "12px 28px" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Ver Video
            </button>
          </div>
        </div>

        {/* Columna Derecha: Video explicativo + Widget flotante */}
        <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md">
            <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-2xl shadow-emerald-950/20">
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                src="/videos/VideoExplicativo_LifeBalance.mp4"
                poster="/videos/hero-poster.jpg"
                loop
                muted={!isPlaying}
                controls={isPlaying}
                playsInline
                preload="metadata"
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              >
                <track
                  kind="subtitles"
                  src="/videos/VideoExplicativo_LifeBalance.es.vtt"
                  srcLang="es"
                  label="Español"
                  default
                />
              </video>

              {!isPlaying && (
                <button
                  type="button"
                  onClick={handlePlay}
                  aria-label="Reproducir video"
                  className="group absolute inset-0 flex items-center justify-center bg-black/10 transition-colors hover:bg-black/25"
                >
                  <span className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-white/90 text-emerald-800 shadow-lg transition-transform group-hover:scale-105">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
