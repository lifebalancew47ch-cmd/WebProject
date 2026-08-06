# LifeBalance - Dashboard Service API

Documentación extraída del OpenAPI del microservicio Dashboard (API Aggregator) de LifeBalance.

- **Base URL:** `https://lifebalance-dashboard-service.onrender.com`
- **Spec fuente:** `https://lifebalance-dashboard-service.onrender.com/swagger/v1/swagger.json`
- **Swagger UI:** `https://lifebalance-dashboard-service.onrender.com/index.html#/`
- **OpenAPI:** 3.0.1
- **Versión API:** v1
- **Prefijo de rutas:** `/api/v1`
- **Descripción oficial:** "Microservicio API Aggregator para la plataforma LifeBalance. Se encarga de orquestar y recopilar métricas, KPIs de salud y datos de gamificación provenientes de otros microservicios para presentarlos en los Dashboards (Individual, Familiar y Empresarial)."

Es un **agregador**: no es dueño de los datos, los junta de otros microservicios (Auth, Medical Data, Sedentary Engine, Gamification, Notifications, ML Prediction, Organization, Reporting) — ver `/api/v1/dashboard/health` más abajo.

## ⚠️ Hallazgos importantes antes de integrar

**Verificado el 2026-08-01:**

1. **CORS habilitado correctamente** (`Access-Control-Allow-Origin: *`) — sí se puede llamar desde el navegador, a diferencia de Notifications API (en ese entonces).
2. **El JWT del Auth & Profile service NO era aceptado aquí**: `401 Unauthorized`, `WWW-Authenticate: Bearer error="invalid_token", error_description="The audience '(null)' is invalid"`. La firma era válida (no era un emisor distinto), el problema era la validación de `audience` mal configurada del lado del backend.
3. `/api/v1/dashboard/health` **no requiere auth** y es útil como panel de estado — devuelve la salud reportada de cada microservicio dependiente (ver ejemplo abajo).

**Re-verificado el 2026-08-02 — parcialmente arreglado:**

4. El bug de `audience` **ya se corrigió**: el JWT del Auth service ahora pasa la validación (ya no da `401`).
5. Pero **apareció un `403 Forbidden` nuevo** en absolutamente todos los endpoints autenticados probados (`/individual`, `/individual/summary`, `/summary` general), con body vacío (sin detalle del motivo). Descartado que sea por email sin confirmar (probé con un usuario cuyo `isEmailConfirmed` se marcó `true` directamente en la base y el `403` persiste igual).
6. Hipótesis más probable: este servicio ahora exige un **rol o permiso específico** en el token que ningún usuario de prueba tiene, porque el servicio Auth & Profile tiene un bug bloqueante aparte que impide loguearse con cualquier rol asignado (`POST /api/v1/Auth/login` da `500` en cuanto el usuario tiene un rol — ver reporte de bug de Auth & Profile). No se puede confirmar esta hipótesis hasta que ese bug se resuelva y podamos loguear con una cuenta que sí tenga rol.

**Conclusión:** sigue sin poder integrarse de forma funcional. El health check funciona; todo lo demás da `403` para cualquier usuario que exista hoy en la base (ninguno tiene rol). Es un bloqueo en cadena: primero hay que arreglar el bug de login+rol en Auth & Profile.

## Autenticación

```
Authorization: Bearer <token>
```
(`http`, `bearer`, `bearerFormat: JWT` — ver advertencia de `audience` arriba.)

## Endpoints

### General (`/api/v1/dashboard`) — sin parámetros de identidad

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/v1/dashboard/summary` | Bearer | Resumen general |
| GET | `/api/v1/dashboard/indicators` | Bearer | Indicadores generales |
| GET | `/api/v1/dashboard/kpis` | Bearer | KPIs generales |
| GET | `/api/v1/dashboard/system` | Bearer | Estado del sistema |
| GET | `/api/v1/dashboard/health` | **Público** | Salud del sistema y de los microservicios dependientes |
| GET | `/api/v1/dashboard/version` | Bearer | Versión del servicio |

Ejemplo real de `GET /api/v1/dashboard/health` (sin token, 2026-08-01):
```json
{
  "success": true,
  "message": "Request processed successfully.",
  "data": {
    "overallStatus": "Healthy",
    "componentHealth": {
      "AuthService": "Healthy",
      "MedicalDataService": "Healthy",
      "SedentaryEngineService": "Healthy",
      "GamificationService": "Healthy",
      "NotificationService": "Healthy",
      "MlPredictionService": "Healthy",
      "OrganizationService": "Healthy",
      "ReportingService": "Healthy",
      "MongoDB": "Healthy"
    }
  },
  "statusCode": 200,
  "traceId": "...",
  "timestamp": "2026-08-01T05:12:22.9055208Z"
}
```
Esto confirma la existencia de más microservicios en la plataforma (MedicalData, SedentaryEngine, Gamification, MlPrediction, Reporting) además de los ya documentados (Auth, Notifications, Organization).

### Individual Dashboard (`/api/v1/dashboard/individual`) — requiere `userId`

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/api/v1/dashboard/individual` | `userId` | Dashboard individual completo (único endpoint con schema de respuesta documentado, ver abajo) |
| GET | `/api/v1/dashboard/individual/summary` | `userId` | Resumen |
| GET | `/api/v1/dashboard/individual/kpis` | `userId` | KPIs individuales |
| GET | `/api/v1/dashboard/individual/statistics` | `userId` | Estadísticas |
| GET | `/api/v1/dashboard/individual/heatmap` | `userId` | Mapa de calor de actividad |
| GET | `/api/v1/dashboard/individual/goals` | `userId` | Metas |
| GET | `/api/v1/dashboard/individual/progress` | `userId` | Progreso |
| GET | `/api/v1/dashboard/individual/activity` | `userId` | Actividad (sedentarismo) |
| GET | `/api/v1/dashboard/individual/recommendations` | `userId` | Recomendaciones |
| GET | `/api/v1/dashboard/individual/rewards` | `userId` | Recompensas/gamificación |
| GET | `/api/v1/dashboard/individual/notifications` | `userId` | Notificaciones recientes |
| GET | `/api/v1/dashboard/individual/biometrics` | `userId` | Datos médicos/biométricos |

### Family Dashboard (`/api/v1/dashboard/family`) — requiere `familyId`

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/api/v1/dashboard/family` | `familyId` | Dashboard familiar completo |
| GET | `/api/v1/dashboard/family/statistics` | `familyId` | Estadísticas |
| GET | `/api/v1/dashboard/family/goals` | `familyId` | Metas familiares |
| GET | `/api/v1/dashboard/family/ranking` | `familyId` | Ranking entre miembros |
| GET | `/api/v1/dashboard/family/members` | `familyId` | Miembros |
| GET | `/api/v1/dashboard/family/challenges` | `familyId` | Retos |
| GET | `/api/v1/dashboard/family/rewards` | `familyId` | Recompensas |
| GET | `/api/v1/dashboard/family/heatmap` | `familyId` | Mapa de calor |

### Company Dashboard (`/api/v1/dashboard/company`) — requiere `companyId`

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/api/v1/dashboard/company` | `companyId` | Dashboard empresarial completo |
| GET | `/api/v1/dashboard/company/kpis` | `companyId` | KPIs empresariales |
| GET | `/api/v1/dashboard/company/statistics` | `companyId` | Estadísticas |
| GET | `/api/v1/dashboard/company/departments` | `companyId` | Desglose por departamento |
| GET | `/api/v1/dashboard/company/heatmap` | `companyId` | Mapa de calor |
| GET | `/api/v1/dashboard/company/adherence` | `companyId` | Adherencia a programas |
| GET | `/api/v1/dashboard/company/trends` | `companyId` | Tendencias |
| GET | `/api/v1/dashboard/company/ranking` | `companyId` | Ranking entre departamentos/equipos |
| GET | `/api/v1/dashboard/company/licenses` | `companyId` | Licencias asignadas |
| GET | `/api/v1/dashboard/company/organization` | `companyId` | Datos de la organización |

## Modelos (DTOs)

Solo `GET /api/v1/dashboard/individual` documenta el shape completo de su respuesta en el spec; el resto de endpoints declaran `200 OK` sin `content`/schema.

```ts
interface ApiResponse<T> {
  success: boolean
  message: string | null
  data: T | null
  statusCode?: number
  traceId?: string
  timestamp?: string
}

interface IndividualDashboardResponse {
  userProfile: AuthUserResponseDto
  biometrics: MedicalDataResponseDto
  activity: SedentaryActivityResponseDto
  rewards: UserRewardsResponseDto
  notifications: NotificationItemDto[] | null
  recommendations: RecommendationDto[] | null
}

interface AuthUserResponseDto {
  userId: string | null
  email: string | null
  firstName: string | null
  lastName: string | null
  roles: string[] | null
  familyId: string | null
  companyId: string | null
}

interface MedicalDataResponseDto {
  userId: string | null
  heartRate: number
  systolicBp: number
  diastolicBp: number
  weight: number
  height: number
  bmi: number
  recordedAt: string // date-time
}

interface SedentaryActivityResponseDto {
  userId: string | null
  dailySteps: number
  activeMinutes: number
  sedentaryHours: number
  caloriesBurned: number
  hourlyHeatmap: number[] | null
}

interface UserRewardsResponseDto {
  userId: string | null
  points: number
  badgesUnlocked: number
  currentStreakDays: number
  recentRewards: string[] | null
}

interface NotificationItemDto {
  id: string | null
  title: string | null
  message: string | null
  severity: string | null
  createdAtUtc: string // date-time
  read: boolean
}

interface RecommendationDto {
  recommendationId: string | null
  category: string | null
  title: string | null
  description: string | null
  priorityScore: number
}
```

## Notas

- No hay endpoints de escritura (`POST`/`PUT`/`DELETE`): todo el servicio es de solo lectura, como corresponde a un agregador de dashboards.
- Para refrescar el spec: `curl https://lifebalance-dashboard-service.onrender.com/swagger/v1/swagger.json -o swagger.json`.
