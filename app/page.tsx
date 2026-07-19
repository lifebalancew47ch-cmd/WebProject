import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F4F9F5] text-slate-800 font-sans">
      
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#F4F9F5]/90 px-6 py-4 border-b border-emerald-100/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-emerald-950">
              LifeBalance <span className="font-light text-emerald-700">Watch</span>
            </span>
          </div>
          <div className="hidden md:flex space-x-8 font-medium text-emerald-900/80">
            <a href="#caracteristicas" className="hover:text-emerald-700 transition-colors">Características</a>
            <a href="#ingenieria" className="hover:text-emerald-700 transition-colors">Ingeniería</a>
            <a href="#admin" className="hover:text-emerald-700 transition-colors">Admin Suite</a>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-emerald-900 font-medium hover:text-emerald-700 transition-colors">
              Iniciar Sesión
            </button>
            <a 
              href="#comenzar" 
              className="bg-[#416B51] hover:bg-[#345641] text-white font-semibold px-5 py-2 rounded-full transition-all text-sm"
            >
              Comenzar Ahora
            </a>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="px-6 pt-12 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Columna Izquierda: Copiado idéntico a tu maqueta */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider text-emerald-800 uppercase bg-emerald-100/60 rounded-full border border-emerald-200">
              ✦ SISTEMA COMPLETO
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1E3527] leading-tight">
              Optimice su Productividad mediante el equilibrio biológico.
            </h1>
            
            <p className="text-lg text-emerald-900/70 max-w-xl leading-relaxed">
              La primera plataforma de bio-gestión diseñada para líderes que exigen el máximo rendimiento mental sin comprometer su salud física.
            </p>
            
            <div className="pt-4 flex flex-wrap gap-4">
              <a 
                href="#comenzar" 
                className="bg-[#416B51] hover:bg-[#345641] text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-emerald-900/10 transition-all flex items-center gap-2"
              >
                Comenzar Ahora <span>→</span>
              </a>
              <button 
                className="bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200/80 font-bold px-8 py-3.5 rounded-full transition-all"
              >
                Ver Video
              </button>
            </div>
          </div>

          {/* Columna Derecha: El Smartwatch y la Tarjeta Flotante */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            
            {/* Contenedor del reloj con degradado de fondo */}
            <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-3xl bg-gradient-to-tr from-emerald-950 to-emerald-900 flex items-center justify-center shadow-2xl overflow-hidden">
              
              {/* Representación conceptual del Smartwatch */}
              <div className="w-56 h-56 rounded-full border-4 border-slate-700/50 bg-slate-950 flex flex-col items-center justify-center text-white shadow-inner p-4 text-center">
                <span className="text-xs text-emerald-400 font-mono tracking-widest uppercase">Bio-Status</span>
                <span className="text-3xl font-black mt-1 text-emerald-550">14:20</span>
                <div className="w-full bg-emerald-900/50 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[84%]" />
                </div>
                <span className="text-[10px] text-slate-400 mt-2">Ritmo Cardíaco: 72 lpm</span>
              </div>
              
              {/* Luces de fondo del degradado */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl" />
            </div>

            {/* TARJETA FLOTANTE (Foco Activo: 94% Óptimo) */}
            <div className="absolute -bottom-4 left-4 md:left-12 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-3 animate-bounce-slow">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                📈
              </div>
              <div>
                <p className="text-[11px] text-emerald-900/60 font-semibold uppercase tracking-wider">Foco Activo</p>
                <p className="text-lg font-extrabold text-[#1E3527]">94% Óptimo</p>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* 3. SECCIÓN: INGENIERÍA PARA EL ALTO RENDIMIENTO */}
      <section id="ingenieria" className="py-20 bg-white border-t border-emerald-100/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3527] tracking-tight">
              Ingeniería para el Alto Rendimiento
            </h2>
            <p className="text-emerald-700 font-medium tracking-wide text-sm uppercase">
              Tecnología de precisión aplicada a la salud ejecutiva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Tarjeta 1: Reducción Inteligente de Sedentarismo */}
            <div className="p-8 rounded-3xl bg-[#F4F9F5] border border-emerald-100/50 hover:border-emerald-300 transition-all hover:shadow-xl hover:shadow-emerald-50/50 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-emerald-100/50 mb-6">
                  🧘‍♂️
                </div>
                <h3 className="text-xl font-bold text-[#1E3527]">
                  Reducción Inteligente de Sedentarismo
                </h3>
                <p className="mt-3 text-slate-600 leading-relaxed text-sm">
                  Detección inteligente basada en sensores de actividad. El sistema evalúa cuándo necesitas una pausa de reactivación muscular sin interrumpir tus momentos de foco profundo.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-100/40 flex items-center text-emerald-700 text-sm font-semibold">
                Saber más <span className="ml-1">→</span>
              </div>
            </div>

            {/* Tarjeta 2: Rendimiento Cognitivo */}
            <div className="p-8 rounded-3xl bg-[#F4F9F5] border border-emerald-100/50 hover:border-emerald-300 transition-all hover:shadow-xl hover:shadow-emerald-50/50 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-emerald-100/50 mb-6">
                  
                </div>
                <h3 className="text-xl font-bold text-[#1E3527]">
                  Rendimiento Cognitivo
                </h3>
                <p className="mt-3 text-slate-600 leading-relaxed text-sm">
                  Métricas avanzadas para analizar tus ventanas de máxima concentración y sincronizar tu jornada laboral con tus ritmos circadianos para optimizar la toma de decisiones.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-100/40 flex items-center text-emerald-700 text-sm font-semibold">
                Saber más <span className="ml-1">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}