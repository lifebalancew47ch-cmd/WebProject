# LifeBalance - Notifications & Alerts Service API

Documentación extraída del OpenAPI del microservicio de Notificaciones de LifeBalance.

- **Base URL:** `https://lifebalance-notifications-api.onrender.com`
- **Spec fuente:** `https://lifebalance-notifications-api.onrender.com/swagger/v1/swagger.json`
- **Swagger UI:** `https://lifebalance-notifications-api.onrender.com/index.html`
- **OpenAPI:** 3.0.1
- **Versión API:** v1
- **Prefijo de rutas:** `/api/v1`
- **Descripción oficial:** "Microservicio de Notificaciones de LifeBalance. Gestiona el despacho centralizado de correos electrónicos, notificaciones push y alertas del sistema, incluyendo expiración de licencias y recordatorios personalizados."

## ✅ Estado actual (re-verificado en vivo el 2026-08-02): arreglada y conectada

Los dos bloqueos originales (detectados el 2026-07-31) ya fueron corregidos por el equipo backend:

1. ~~Sin CORS configurado~~ → **Arreglado.** `OPTIONS` ahora responde `204 No Content` con `Access-Control-Allow-Origin` correcto para `http://localhost:3000`. Un navegador ya puede llamar a esta API directamente.
2. ~~JWT con clave de firma distinta~~ → **Arreglado.** Un `accessToken` emitido por `POST /api/v1/Auth/login` del Auth & Profile service ahora es aceptado aquí (`200 OK`).
3. Probado end-to-end el 2026-08-02: `POST /api/v1/notifications` creó una notificación real y `GET /api/v1/templates` devolvió el envelope `{success, message, data}` esperado. **Esta API ya está conectada en el frontend** (`lib/api/notifications.ts`, `components/dashboard/NotificationsPanel.tsx`).

Histórico (por si vuelve a fallar): el problema original era CORS deshabilitado (`405` sin cabeceras) y un emisor/clave de JWT distinto al de Auth & Profile (`"signature key was not found"`).

## ⚠️ Bug nuevo encontrado (2026-08-02): `success: false` en operaciones que sí funcionan

`PATCH /api/v1/notifications/{id}/read`, `.../favorite` y `.../archive` devuelven `200 OK` con `{"success": false, "message": "Notification marked as read", "data": null}` — el flag `success` está invertido/mal puesto, pese a que el mensaje describe un éxito. Confirmado comparando el estado del recurso antes/después (`GET /api/v1/notifications?userId=...`): **la operación sí se aplica correctamente** (`isRead`, `isArchived`, `isFavorite` cambian como se espera) — es únicamente el envelope de la respuesta el que está mal.

El frontend ya lo compensa (`lib/api/client.ts`, parámetro `trustHttpStatus`, usado en `markNotificationRead`, `markAllNotificationsRead`, `archiveNotification`, `favoriteNotification`, `cancelNotification`, `deleteNotification` dentro de `lib/api/notifications.ts`) — confía en el status HTTP en vez del flag `success` para estos endpoints específicos. Vale la pena que el backend corrija el flag de todas formas, ya que cualquier otro consumidor de esta API que siga el contrato `ApiResponse` al pie de la letra fallará igual que nos pasó a nosotros.

## Autenticación

```
Authorization: Bearer <token>
```
(`http`, `bearer`, `bearerFormat: JWT` — igual forma que Auth & Profile, pero **firmado con otra clave**, ver advertencia arriba.)

## Endpoints

### Notifications (`/api/v1/notifications`)

| Método | Ruta | Query / Body | Descripción |
|---|---|---|---|
| POST | `/api/v1/notifications` | Body: `SendNotificationDto` | Envía una notificación a un usuario |
| GET | `/api/v1/notifications` | Query: `userId`, `organizationId`, `familyId`, `departmentId` | Lista notificaciones filtradas |
| POST | `/api/v1/notifications/bulk` | Body: `SendNotificationDto[]` | Envía notificaciones en lote |
| POST | `/api/v1/notifications/schedule` | Body: `ScheduleNotificationDto` | Programa una notificación futura |
| GET | `/api/v1/notifications/{id}` | — | Obtiene una notificación por id |
| DELETE | `/api/v1/notifications/{id}` | — | Elimina una notificación |
| PATCH | `/api/v1/notifications/{id}/cancel` | — | Cancela una notificación programada |
| PATCH | `/api/v1/notifications/{id}/read` | — | Marca una notificación como leída |
| PATCH | `/api/v1/notifications/read-all` | Query: `userId` | Marca todas como leídas |
| PATCH | `/api/v1/notifications/{id}/archive` | — | Archiva una notificación |
| PATCH | `/api/v1/notifications/{id}/favorite` | — | Marca/desmarca como favorita |
| GET | `/api/v1/notifications/user/{userId}` | Query: `limit` (default 10) | Últimas notificaciones de un usuario |

### Alerts (`/api/v1/alerts`)

| Método | Ruta | Query / Body | Descripción |
|---|---|---|---|
| POST | `/api/v1/alerts` | Body: `CreateAlertDto` | Crea una alerta del sistema |
| GET | `/api/v1/alerts` | Query: `userId` | Lista alertas |
| GET | `/api/v1/alerts/{id}` | — | Obtiene una alerta por id |
| PATCH | `/api/v1/alerts/{id}/read` | — | Marca alerta como leída |
| PATCH | `/api/v1/alerts/{id}/dismiss` | — | Descarta una alerta |

### Emails (`/api/v1/emails`)

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| POST | `/api/v1/emails/send` | `SendEmailDto` | Envía un correo directo |
| POST | `/api/v1/emails/template` | `EmailTemplateDto` | Envía un correo usando una plantilla |
| POST | `/api/v1/emails/bulk` | `BulkEmailDto` | Envía un correo a múltiples destinatarios |

### Push (`/api/v1/push`)

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| POST | `/api/v1/push/send` | `SendPushDto` | Envía push a un usuario/dispositivos específicos |
| POST | `/api/v1/push/broadcast` | `BroadcastPushDto` | Broadcast general (por `userIds`, org, familia o depto) |
| POST | `/api/v1/push/wear` | `SendPushDto` | Envía push a dispositivo Wear OS |
| POST | `/api/v1/push/company` | `BroadcastPushDto` | Broadcast a nivel organización |
| POST | `/api/v1/push/family` | `BroadcastPushDto` | Broadcast a nivel familia |
| POST | `/api/v1/push/department` | `BroadcastPushDto` | Broadcast a nivel departamento |

### Devices (`/api/v1/devices`)

| Método | Ruta | Query / Body | Descripción |
|---|---|---|---|
| POST | `/api/v1/devices/register` | Body: `DeviceRegistrationDto` | Registra un dispositivo para push |
| DELETE | `/api/v1/devices/unregister` | Query: `userId`, `deviceToken` | Da de baja un dispositivo |

### Preferences (`/api/v1/preferences`)

| Método | Ruta | Query / Body | Descripción |
|---|---|---|---|
| GET | `/api/v1/preferences` | Query: `userId` | Obtiene preferencias de notificación |
| PUT | `/api/v1/preferences` | Query: `userId`, Body: `UpdatePreferenceDto` | Actualiza preferencias |
| PATCH | `/api/v1/preferences/push` | Query: `userId`, `enabled` | Activa/desactiva push |
| PATCH | `/api/v1/preferences/email` | Query: `userId`, `enabled` | Activa/desactiva email |
| PATCH | `/api/v1/preferences/wear` | Query: `userId`, `enabled` | Activa/desactiva Wear OS |

### Templates (`/api/v1/templates`)

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| POST | `/api/v1/templates` | `CreateTemplateDto` | Crea una plantilla |
| GET | `/api/v1/templates` | — | Lista plantillas |
| GET | `/api/v1/templates/{id}` | — | Obtiene una plantilla |
| PUT | `/api/v1/templates/{id}` | `CreateTemplateDto` | Actualiza una plantilla |
| DELETE | `/api/v1/templates/{id}` | — | Elimina una plantilla |

### History (`/api/v1/history`) — solo lectura

| Método | Ruta | Query / Path | Descripción |
|---|---|---|---|
| GET | `/api/v1/history` | `page` (def. 1), `pageSize` (def. 20) | Historial general paginado |
| GET | `/api/v1/history/user/{userId}` | — | Historial de un usuario |
| GET | `/api/v1/history/organization/{organizationId}` | — | Historial de una organización |

### Metrics (`/api/v1/metrics`) — solo lectura, probablemente admin

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/metrics` | Métricas generales |
| GET | `/api/v1/metrics/delivery` | Métricas de entrega |
| GET | `/api/v1/metrics/channels` | Métricas por canal |
| GET | `/api/v1/metrics/errors` | Métricas de errores |

## Modelos (DTOs)

```ts
// Los enums no traen nombres en el spec (solo enteros); el backend no respondió
// con detalle de validación porque todas las pruebas dieron 401 antes de llegar
// a esa lógica. Los valores exactos hay que confirmarlos con el equipo backend.

type AlertPriority = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 // sin nombres confirmados
type NotificationType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 // sin nombres confirmados
type NotificationChannel = 0 | 1 | 2 | 3 // sin nombres confirmados (probablemente Push/Email/SMS/InApp)
type DevicePlatform = 0 | 1 | 2 // sin nombres confirmados (probablemente iOS/Android/Web o similar)

interface SendNotificationDto {
  userId: string
  title: string
  body: string
  payload?: string | null
  type: NotificationType
  channel: NotificationChannel
}

interface ScheduleNotificationDto {
  userId: string
  title: string
  body: string
  payload?: string | null
  type: NotificationType
  channel: NotificationChannel
  scheduledFor: string // date-time ISO
}

interface CreateAlertDto {
  userId: string
  title: string
  body: string
  source: string
  priority: AlertPriority
}

interface SendEmailDto {
  to: string
  subject: string
  body: string
  isHtml?: boolean
  templateId?: string | null
  templateVariables?: Record<string, string> | null
}

interface BulkEmailDto {
  to: string[]
  subject: string
  body: string
  isHtml?: boolean
}

interface EmailTemplateDto {
  to: string[]
  templateId: string
  variables?: Record<string, string> | null
}

interface SendPushDto {
  userId: string
  title: string
  body: string
  payload?: string | null
  deviceTokens?: string[] | null
  platform: DevicePlatform
}

interface BroadcastPushDto {
  title: string
  body: string
  payload?: string | null
  userIds?: string[] | null
  organizationId?: string | null
  familyId?: string | null
  departmentId?: string | null
  platform: DevicePlatform
}

interface DeviceRegistrationDto {
  userId: string
  deviceToken: string
  platform: DevicePlatform
}

interface UpdatePreferenceDto {
  receivePush?: boolean | null
  receiveEmail?: boolean | null
  receiveSms?: boolean | null
  receiveWearOS?: boolean | null
  receiveCriticalAlerts?: boolean | null
  receiveReminders?: boolean | null
  receiveGoals?: boolean | null
  receiveGamification?: boolean | null
  receiveOrganizational?: boolean | null
  allowedStartTime?: string | null
  allowedEndTime?: string | null
  quietModeEnabled?: boolean | null
  quietModeStart?: string | null
  quietModeEnd?: string | null
  frequency?: string | null
  language?: string | null
  timezone?: string | null
}

interface CreateTemplateDto {
  name: string
  subject: string
  bodyContent: string
  htmlContent?: string | null
  type: NotificationType
  channel: NotificationChannel
  variables?: string[] | null
  isGlobal?: boolean
}
```

## Notas

- Ningún endpoint documenta su `schema` de respuesta en el spec (solo `"description": "OK"` sin `content`), pero confirmado en vivo que usa el mismo envelope `{ success, message, data }` que Auth & Profile — `jsonFetch` ya lo desenvuelve automáticamente.
- Shape real confirmado de una notificación creada (`POST /api/v1/notifications`):
  ```json
  {
    "id": "...", "userId": "...", "organizationId": null, "familyId": null, "departmentId": null,
    "title": "...", "body": "...", "payload": null, "type": 0, "channel": 0,
    "status": 1, "isRead": false, "isArchived": false, "isFavorite": false,
    "createdAt": "...", "sentAt": "...", "readAt": null,
    "deliveryTimeMs": null, "attempts": 1, "errorMessage": null, "provider": null
  }
  ```
  (`type: 0`, `channel: 0`, `status: 1` — los enums siguen sin nombres confirmados, pero al menos ya sabemos que `0`/`0` es un valor aceptado por el backend.)
- Para refrescar el spec: `curl https://lifebalance-notifications-api.onrender.com/swagger/v1/swagger.json -o swagger.json`.
