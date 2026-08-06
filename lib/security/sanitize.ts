/**
 * Sanitización anti-XSS de texto libre, como capa adicional a lo que React ya
 * hace por defecto.
 *
 * Contexto importante: este proyecto NUNCA usa `dangerouslySetInnerHTML` (se
 * verificó en todo `app/` y `components/` — cero resultados) y React escapa
 * automáticamente cualquier `{variable}` interpolada en JSX. Eso ya elimina
 * la vía de ataque XSS más común (HTML/scripts inyectados que el navegador
 * ejecuta al renderizar). DOMPurify aquí es una segunda capa, no la primera:
 * despoja cualquier marcado HTML/script de lo que el usuario escribe ANTES de
 * que ese texto viaje a la API — por si algún día se agrega un renderizador
 * de texto enriquecido, o por si la API lo reenvía a otro cliente que sí
 * interpreta HTML (otro dashboard, un correo con `IsHtml: true`, etc.).
 */
import DOMPurify from "dompurify"

/**
 * Elimina cualquier etiqueta/atributo HTML de `value`, dejando solo texto
 * plano. Seguro de llamar en build time (SSR/export estático): sin `window`,
 * hace un fallback a un strip de regex en vez de tronar.
 */
export function stripHtml(value: string): string {
  if (typeof window === "undefined") {
    // Fallback sin DOM (no debería ejecutarse en este proyecto — todos los
    // formularios son "use client" — pero evita romper un build estático).
    return value.replace(/<[^>]*>/g, "")
  }
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}
