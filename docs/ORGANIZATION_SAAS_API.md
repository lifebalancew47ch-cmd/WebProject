# LifeBalance - Organization & SaaS Service API

Documentación extraída del OpenAPI del microservicio Multi-Tenant Empresarial de LifeBalance.

- **Base URL:** `https://lifebalance-organization-saas.onrender.com`
- **Spec fuente:** `https://lifebalance-organization-saas.onrender.com/swagger/v1/swagger.json`
- **Swagger UI:** `https://lifebalance-organization-saas.onrender.com/index.html`
- **OpenAPI:** 3.0.1
- **Versión API:** v1
- **Prefijo de rutas:** `/api/v1`
- **Descripción oficial:** "Microservicio Multi-Tenant Empresarial de LifeBalance. Administra entidades jerárquicas (Empresas, Familias, Departamentos, Equipos), suscripciones, límites de planes SaaS (Free/Pro/Business/Enterprise) e invitaciones."

## ✅ Corregido (verificado en vivo el 2026-08-05)

El backend implementó auto-provisioning de tenant: cada usuario ahora recibe una organización
propia al registrarse/iniciar sesión, y el JWT trae los claims `tenant_id` y `organization_id`
(commits `50da224` y `6af929b` en el repo de backend). Probado en vivo:

- `GET /api/v1/organizations` **sin** token → `401` (correcto, ya no es anónimo).
- `GET /api/v1/organizations` **con** token → `200 OK` con datos reales (antes daba `403
  "no valid TenantId context"`).

El frontend (`components/dashboard/OrganizationsPanel.tsx`) ya se actualizó para volver a mandar
el token en todas las llamadas — el `NO_TOKEN` que se documenta en los hallazgos de abajo quedó
obsoleto y ya no se usa. Los hallazgos de 2026-08-01/02 se dejan como referencia histórica de
por qué existía ese workaround.

### 🚨 Bug nuevo encontrado al probar las mutaciones (2026-08-05)

Con el mismo token que ya funciona para `GET`, **todas las mutaciones probadas fallan con `500`**:

```json
// PATCH /api/v1/organizations/{id}/suspend
{"title":"Internal Server Error","status":500,"detail":"An unexpected error occurred. Please contact system support."}

// POST /api/v1/organizations (crear)
{"title":"Internal Server Error","status":500,"detail":"An unexpected error occurred. Please contact system support."}
```

Probablemente relacionado al mismo cambio que agregó el auto-provisioning de tenant — las
mutaciones podrían no estar manejando bien el nuevo contexto de `tenant_id`. Reportar al backend
junto con el `traceId` de la respuesta para que lo puedan rastrear en sus logs.

## ⚠️ Hallazgos importantes antes de integrar (verificado en vivo el 2026-08-01) — histórico, ya resuelto

1. **CORS habilitado correctamente** (`Access-Control-Allow-Origin: *`).
2. **El JWT del Auth & Profile service SÍ es aceptado aquí.** Con un token recién emitido por `POST /api/v1/Auth/login` (servicio Auth & Profile), un `POST /api/v1/organizations` con body vacío devolvió `400` de **validación de campos** (no `401`), es decir, la autenticación pasó correctamente:
   ```json
   {"title":"One or more validation errors occurred.","status":400,
    "errors":{"Name":["The Name field is required."],"TaxId":["The TaxId field is required."],
    "PlanId":["The PlanId field is required."],"Address":["The Address field is required."],
    "ContactInfo":["The ContactInfo field is required."]}}
   ```
   Este es el **único de los tres microservicios adicionales auditados hasta ahora (Notifications, Dashboard, Organization) cuyo JWT del Auth service funciona sin cambios.**
3. **Ojo: la autenticación no parece aplicarse realmente pese a declararse `Bearer` global en el spec.** Se probó el mismo `POST /api/v1/organizations` con body vacío **sin ningún header `Authorization`** y devolvió el **mismo `400` de validación** (no `401`). Igualmente `GET /api/v1/organizations` sin token devuelve `200` con datos reales (lista paginada vacía) en vez de `401`. Es decir, en la práctica estos endpoints probados se comportan como **públicos/anónimos** ahora mismo, aunque el spec declara seguridad global — probablemente un middleware de auth no está aplicado o está en modo permisivo en este entorno. **No hay que asumir que los datos están protegidos**: cualquier cliente puede leer/intentar escribir sin autenticarse. Vale la pena confirmarlo con el equipo backend antes de tratar esta API como protegida en producción.
4. **Enviar el token del Auth service en realidad empeora las cosas para un usuario normal.** Probado en vivo desde la app con un usuario demo logueado: `GET /api/v1/organizations` **con** `Authorization: Bearer <token>` devuelve `400 Bad Request` con `"Authenticated user has no valid TenantId context."`. El JWT del Auth & Profile service no incluye ningún claim de `TenantId` (los usuarios demo no pertenecen a ninguna organización), y este servicio sí exige ese contexto en cuanto detecta un Bearer válido — aunque sin ningún header funciona perfecto (ver punto 3). Por eso el frontend (`components/dashboard/OrganizationsPanel.tsx`) **llama a esta API sin enviar el token** hasta que el Auth service emita un claim de `TenantId`/organización o este servicio deje de exigirlo para peticiones sin ese contexto.

**Re-verificado el 2026-08-02 — el problema del `TenantId` sigue igual, solo cambió el código de estado:**

5. `GET /api/v1/organizations` con token ahora responde `403 Forbidden` en vez de `400` (mismo motivo, solo reclasificaron el status code):
   ```json
   {"title":"Multi-Tenant Access Violation","status":403,
    "detail":"Authenticated user has no valid TenantId context.","instance":"/api/v1/organizations"}
   ```
6. Curiosamente `POST /api/v1/organizations` **con token** sigue respondiendo `400` de validación de campos (no `403`) — o sea, la creación no exige `TenantId`, solo la lectura (`GET`) lo exige. Sigue siendo inconsistente entre endpoints del mismo recurso.
7. Confirmado con datos reales (ya hay 2 organizaciones creadas desde la app) el **shape real de `OrganizationDto`**, más completo de lo que se había inferido:
   ```json
   {
     "id": "6a6d937b1c349b591e3301f8",
     "tenantId": "74d9577ffde74098bbb5ba0ee010dc93",
     "name": "Bridged",
     "taxId": "345678",
     "status": "Active",
     "planId": "free",
     "subscriptionId": "",
     "configurationId": "",
     "contactInfo": { "email": "...", "phone": "...", "contactPerson": "..." },
     "address": { "street": "...", "city": "...", "state": "...", "country": "...", "zipCode": "..." },
     "createdAt": "2026-08-01T06:34:35.087Z",
     "updatedAt": "2026-08-01T06:34:53.04Z"
   }
   ```
   Nótese `tenantId`, `status` (string, no boolean), `subscriptionId` y `configurationId` (vacíos por ahora) — no estaban confirmados antes. `lib/api/organizations-types.ts` debería actualizarse con estos campos.

**Conclusión:** de los cuatro microservicios auditados, este sigue siendo el más "integrable" hoy — de hecho ya está conectado en `/dashboard/Organization` (listar, crear, activar/suspender/restaurar/eliminar organizaciones) — pero sin enviar el JWT en las lecturas, por el punto 4/5. Conviene aclarar con el backend el modelo de multi-tenancy (cómo se asocia un usuario a un `TenantId`) antes de tratar esta pantalla como protegida en producción.

## Autenticación

```
Authorization: Bearer <token>
```
(`apiKey` en header `Authorization`, formato `Bearer {token}` — mismo JWT que Auth & Profile, ver punto 2 y 3 arriba.)

## Endpoints

### Organizations (`/api/v1/organizations`)

| Método | Ruta | Query / Body | Descripción |
|---|---|---|---|
| POST | `/api/v1/organizations` | Body: `CreateOrgRequest` | Crea una organización |
| GET | `/api/v1/organizations` | `pageIndex` (def. 1), `pageSize` (def. 10), `search` | Lista organizaciones (paginado) |
| GET | `/api/v1/organizations/{id}` | — | Obtiene una organización |
| PUT | `/api/v1/organizations/{id}` | Body: `UpdateOrgRequest` | Actualiza una organización |
| DELETE | `/api/v1/organizations/{id}` | — | Elimina una organización |
| PATCH | `/api/v1/organizations/{id}/activate` | — | Activa una organización |
| PATCH | `/api/v1/organizations/{id}/suspend` | — | Suspende una organización |
| PATCH | `/api/v1/organizations/{id}/restore` | — | Restaura una organización suspendida |
| GET | `/api/v1/organizations/{id}/statistics` | — | Estadísticas de la organización |

### Departments (`/api/v1/departments`)

| Método | Ruta | Query / Body | Descripción |
|---|---|---|---|
| POST | `/api/v1/departments` | Body: `CreateDepartmentCommand` | Crea un departamento |
| GET | `/api/v1/departments` | `organizationId`, `pageIndex`, `pageSize` | Lista departamentos |
| GET | `/api/v1/departments/{id}` | — | Obtiene un departamento |
| PUT | `/api/v1/departments/{id}` | Body: `UpdateDeptRequest` | Actualiza un departamento |
| DELETE | `/api/v1/departments/{id}` | — | Elimina un departamento |
| POST | `/api/v1/departments/{id}/members` | Body: `DeptMemberRequest` | Agrega un miembro |
| DELETE | `/api/v1/departments/{id}/members/{userId}` | — | Quita un miembro |

### Teams (`/api/v1/teams`)

| Método | Ruta | Query / Body | Descripción |
|---|---|---|---|
| POST | `/api/v1/teams` | Body: `CreateTeamCommand` | Crea un equipo |
| GET | `/api/v1/teams` | `organizationId`, `pageIndex`, `pageSize` | Lista equipos |
| GET | `/api/v1/teams/{id}` | — | Obtiene un equipo |
| PUT | `/api/v1/teams/{id}` | Body: `UpdateTeamRequest` | Actualiza un equipo |
| DELETE | `/api/v1/teams/{id}` | — | Elimina un equipo |

### Families (`/api/v1/families`)

| Método | Ruta | Query / Body | Descripción |
|---|---|---|---|
| POST | `/api/v1/families` | Body: `CreateFamilyCommand` | Crea una familia |
| GET | `/api/v1/families` | `pageIndex`, `pageSize` | Lista familias |
| GET | `/api/v1/families/{id}` | — | Obtiene una familia |
| PUT | `/api/v1/families/{id}` | Body: `UpdateFamilyRequest` | Actualiza una familia |
| DELETE | `/api/v1/families/{id}` | — | Elimina una familia |
| POST | `/api/v1/families/{id}/members` | Body: `AddMemberRequest` | Agrega un miembro |
| DELETE | `/api/v1/families/{id}/members/{userId}` | — | Quita un miembro |
| PATCH | `/api/v1/families/{id}/administrator` | Body: `TransferAdminRequest` | Transfiere la administración |

### Invitations (`/api/v1/invitations`)

| Método | Ruta | Query / Body | Descripción |
|---|---|---|---|
| POST | `/api/v1/invitations` | Body: `CreateInvitationCommand` | Crea/envía una invitación |
| GET | `/api/v1/invitations` | `pageIndex`, `pageSize` | Lista invitaciones |
| GET | `/api/v1/invitations/{id}` | — | Obtiene una invitación |
| POST | `/api/v1/invitations/{token}/accept` | — | Acepta una invitación (por token) |
| POST | `/api/v1/invitations/{token}/reject` | — | Rechaza una invitación (por token) |
| POST | `/api/v1/invitations/{id}/cancel` | — | Cancela una invitación |
| POST | `/api/v1/invitations/{id}/resend` | — | Reenvía una invitación |

### Licenses (`/api/v1/licenses`)

| Método | Ruta | Query / Body | Descripción |
|---|---|---|---|
| POST | `/api/v1/licenses` | Body: `CreateLicenseCommand` | Crea una licencia |
| GET | `/api/v1/licenses` | `organizationId`, `pageIndex`, `pageSize` | Lista licencias |
| GET | `/api/v1/licenses/{id}` | — | Obtiene una licencia |
| DELETE | `/api/v1/licenses/{id}` | — | Elimina una licencia |
| POST | `/api/v1/licenses/{id}/assign` | Body: `AssignLicenseRequest` | Asigna la licencia a un usuario |
| POST | `/api/v1/licenses/{id}/renew` | Body: `RenewLicenseRequest` | Renueva una licencia |

### Subscriptions (`/api/v1/subscriptions`)

| Método | Ruta | Query / Body | Descripción |
|---|---|---|---|
| POST | `/api/v1/subscriptions` | Body: `CreateSubscriptionCommand` | Crea una suscripción |
| GET | `/api/v1/subscriptions` | `pageIndex`, `pageSize` | Lista suscripciones |
| GET | `/api/v1/subscriptions/{id}` | — | Obtiene una suscripción |
| PATCH | `/api/v1/subscriptions/{id}/renew` | — | Renueva la suscripción |
| PATCH | `/api/v1/subscriptions/{id}/change-plan` | Body: `ChangePlanRequest` | Cambia de plan |

## Modelos (DTOs)

Igual que Notifications API, ningún endpoint documenta el shape de su respuesta `200 OK` en el spec (solo el de error 400 de validación, visto arriba). Los tipos abajo son los **request bodies**, confirmados.

```ts
interface Address {
  street?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  zipCode?: string | null
}

interface ContactInfo {
  email?: string | null
  phone?: string | null
  contactPerson?: string | null
}

interface CreateOrgRequest {
  name: string
  taxId: string
  planId: string
  contactInfo: ContactInfo
  address: Address
}

interface UpdateOrgRequest {
  name?: string | null
  taxId?: string | null
  contactInfo?: ContactInfo
  address?: Address
}

interface CreateDepartmentCommand {
  organizationId?: string | null
  name?: string | null
  description?: string | null
  managerUserId?: string | null
  parentDepartmentId?: string | null
}

interface UpdateDeptRequest {
  name?: string | null
  description?: string | null
  managerUserId?: string | null
  parentDepartmentId?: string | null
}

interface DeptMemberRequest {
  userId?: string | null
}

interface CreateTeamCommand {
  organizationId?: string | null
  name?: string | null
  departmentId?: string | null
  leaderUserId?: string | null
}

interface UpdateTeamRequest {
  name?: string | null
  departmentId?: string | null
  leaderUserId?: string | null
}

interface CreateFamilyCommand {
  name?: string | null
  administratorUserId?: string | null
  maxMembers: number
}

interface UpdateFamilyRequest {
  name?: string | null
}

interface AddMemberRequest {
  userId?: string | null
}

interface TransferAdminRequest {
  newAdminUserId?: string | null
}

interface CreateInvitationCommand {
  targetEmail?: string | null
  organizationId?: string | null
  familyId?: string | null
  role?: string | null
}

interface CreateLicenseCommand {
  organizationId?: string | null
  type?: string | null
  expiresAt: string // date-time
}

interface AssignLicenseRequest {
  userId?: string | null
}

interface RenewLicenseRequest {
  newExpiration: string // date-time
}

interface CreateSubscriptionCommand {
  organizationId?: string | null
  planId?: string | null
  billingCycle?: string | null
}

interface ChangePlanRequest {
  newPlanId?: string | null
}
```

## Notas

- Todos los `GET` de listas son paginados con `pageIndex`/`pageSize` (nombres distintos a `page`/`pageSize` del Auth service — cuidado al reutilizar componentes de paginación entre ambas APIs).
- Para refrescar el spec: `curl https://lifebalance-organization-saas.onrender.com/swagger/v1/swagger.json -o swagger.json`.
