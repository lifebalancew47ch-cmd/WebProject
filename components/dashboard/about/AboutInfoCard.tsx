import { Card } from "@/components/ui/Card"

const ABOUT_PARAGRAPHS = [
  "LifeBalance es la plataforma de bio-gestión que ayuda a equipos y profesionales a equilibrar productividad y salud física. A través de un reloj inteligente y su aplicación, monitorea patrones de sedentarismo en tiempo real y recuerda el momento exacto para tomar una pausa activa, antes de que el cansancio o la fatiga afecten el rendimiento.",
  "El sistema combina sensores de ritmo cardíaco y postura con un umbral crítico de 45 a 60 minutos sin movimiento: cuando se alcanza, el reloj genera una alerta autónoma —incluso sin conexión a internet— y sugiere micro-rutinas de 2 minutos o caminatas cortas. El panel de administración resume esta actividad por organización mediante puntuaciones sedentarias, mapas de calor de comportamiento y métricas de licencias activas.",
  "La privacidad de los datos de salud es innegociable: la información se almacena cifrada y, cuando LifeBalance se ofrece como beneficio corporativo, el equipo administrador solo accede a métricas generales y anonimizadas —nunca a datos biométricos individuales— para promover el bienestar de toda la organización.",
]

export function AboutInfoCard() {
  return (
    <Card className="space-y-4 p-8">
      {ABOUT_PARAGRAPHS.map((paragraph, index) => (
        <p key={index} className="text-sm leading-relaxed text-slate-600">
          {paragraph}
        </p>
      ))}
    </Card>
  )
}
