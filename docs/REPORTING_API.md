# LifeBalance - Reporting Service API

Documentación extraída del mapa de endpoints provisto por el equipo backend (sin Swagger público) y verificada en vivo el 2026-08-04.

- **Base URL:** `https://lifebalance-reporting-service.onrender.com`
- **Prefijo de rutas:** `/api/v1/reports`
- **Envelope:** `ApiResponse<T>` — confirmado en vivo: `{ success, message, data, statusCode, traceId, timestamp }`
- **Identidad:** `userId` desde `ICurrentUserService` (claim del JWT de Auth & Profile). `401` si falta el token.
- **Políticas:** `ReportRead`, `ReportExport`, `AuthenticatedUser`, `Admin` (según endpoint).

## ⚠️ Hallazgos importantes (verificado en vivo el 2026-08-04)

1. **El JWT del Auth & Profile service es aceptado sin cambios.** Igual que Notifications y Dashboard: mismo token, sin necesidad de claims adicionales para pasar la autenticación (a diferencia de Organization & SaaS que exige `TenantId`).
2. **Sin Swagger expuesto.** Probadas todas las rutas estándar (`/swagger`, `/openapi`, `/api-docs`, `/scalar`) → `404`. La documentación de este archivo viene de un análisis directo del código fuente del equipo backend, no de un spec auto-generado.
3. **Bug compartido con Dashboard Service: `503 "User profile for '{userId}' is unavailable"`.** Reproducido en vivo con un usuario demo autenticado en:
   - `GET /api/v1/reports/dashboard-summary?scope=individual`
   - `GET /api/v1/reports/individual`
   - `GET /api/v1/reports/statistics?scope=individual`
   - `GET /api/v1/reports/trends?scope=individual&metrics=heartRate`

   Los cuatro devuelven el mismo `503` con el mismo mensaje que ya reportamos en Dashboard Service — todo indica que Reporting depende del mismo agregador de perfil de usuario que está caído, no es un bug aislado de este servicio. **No integrar estos 4 endpoints en la UI hasta que se confirme la corrección del bug de Dashboard Service.**
4. **`GET /api/v1/reports/history` sí funciona** (`200 OK`, lista vacía porque no hay reportes generados todavía):
   ```json
   {
     "success": true,
     "message": "Request processed successfully.",
     "data": {
       "items": [],
       "totalItems": 0,
       "pageIndex": 1,
       "pageSize": 10,
       "totalPages": 0,
       "hasNextPage": false,
       "hasPreviousPage": true
     },
     "statusCode": 200,
     "traceId": "...",
     "timestamp": "..."
   }
   ```
   Nótese `hasPreviousPage: true` en la página 1 — posible bug menor de paginación, no bloqueante.
5. **No probados en vivo (requieren datos que no existen todavía o roles/params que no teníamos a mano):** `family/{familyId}`, `company/{companyId}`, `export`, `system-metrics`.
6. **🚨 Bloqueante: el servicio no tiene CORS configurado en absoluto.** Verificado con `curl -i -X OPTIONS .../api/v1/reports/history -H "Origin: http://localhost:3000"` → sin ningún header `Access-Control-Allow-Origin` en la respuesta (ni en el preflight `OPTIONS`, ni en el `GET` real). Esto afecta a **todos** los endpoints, incluyendo `history` que sí responde `200` por `curl`. Confirmado en vivo desde la app: `GET /api/v1/reports/history` fallado con `"No se pudo conectar con el servidor"` — es el navegador bloqueando la respuesta por falta de CORS, no un problema de red real. **Ningún endpoint de este servicio es utilizable desde la web hasta que se habilite CORS**, incluso los que funcionan correctamente a nivel de servidor.

**Conclusión:** a nivel de servidor `history` funciona, pero **cero endpoints de Reporting son utilizables desde el navegador hoy** por la falta total de CORS — esto es más urgente que el bug de perfil de usuario (punto 3), porque bloquea incluso lo que sí está arreglado.

## Autenticación

```
Authorization: Bearer <token>
```
(mismo JWT que Auth & Profile.)

## Endpoints

### Reports (`/api/v1/reports`)

| Método | Ruta | Query | Descripción | Estado en vivo |
|---|---|---|---|---|
| GET | `/api/v1/reports/dashboard-summary` | `scope`, `scopeId?`, `from?`, `to?` | Resumen tipo dashboard | ❌ 503 |
| GET | `/api/v1/reports/individual` | `from?`, `to?` (userId del claim) | Reporte individual | ❌ 503 |
| GET | `/api/v1/reports/family/{familyId}` | `from?`, `to?` | Reporte de familia | no probado |
| GET | `/api/v1/reports/company/{companyId}` | `from?`, `to?` | Reporte de empresa | no probado |
| GET | `/api/v1/reports/export` | `scope`, `scopeId?`, `format`, `from?`, `to?`, `metrics` | Exporta archivo (`File`) | no probado |
| GET | `/api/v1/reports/history` | `pageIndex`, `pageSize`, `scope?`, `format?` | Historial de reportes generados | ✅ 200 por curl, ❌ bloqueado en navegador por falta de CORS |
| GET | `/api/v1/reports/statistics` | `scope`, `scopeId?`, `from?`, `to?` | Estadísticas | ❌ 503 |
| GET | `/api/v1/reports/trends` | `scope`, `scopeId?`, `from?`, `to?`, `metrics` | Tendencias | ❌ 503 |
| GET | `/api/v1/reports/system-metrics` | — (`[Admin]`) | Métricas generales del sistema | no probado |

## Modelos (DTOs)

Los shapes de `DashboardSummaryResponse`, `IndividualReportResponse`, `FamilyReportResponse`, `CompanyReportResponse`, `ReportStatisticsResponse`, `ReportTrendsResponse` y `GeneralSystemMetricsDto` **no están confirmados** — todos los endpoints que los devolverían fallan con 503 en este entorno. Se documentarán en cuanto el bug de perfil de usuario se resuelva.

Confirmado en vivo:

```ts
interface PaginatedResponse<T> {
  items: T[]
  totalItems: number
  pageIndex: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface ReportHistoryItemDto {
  // shape exacto no confirmado — la lista está vacía en este entorno
  [key: string]: unknown
}
```

## Notas

- Re-probar `dashboard-summary`, `individual`, `statistics` y `trends` en cuanto el equipo backend confirme el fix del bug `"User profile ... unavailable"` (compartido con Dashboard Service, ver `docs/DASHBOARD_SERVICE_API.md`).
- No hay spec de OpenAPI para regenerar automáticamente — este documento se mantiene a mano.
