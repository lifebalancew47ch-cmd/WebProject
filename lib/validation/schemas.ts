/**
 * Esquemas Zod para los formularios de autenticación y perfil — capa de
 * validación "de compuerta" justo antes de llamar a la API, independiente de
 * los validadores por-campo de lib/validation/rules.ts (esos siguen vivos
 * para dar feedback instantáneo en onBlur; estos corren una sola vez, sobre
 * el estado completo, al hacer submit).
 *
 * Por qué dos capas: los validadores por-campo dependen de que cada
 * onChange/onBlur se haya disparado. Un formulario simulado (fuzzing, o un
 * usuario que pega texto y da submit sin salir del campo) puede saltárselos.
 * El schema.safeParse() de aquí es la última puerta antes de tocar la red —
 * revisa el estado tal cual está en ese instante, sin importar cómo llegó.
 *
 * Los patrones y límites de longitud se reusan de rules.ts (una sola fuente
 * de verdad) para que nunca queden desincronizados entre las dos capas.
 */
import { z } from "zod"
import {
  DANGEROUS_CHARS_PATTERN,
  EMAIL_PATTERN,
  MAX_LENGTHS,
  MIN_PASSWORD_LENGTH,
  NAME_PATTERN,
  PHONE_PATTERN,
  SLUG_PATTERN,
} from "@/lib/validation/rules"

const nameField = (label: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio.`)
    .max(maxLength, `${label} no puede superar los ${maxLength} caracteres.`)
    .regex(NAME_PATTERN, `${label} solo puede contener letras y espacios.`)

const emailField = z
  .string()
  .trim()
  .min(1, "El correo es obligatorio.")
  .max(MAX_LENGTHS.email, `El correo no puede superar los ${MAX_LENGTHS.email} caracteres.`)
  .regex(EMAIL_PATTERN, "Ingresa un correo electrónico válido.")

const usernameField = z
  .string()
  .trim()
  .min(1, "El nombre de usuario es obligatorio.")
  .max(MAX_LENGTHS.username, `El nombre de usuario no puede superar los ${MAX_LENGTHS.username} caracteres.`)
  .regex(SLUG_PATTERN, "El nombre de usuario solo puede contener letras, números, guiones (-) y guion bajo (_).")

const optionalPhoneField = z
  .string()
  .trim()
  .max(MAX_LENGTHS.phoneNumber, `El teléfono no puede superar los ${MAX_LENGTHS.phoneNumber} caracteres.`)
  .regex(PHONE_PATTERN, "El teléfono solo puede contener números, espacios, +, - y paréntesis.")
  .or(z.literal(""))

/**
 * Password: sin restricción de alfabeto (una contraseña fuerte SUELE tener
 * los símbolos que `DANGEROUS_CHARS_PATTERN` bloquearía en texto libre) —
 * solo longitud. El backend es la autoridad sobre reglas de complejidad.
 */
const passwordField = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
  .max(MAX_LENGTHS.password, `La contraseña no puede superar los ${MAX_LENGTHS.password} caracteres.`)

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "La contraseña es obligatoria.").max(MAX_LENGTHS.password),
})
export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    firstName: nameField("El nombre", MAX_LENGTHS.firstName),
    lastName: nameField("El apellido", MAX_LENGTHS.lastName),
    email: emailField,
    username: usernameField,
    phoneNumber: optionalPhoneField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })
export type RegisterFormValues = z.infer<typeof registerSchema>

export const profileUpdateSchema = z.object({
  firstName: nameField("El nombre", MAX_LENGTHS.firstName),
  lastName: nameField("El apellido", MAX_LENGTHS.lastName),
  phoneNumber: optionalPhoneField,
})
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es obligatoria.").max(MAX_LENGTHS.password),
    newPassword: passwordField,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmNewPassword"],
  })
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

/**
 * Texto libre acotado (usado hoy en formularios de Organización/Notificaciones,
 * no en los tres que pidió el profe, pero se deja listo para el mismo patrón):
 * longitud + bloqueo de caracteres de inyección, sin restringir el alfabeto.
 */
export const boundedTextField = (label: string, maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} no puede superar los ${maxLength} caracteres.`)
    .refine((v) => !DANGEROUS_CHARS_PATTERN.test(v), {
      message: `${label} contiene caracteres no permitidos (< > ' " ; / % $ & \` \\).`,
    })

/** Convierte los errores de un safeParse fallido a un mapa { campo: mensaje } listo para <FormField error=.../>. */
export function flattenFieldErrors<T extends Record<string, unknown>>(
  error: z.ZodError<T>
): Partial<Record<keyof T, string>> {
  const result: Partial<Record<keyof T, string>> = {}
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof T | undefined
    if (key && !(key in result)) result[key] = issue.message
  }
  return result
}
