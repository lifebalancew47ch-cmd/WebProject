# LifeBalance - Auth & Profile Service API

Documentación extraída del Swagger/OpenAPI del microservicio de Autenticación, Autorización y Perfiles de LifeBalance.

- **Base URL (producción):** `https://lifebalance-auth-service.onrender.com`
- **Spec fuente:** `https://lifebalance-auth-service.onrender.com/swagger/v1/swagger.json`
- **Swagger UI:** `https://lifebalance-auth-service.onrender.com/swagger/index.html`
- **OpenAPI:** 3.0.1
- **Versión API:** v1
- **Prefijo de rutas:** `/api/v1`

> Este documento se generó leyendo el spec OpenAPI publicado por el servicio. Cópialo/actualízalo si el backend cambia (re-descargar con `curl https://lifebalance-auth-service.onrender.com/swagger/v1/swagger.json`).

> **Nota (2026-08-01):** el frontend apuntaba originalmente a `https://auth-profile.onrender.com`. Se corrigió al hostname correcto, `https://lifebalance-auth-service.onrender.com`. Verificado en vivo que ambos hostnames sirven **el mismo backend y la misma base de datos** (spec OpenAPI idéntico, y los usuarios demo creados en uno funcionan para login en el otro) — probablemente `auth-profile.onrender.com` es un alias/dominio antiguo del mismo servicio Render. Aun así, se usa el hostname que indicó el equipo como el correcto.

## ⚠️ Bug bloqueante abierto (reportado 2026-08-01, re-confirmado 2026-08-02): login falla con `500` si el usuario tiene un rol asignado

En cuanto un usuario tiene *cualquier* valor en `roleIds` (colección `users`, base Mongo `LifeBalance_Auth`), `POST /api/v1/Auth/login` responde `500 Internal Server Error` en vez de emitir el token. Con `roleIds: []` el mismo usuario loguea sin problema. Probado y reproducido con dos usuarios distintos (uno viejo, uno recién creado) y dos roles distintos (`Admin`, `SuperAdmin`) en dos fechas distintas — sigue sin corregirse. Ver el reporte completo (pasos para reproducir, hipótesis de causa) enviado al equipo backend el 2026-08-01.

**Impacto en cadena:** mientras este bug siga abierto, es imposible tener una cuenta admin funcional, lo cual bloquea a su vez poder probar cualquier feature que dependa de roles — incluyendo el nuevo `403 Forbidden` que apareció en Dashboard Service el 2026-08-02 (ver `docs/DASHBOARD_SERVICE_API.md`), que probablemente exige un rol que ningún usuario puede tener mientras este bug exista.

## Autenticación

El servicio usa **JWT Bearer** para casi todos los endpoints (excepto registro, login y flujos de recuperación de contraseña, que son públicos).

```
Authorization: Bearer <accessToken>
```

El `accessToken` se obtiene de `POST /api/v1/Auth/login` y se renueva con `POST /api/v1/Auth/refresh-token` usando el `refreshToken`.

## Formato de respuesta estándar

Casi todos los endpoints devuelven un **ApiResponse envelope** con esta forma genérica (`{Tipo}ApiResponse`):

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: string[] | null;
}
```

Ejemplo real (`LoginResponseApiResponse`):

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresAt": "2026-08-01T12:00:00Z",
    "userProfile": { "...": "UserProfileDto" }
  },
  "errors": null
}
```

Las respuestas paginadas (`{Tipo}PagedResultApiResponse`) envuelven un `PagedResult`:

```ts
interface PagedResult<T> {
  items: T[] | null;
  page: number;
  pageSize: number;
  totalCount: number;   // int64
  totalPages: number;   // readOnly
  hasPrevious: boolean; // readOnly
  hasNext: boolean;     // readOnly
}
```

---

## Endpoints

### Auth (`/api/v1/Auth`) — públicos

| Método | Ruta | Descripción | Body | Respuesta `data` |
|---|---|---|---|---|
| POST | `/api/v1/Auth/register` | Crea una cuenta nueva | `RegisterRequest` | `RegisterResponse` |
| POST | `/api/v1/Auth/login` | Autentica y devuelve tokens JWT | `LoginRequest` | `LoginResponse` |
| POST | `/api/v1/Auth/logout` | Revoca el refresh token | `LogoutRequest` | `boolean` |
| POST | `/api/v1/Auth/refresh-token` | Genera un nuevo access token | `RefreshTokenRequest` | `RefreshTokenResponse` |
| POST | `/api/v1/Auth/revoke-token` | Revoca un refresh token específico | `TokenRevocationRequest` | `boolean` |
| POST | `/api/v1/Auth/forgot-password` | Envía email de recuperación (si la cuenta existe) | `ForgotPasswordRequest` | `boolean` |
| POST | `/api/v1/Auth/reset-password` | Resetea password con token del email | `ResetPasswordRequest` | `boolean` |
| POST | `/api/v1/Auth/send-confirmation` | Envía email de confirmación de cuenta | `SendConfirmationRequest` | `boolean` |
| POST | `/api/v1/Auth/confirm-email` | Confirma email con token del email | `ConfirmEmailRequest` | `boolean` |

`Login` responde `401` si las credenciales son inválidas. `Register` y `ConfirmEmail`/`ResetPassword` responden `400` en validaciones fallidas (mismo envelope, `success: false`).

### Profile (`/api/v1/Profile`) — requieren Bearer token

| Método | Ruta | Descripción | Body | Respuesta `data` |
|---|---|---|---|---|
| GET | `/api/v1/Profile/me` | Perfil del usuario autenticado | — | `UserProfileDto` |
| PUT | `/api/v1/Profile/me` | Actualiza el perfil del usuario autenticado | `UpdateProfileRequest` | `UserProfileDto` |
| GET | `/api/v1/Profile/preferences` | Preferencias del usuario autenticado | — | `UserPreferenceDto` |
| PUT | `/api/v1/Profile/preferences` | Actualiza preferencias del usuario | `UpdatePreferenceRequest` | `UserPreferenceDto` |
| PUT | `/api/v1/Profile/change-password` | Cambia la contraseña del usuario autenticado | `ChangePasswordRequest` | `boolean` |

### Roles (`/api/v1/Roles`) — requieren rol Admin

| Método | Ruta | Descripción | Body | Respuesta `data` |
|---|---|---|---|---|
| GET | `/api/v1/Roles` | Lista todos los roles | — | `RoleDto[]` |
| POST | `/api/v1/Roles` | Crea un rol (`201 Created`) | `CreateRoleRequest` | `RoleDto` |
| PUT | `/api/v1/Roles/{id}` | Actualiza un rol | `UpdateRoleRequest` | `RoleDto` |
| DELETE | `/api/v1/Roles/{id}` | Elimina un rol | — | `boolean` |

### Permissions (`/api/v1/Permissions`) — requieren rol Admin

| Método | Ruta | Descripción | Body | Respuesta `data` |
|---|---|---|---|---|
| GET | `/api/v1/Permissions` | Lista todos los permisos | — | `PermissionDto[]` |
| POST | `/api/v1/Permissions` | Crea un permiso (`201 Created`) | `CreatePermissionRequest` | `PermissionDto` |
| PUT | `/api/v1/Permissions/{id}` | Actualiza un permiso | `UpdatePermissionRequest` | `PermissionDto` |
| DELETE | `/api/v1/Permissions/{id}` | Elimina un permiso | — | `boolean` |

### Audit (`/api/v1/Audit`) — requieren rol Admin

| Método | Ruta | Query params | Descripción | Respuesta `data` |
|---|---|---|---|---|
| GET | `/api/v1/Audit/login-history` | `page` (default 1), `pageSize` (default 20) | Historial de logins paginado | `PagedResult<LoginHistoryDto>` |
| GET | `/api/v1/Audit/security-events` | `page` (default 1), `pageSize` (default 20) | Eventos de seguridad paginados | `PagedResult<AuditLogDto>` |

---

## Modelos (DTOs / Requests)

```ts
interface RegisterRequest {
  email: string | null;
  username: string | null;
  password: string | null;
  confirmPassword: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
}

interface RegisterResponse {
  userId: string | null;
  email: string | null;
  username: string | null;
  requiresEmailConfirmation: boolean;
}

interface LoginRequest {
  email: string | null;
  password: string | null;
  ipAddress: string | null;
}

interface LoginResponse {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string; // date-time
  userProfile: UserProfileDto;
}

interface LogoutRequest {
  refreshToken: string | null;
}

interface RefreshTokenRequest {
  accessToken: string | null;
  refreshToken: string | null;
}

interface RefreshTokenResponse {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string; // date-time
}

interface TokenRevocationRequest {
  refreshToken: string | null;
}

interface ForgotPasswordRequest {
  email: string | null;
}

interface ResetPasswordRequest {
  email: string | null;
  token: string | null;
  newPassword: string | null;
  confirmPassword: string | null;
}

interface SendConfirmationRequest {
  email: string | null;
}

interface ConfirmEmailRequest {
  email: string | null;
  token: string | null;
}

interface ChangePasswordRequest {
  currentPassword: string | null;
  newPassword: string | null;
  confirmNewPassword: string | null;
}

interface UpdateProfileRequest {
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
}

interface UserProfileDto {
  id: string | null;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isEmailConfirmed: boolean;
  isActive: boolean;
  createdAt: string; // date-time
  lastLoginAt: string | null; // date-time
}

interface UpdatePreferenceRequest {
  theme: string | null;
  language: string | null;
  timezone: string | null;
  unitsSystem: string | null;
  notificationsEnabled: boolean | null;
  emailNotificationsEnabled: boolean | null;
  pushNotificationsEnabled: boolean | null;
  profileVisibility: string | null;
  marketingConsent: boolean | null;
  activitySharing: boolean | null;
}

interface UserPreferenceDto {
  theme: string | null;
  language: string | null;
  timezone: string | null;
  unitsSystem: string | null;
  notificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  profileVisibility: string | null;
  marketingConsent: boolean;
  activitySharing: boolean;
}

interface CreateRoleRequest {
  name: string | null;
  description: string | null;
  permissionIds: string[] | null;
}

interface UpdateRoleRequest {
  name: string | null;
  description: string | null;
  permissionIds: string[] | null;
}

interface RoleDto {
  id: string | null;
  name: string | null;
  description: string | null;
  permissionIds: string[] | null;
  createdAt: string; // date-time
}

interface CreatePermissionRequest {
  name: string | null;
  description: string | null;
  module: string | null;
}

interface UpdatePermissionRequest {
  name: string | null;
  description: string | null;
  module: string | null;
}

interface PermissionDto {
  id: string | null;
  name: string | null;
  description: string | null;
  module: string | null;
  createdAt: string; // date-time
}

interface LoginHistoryDto {
  id: string | null;
  email: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  device: string | null;
  success: boolean;
  failureReason: string | null;
  loginAt: string; // date-time
}

interface AuditLogDto {
  id: string | null;
  userId: string | null;
  action: string | null;
  details: string | null;
  ipAddress: string | null;
  resourceType: string | null;
  success: boolean;
  errorMessage: string | null;
  createdAt: string; // date-time
}
```

---

## Consumo desde el frontend (Next.js / TypeScript)

Ya implementado en este repo, no es solo una sugerencia:

- `lib/api/client.ts` — `jsonFetch`/`apiFetch`, maneja el envelope `ApiResponse<T>` y errores (`ApiError`).
- `lib/api/types.ts` — DTOs de este documento.
- `lib/api/auth.ts` — `login`, `register`, `logout`, `refreshToken`, `forgotPassword`, `resetPassword`, `sendConfirmation`, `confirmEmail`.
- `lib/api/profile.ts` — `getMyProfile`, `updateMyProfile`, `getMyPreferences`, `updateMyPreferences`, `changeMyPassword`.
- `lib/auth/AuthContext.tsx` + `lib/auth/session.ts` — estado de sesión (`useAuth()`), persistido en `localStorage`.
- `components/auth/*` — `AuthShell`, `FormField`, `PasswordField`, `SubmitButton`, `AlertMessage`, `AuthGuard`, `GuestOnly`.
- Páginas: `app/login`, `app/register`, `app/forgot-password`, `app/reset-password`, `app/confirm-email`.

Variable de entorno opcional (`.env.local`) para apuntar a otro entorno:

```
NEXT_PUBLIC_AUTH_API_URL=https://lifebalance-auth-service.onrender.com
```

---

## Notas

- El servicio corre en Render (free tier probablemente) — la primera petición tras inactividad puede tardar (cold start).
- Todos los `id` son `string` (probablemente GUID/UUID) según el spec, no `number`.
- Los endpoints de `Roles`, `Permissions` y `Audit` requieren rol **Admin**; `Profile` requiere solo estar autenticado.
- Para refrescar el spec más adelante: `curl https://lifebalance-auth-service.onrender.com/swagger/v1/swagger.json -o swagger.json`.
