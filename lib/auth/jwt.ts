/**
 * Decodifica el payload de un JWT sin verificar la firma — solo para leer
 * claims públicos en el cliente (tenant_id, organization_id). La firma
 * SIEMPRE la valida cada backend en cada request; esto es únicamente para
 * que la UI sepa qué IDs mandar, nunca para tomar decisiones de seguridad.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".")
    if (!payload) return null
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}
