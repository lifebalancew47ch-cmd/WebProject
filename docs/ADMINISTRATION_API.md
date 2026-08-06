# LifeBalance - Administration & Configuration Service API

Documentación extraída del mapa de endpoints provisto por el equipo backend (sin Swagger público) y verificada en vivo el 2026-08-04.

- **Base URL:** `https://lifebalance-administration-service.onrender.com`
- **Prefijo de rutas:** `/api/v{version}/[controller]`, v1
- **Envelope:** `Response<T>` vía `Ok(result)` / `CreatedAtAction`
- **Autorización:** `[Authorize(Policy = AdministratorOnlyPolicy)]` en (casi) todo el servicio — requiere rol `SUPERADMIN` o `SYSTEMADMINISTRATOR`. Cada mutación registra auditoría.

## ⚠️ Hallazgos importantes (verificado en vivo el 2026-08-04)

1. **El JWT del Auth & Profile service es aceptado.** No requiere claims especiales más allá del rol.
2. **La política de autorización funciona correctamente.** Con un usuario `USER` normal, todos los endpoints probados devuelven `403 Forbidden` (no `401`), confirmando que la autenticación pasa pero el rol no alcanza — comportamiento esperado y correcto.
3. **Con un usuario `SUPERADMIN` (asignado y revertido vía Mongo solo para esta prueba), la mayoría de los endpoints fallan con `500 Internal Server Error`:**
   ```json
   {"title":"Internal Server Error","status":500,"detail":"An unexpected error occurred. Please contact system support.","instance":"/api/v1/catalogs", ...}
   ```
   Reproducido en:
   - `GET /api/v1/catalogs`
   - `GET /api/v1/parameters`
   - `GET /api/v1/maintenance/status`
   - `GET /api/v1/services/status`

   Es decir, la autorización ya funciona (llega hasta el handler), pero el handler mismo revienta. Esto es un bug de backend, no de la app.
4. **`GET /api/v1/feature-flags` devuelve `404 Not Found`** (con el mismo token SUPERADMIN que sí pasa la autorización en los otros endpoints) — sugiere que la ruta real no coincide con `feature-flags` (posible diferencia de kebab-case vs. otra convención), o que el controlador no está registrado. Hay que confirmar con backend el nombre exacto de la ruta.
5. **`GET /api/v1/statistics` no respondió en 20s (timeout).** Podría estar colgado calculando algo pesado, o depender de otro servicio caído.

**Conclusión:** el servicio está desplegado, la autenticación y las políticas de rol funcionan bien, pero **ninguno de los endpoints de lectura probados devuelve datos utilizables hoy** (500, 404 o timeout). No tiene sentido construir la UI de este panel hasta que el backend confirme que al menos `catalogs`, `parameters` o `feature-flags` responden con `200`.

## Autenticación

```
Authorization: Bearer <token>
```
Requiere rol `SUPERADMIN` o `SYSTEMADMINISTRATOR` (`AdministratorOnlyPolicy`). Con cualquier otro rol → `403`.

## Endpoints

### Catalogs (`/api/v1/catalogs`)

| Método | Ruta | Query / Body | Descripción | Estado en vivo |
|---|---|---|---|---|
| POST | `/api/v1/catalogs` | Body: `CreateCatalogRequest` | Crea un catálogo | no probado |
| GET | `/api/v1/catalogs` | `pageIndex`, `pageSize`, `search`, `category`, `onlyActive` | Lista catálogos | ❌ 500 |
| GET | `/api/v1/catalogs/{id}` | — | Obtiene un catálogo | no probado |
| PUT | `/api/v1/catalogs/{id}` | Body: `UpdateCatalogRequest` | Actualiza un catálogo | no probado |
| DELETE | `/api/v1/catalogs/{id}` | — | Elimina un catálogo | no probado |
| PATCH | `/api/v1/catalogs/{id}/activate` | — | Activa | no probado |
| PATCH | `/api/v1/catalogs/{id}/deactivate` | — | Desactiva | no probado |

### Parameters (`/api/v1/parameters`)

| Método | Ruta | Query / Body | Descripción | Estado en vivo |
|---|---|---|---|---|
| POST | `/api/v1/parameters` | Body: `CreateParameterRequest` | Crea un parámetro | no probado |
| GET | `/api/v1/parameters` | `pageIndex`, `pageSize`, `search`, `category`, `onlyActive` | Lista parámetros | ❌ 500 |
| GET | `/api/v1/parameters/{id}` | — | Obtiene un parámetro | no probado |
| PUT | `/api/v1/parameters/{id}` | Body: `UpdateParameterRequest` | Actualiza | no probado |
| DELETE | `/api/v1/parameters/{id}` | — | Elimina | no probado |
| PATCH | `/api/v1/parameters/{id}/activate` \| `/deactivate` | — | Activa/desactiva | no probado |

### Feature Flags (`/api/v1/feature-flags`)

| Método | Ruta | Query / Body | Descripción | Estado en vivo |
|---|---|---|---|---|
| POST | `/api/v1/feature-flags` | Body: `CreateFeatureFlagRequest` | Crea un flag | no probado |
| GET | `/api/v1/feature-flags` | `pageIndex`, `pageSize`, `search`, `category`, `onlyEnabled` | Lista flags | ❌ 404 (ruta no encontrada) |
| GET | `/api/v1/feature-flags/{id}` | — | Obtiene un flag | no probado |
| PUT | `/api/v1/feature-flags/{id}` | Body: `UpdateFeatureFlagRequest` | Actualiza | no probado |
| DELETE | `/api/v1/feature-flags/{id}` | — | Elimina | no probado |
| PATCH | `/api/v1/feature-flags/{id}/enable` \| `/disable` | — | Activa/desactiva | no probado |

### Logs (`/api/v1/logs`)

| Método | Ruta | Query / Body | Descripción |
|---|---|---|---|
| POST | `/api/v1/logs` | Body: `LogEntryRequest` | Ingesta un log |
| POST | `/api/v1/logs/bulk` | Body: `LogEntryRequest[]` | Ingesta en lote |
| GET | `/api/v1/logs` | `pageIndex`, `pageSize`, `service`, `level`, `userId`, `correlationId`, `fromDate`, `toDate` | Lista logs |
| GET | `/api/v1/logs/errors` | `pageIndex`, `pageSize` | Solo errores |
| GET | `/api/v1/logs/warnings` | `pageIndex`, `pageSize` | Solo warnings |
| GET | `/api/v1/logs/{id}` | — | Obtiene un log |

### Audit (`/api/v1/audit`)

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/api/v1/audit` | `pageIndex`, `pageSize`, `userId`, `service`, `eventType`, `organizationId`, `companyId`, `fromDate`, `toDate` | Lista de auditoría |
| GET | `/api/v1/audit/by-user/{userId}` | `pageIndex`, `pageSize` | Auditoría por usuario |
| GET | `/api/v1/audit/by-service/{service}` | `pageIndex`, `pageSize` | Auditoría por servicio |
| GET | `/api/v1/audit/{id}` | — | Detalle de un evento |

### Settings (`/api/v1/settings`)

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| GET | `/api/v1/settings` | — | Obtiene la configuración |
| PUT | `/api/v1/settings` | `UpdateSettingsRequest` | Actualiza la configuración |
| POST | `/api/v1/settings/reset` | — | Restablece a valores por defecto |

### Maintenance (`/api/v1/maintenance`)

| Método | Ruta | Body | Descripción | Estado en vivo |
|---|---|---|---|---|
| GET | `/api/v1/maintenance/status` | — | Estado de mantenimiento | ❌ 500 |
| PUT | `/api/v1/maintenance/status` | `SetMaintenanceModeRequest` | Activa/programa mantenimiento | no probado |

### Services (`/api/v1/services`)

| Método | Ruta | Query | Descripción | Estado en vivo |
|---|---|---|---|---|
| GET | `/api/v1/services/status` | `forceRefresh` | Tablero de estado de todos los microservicios | ❌ 500 |
| GET | `/api/v1/services/{service}/status` | `forceRefresh` | Estado de un servicio puntual | no probado |

### Statistics (`/api/v1/statistics`)

| Método | Ruta | Descripción | Estado en vivo |
|---|---|---|---|
| GET | `/api/v1/statistics` | Estadísticas generales de administración | ❌ timeout (>20s) |

### Integrations (`/api/v1/integrations`) — proxy a otros servicios, `503` si el upstream cae

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/integrations/auth/roles` | Roles (proxy a Auth) |
| GET | `/api/v1/integrations/auth/permissions` | Permisos (proxy a Auth) |
| GET | `/api/v1/integrations/organization` | Config de Organization (proxy) |

## Notas

- No hay Swagger expuesto en ninguna ruta estándar (`/swagger`, `/openapi`, `/api-docs`, `/scalar`) → todos `404`.
- `/health` sí funciona y devuelve `200 Healthy`.
- Antes de construir la UI de este panel, conviene reportar al backend los 500 de `catalogs`/`parameters`/`maintenance`/`services`, el 404 de `feature-flags`, y el timeout de `statistics` — probablemente todos comparten una causa común (p. ej. una dependencia de infraestructura que no inicializó bien, similar a lo visto en Dashboard Service).
