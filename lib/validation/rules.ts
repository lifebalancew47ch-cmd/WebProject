// Validación y sanitización client-side compartida por todos los formularios.
//
// Importante: esto es la primera línea de defensa (UX + evitar payloads
// obviamente maliciosos), no un reemplazo de la validación server-side.
// Este proyecto es un sitio estático sin backend propio — los 6
// microservicios que consume (Auth, Notifications, Dashboard, Organization,
// Reporting, Administration) son responsabilidad del equipo backend, y ahí
// es donde debe vivir la validación autoritativa (constraints de DB,
// parametrización de queries, etc.). Un atacante siempre puede saltarse el
// cliente y pegarle directo a la API.

export const MAX_LENGTHS = {
  firstName: 50,
  lastName: 50,
  username: 30,
  email: 100,
  phoneNumber: 20,
  password: 128,
  organizationName: 100,
  taxId: 30,
  planId: 30,
  contactPerson: 100,
  street: 150,
  city: 60,
  state: 60,
  country: 60,
  zipCode: 15,
  notificationTitle: 100,
  notificationBody: 500,
  reportMetrics: 200,
  resetToken: 500,
  search: 100,
} as const

// Letras (incluye acentos/ñ), espacios — sin números ni símbolos.
const NAME_PATTERN = /^[\p{L} ]*$/u

// Usernames / slugs / IDs: letras, números, guion y guion bajo. Sin espacios.
const SLUG_PATTERN = /^[a-zA-Z0-9_-]*$/

// Teléfono: números, espacios, +, -, paréntesis.
const PHONE_PATTERN = /^[0-9+\- ()]*$/

const EMAIL_PATTERN = /^[^\s@<>'"]+@[^\s@<>'"]+\.[^\s@<>'"]+$/

// Caracteres que no deberían aparecer en texto libre (XSS / inyección).
const DANGEROUS_CHARS_PATTERN = /[<>'";/%$&]/

export function sanitizeText(value: string): string {
  return value.trim()
}

/** Filtra en tiempo real los caracteres no permitidos en un username/slug. */
export function stripInvalidSlugChars(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "")
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} es obligatorio.`
  return null
}

export function validateName(value: string, label: string, maxLength: number = MAX_LENGTHS.firstName): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > maxLength) return `${label} no puede superar los ${maxLength} caracteres.`
  if (!NAME_PATTERN.test(trimmed)) return `${label} solo puede contener letras y espacios.`
  return null
}

export function validateUsername(value: string, maxLength: number = MAX_LENGTHS.username): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > maxLength) return `El nombre de usuario no puede superar los ${maxLength} caracteres.`
  if (!SLUG_PATTERN.test(trimmed)) {
    return "El nombre de usuario solo puede contener letras, números, guiones (-) y guion bajo (_)."
  }
  return null
}

export function validateEmail(value: string, maxLength: number = MAX_LENGTHS.email): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > maxLength) return `El correo no puede superar los ${maxLength} caracteres.`
  if (!EMAIL_PATTERN.test(trimmed)) return "Ingresa un correo electrónico válido."
  return null
}

export function validatePhone(value: string, maxLength: number = MAX_LENGTHS.phoneNumber): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > maxLength) return `El teléfono no puede superar los ${maxLength} caracteres.`
  if (!PHONE_PATTERN.test(trimmed)) return "El teléfono solo puede contener números, espacios, +, - y paréntesis."
  return null
}

/**
 * Texto libre acotado (mensajes, descripciones, direcciones, IDs de plan):
 * solo revisa longitud y bloquea caracteres de inyección/XSS, sin restringir
 * el alfabeto — a diferencia de `validateName`/`validateUsername`.
 */
export function validateBoundedText(value: string, label: string, maxLength: number): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > maxLength) return `${label} no puede superar los ${maxLength} caracteres.`
  if (DANGEROUS_CHARS_PATTERN.test(trimmed)) {
    return `${label} contiene caracteres no permitidos (< > ' " ; / % $ &).`
  }
  return null
}
