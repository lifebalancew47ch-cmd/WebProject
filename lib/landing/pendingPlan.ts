const STORAGE_KEY = "lifebalance.pendingPlanId"

/**
 * Cuando alguien sin sesión elige un plan en la landing, se manda a
 * registrarse (o a iniciar sesión, si ya tiene cuenta) — pero no hay a quién
 * asociar el plan todavía. Se guarda aquí el `planId` elegido y se resuelve
 * en cuanto detecta sesión iniciada (ver PendingPlanResolver), sin depender
 * de que el `planId` sobreviva en la URL a través del flujo de auth.
 */
export function setPendingPlanId(planId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, planId)
  } catch {
    // localStorage puede fallar en modo incógnito/privado — no es crítico,
    // simplemente no se recordará el plan elegido.
  }
}

export function getPendingPlanId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function clearPendingPlanId() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
}
