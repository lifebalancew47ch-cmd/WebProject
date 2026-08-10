# Seguridad — LifeBalance Web

Este documento resume las prácticas de DevSecOps aplicadas a este repositorio y, muy importante,
**cuáles de los 5 puntos pedidos corresponden a este repo y cuáles son responsabilidad del backend**.
Este proyecto es un sitio Next.js exportado 100% estático (`output: 'export'`, `render.yaml` tipo
`static`) — no tiene servidor propio, no tiene base de datos propia, y no ejecuta código en Render
más allá de servir archivos. Eso cambia bastante qué significa "seguro" aquí.

## 1. SAST — Análisis Estático de Seguridad

- **`eslint-plugin-security`** agregado como devDependency y activado en `.eslintrc.json`
  (`plugin:security/recommended-legacy`), sobre la base de `next/core-web-vitals` que ya traía el
  proyecto.
- Se desactivó `security/detect-object-injection`: es una regla con muchísimos falsos positivos en
  TypeScript (marca cualquier `obj[variable]`, incluyendo accesos completamente seguros a objetos
  tipados como `PLANS[planId]` o `MAX_LENGTHS[campo]`). Es la práctica estándar en proyectos reales
  que usan este plugin — dejarla activa generaría ruido sin valor real.
- `npm run lint` corre limpio con esta configuración (un solo warning preexistente de
  `react-hooks/exhaustive-deps` en `AuthContext.tsx`, no relacionado a seguridad).
- Corre automáticamente en CI en cada push/PR a `main` (job `lint` en
  `.github/workflows/ci.yml`).
- **CodeQL** (`.github/workflows/codeql.yml`, queries `security-extended`) agregado como segunda
  capa de SAST — a diferencia de ESLint (reglas sintácticas), construye un grafo de flujo de datos
  real y detecta inyección/XSS/path-traversal que un linter no alcanza a ver. Corre en push/PR a
  `main` y además cada lunes, para atrapar hallazgos nuevos en código ya mergeado.

**SonarQube:** no se integró — requiere una cuenta/instancia (SonarCloud) y un token que el equipo
tendría que dar de alta. Si lo quieren, el siguiente paso es crear el proyecto en SonarCloud y
agregar `SONAR_TOKEN` a los secrets del repo; puedo agregar el job cuando exista esa cuenta.

## 2. SCA — Escaneo de Dependencias

- Job `dependency-audit` en `.github/workflows/ci.yml` corre `npm audit --audit-level=high` en
  cada push/PR.
- **`.github/dependabot.yml`** agregado: PRs semanales (lunes) para `npm` (minors/patches
  agrupados en un solo PR; majors siempre por separado, para revisarlos con cuidado) y para las
  GitHub Actions del propio CI (`actions/checkout`, `github/codeql-action`, etc. — también son
  superficie de supply-chain).
- **✅ Resuelto (2026-08-10): upgrade a Next.js 16 + React 19.** Las 8 vulnerabilidades altas de
  `next@14.2.35` quedaron en 0 — verificado con `npm audit` antes/después. Build (`npm run build`,
  Turbopack) y las 25 rutas estáticas generadas correctamente; revisado en el navegador (landing,
  Overview, Analytics, Reports, Organization, About) sin regresiones. Cambios que requirió:
  - `next lint` **fue removido en Next 16** — el script `lint` ahora corre `eslint .` directo.
    Sin los ignores que `next lint` aplicaba por defecto, ESLint lintiaba el propio `out/`
    compilado; se agregó `.eslintignore` (`.next/`, `out/`, `node_modules/`).
  - `tsconfig.json` reescrito automáticamente por Next (formato + `jsx: "react-jsx"`, requerido
    por el nuevo JSX transform).
  - Next 16 ahora auto-genera `AGENTS.md`/`CLAUDE.md` en cada `next dev` (feature nueva para
    asistentes de IA, ver comentario en `AGENTS.md`) — no existían antes, no se sobrescribió nada.
  - **Quedan 5 vulnerabilidades altas** en dependencias de **lint/build únicamente**
    (`brace-expansion`, `glob`, `js-yaml` — transitivas de `@typescript-eslint`/
    `eslint-config-next`), no en código que se sirve al navegador. Arreglarlas de raíz requiere
    subir `eslint-config-next` a la v16, que a su vez exige ESLint 9 (migración de config a flat
    config, `eslint.config.js`) — una migración aparte, no incluida en este cambio.
- **Por qué no es tan grave como suena:** revisé cada advisory — casi todos son sobre Server
  Actions, Server Components, Middleware, WebSocket upgrades y servidores custom. Esta app no usa
  nada de eso (`output: 'export'` = sin servidor Next.js corriendo, sin Middleware, sin Server
  Actions — confirmado en `next.config.mjs`). No significa que no haya que arreglarlo, pero no es
  explotable en el modo en que esta app está desplegada hoy.
- Por eso el paso de `npm audit` en CI tiene `continue-on-error: true` por ahora — informa pero no
  bloquea el pipeline. En cuanto se decida hacer el upgrade a Next 16 (fuera del alcance de esta
  tarea), hay que quitar ese `continue-on-error` para que vulnerabilidades altas/críticas sí
  bloqueen merges futuros.
- **Snyk:** el job incluye un paso opcional que solo corre si el repo tiene configurado el secret
  `SNYK_TOKEN` (Settings → Secrets and variables → Actions). Sin ese secret, se omite sin fallar el
  pipeline — no puedo crear la cuenta de Snyk por ustedes.

## 3. Gestión Segura de Secretos

- **Auditoría del código fuente (re-verificada 2026-08-10):** se revisó todo `app/`, `components/`,
  `lib/` y `docs/` (incluyendo el historial trackeado por git, no solo el working tree) buscando
  patrones de credenciales hardcodeadas (connection strings, API keys, contraseñas literales,
  incluyendo la cuenta demo usada para pruebas en vivo) — **no se encontró ninguna committeada**.
- **`.github/workflows/gitleaks.yml`**: escaneo de secretos en cada push/PR (`gitleaks detect`
  sobre el historial completo, `fetch-depth: 0`). Ojo con su alcance: Gitleaks escanea **contenido
  del repositorio** (archivos y commits) — no cubre secretos que solo viven en configuración local
  de git (ver el hallazgo del PAT abajo, que por eso no lo hubiera detectado).
- **🚨 Hallazgo activo, no un ítem cerrado:** el remoto `origin` de este repo en la máquina de
  desarrollo tiene un Personal Access Token de GitHub embebido en texto plano en la URL
  (`https://usuario:ghp_...@github.com/...`, visible con `git remote -v`). Se reportó por primera
  vez el 2026-08-06; se nos dijo que ya se había rotado. **Re-verificado en vivo el 2026-08-10:
  sigue siendo válido** (`GET https://api.github.com/user` con ese token responde `200 OK`, con
  scopes `repo, workflow` — acceso de lectura/escritura a todos los repos alcanzables por la cuenta
  más permiso para modificar los workflows de CI). Acción requerida: revocar el token en
  github.com/settings/tokens y reconfigurar el remoto sin credenciales en texto plano (SSH o Git
  Credential Manager).
- **`.gitignore`** corregido: antes solo ignoraba `.env*.local`, dejando la puerta abierta a que un
  `.env` normal se subiera por error. Ahora ignora `.env` y `.env.*` en general, exceptuando
  `.env.example`.
- **`.env.example`** nuevo, documentando las 7 variables de entorno que la app realmente usa.
- **Punto clave para este proyecto en particular:** al ser un export 100% estático, **cualquier
  variable que la app necesite en el navegador debe llevar el prefijo `NEXT_PUBLIC_`**, y Next.js
  la incrusta tal cual en el JavaScript que se descarga en cada visita. Eso significa que, por
  diseño, **no puede haber secretos reales en este repo** — ni aunque se configuren "variables de
  entorno en el panel de Render", porque técnicamente se compilan al bundle público de todas
  formas. Si en algún momento se necesita un secreto de verdad (una API key privada, por ejemplo),
  la única forma correcta es que viva en uno de los microservicios backend, nunca aquí.

## 4. Principio de Mínimo Privilegio

Esto es 100% responsabilidad del backend — este repo no tiene base de datos ni emite tokens de
API propios. Dicho eso, un hallazgo concreto de esta sesión que vale la pena escalar:

> La cadena de conexión de MongoDB Atlas que se usó para investigar bugs
> (`mongodb+srv://LBback:...@lifebalance.kwyxwll.mongodb.net`) tiene acceso de lectura/escritura a
> **todas** las bases de datos de **todos** los microservicios (Auth, Administration, Gamification,
> Ingestion, MLPrediction, MedicalData, OrganizationSaaS, Sedentary, Reporting), más `sample_mflix`
> y `admin`. Un solo usuario de Mongo con ese alcance viola el principio de mínimo privilegio: si
> esa credencial se filtra, compromete los 9 servicios a la vez, no uno. Vale la pena pedirle al
> equipo backend que separen credenciales por servicio (o al menos lectura vs. escritura) en vez de
> un único usuario "LBback" con privilegios globales.

## 5. Logging y Monitoreo Seguro

- Se revisó todo el código en busca de `console.log/info/warn/error` — solo existían dos, ambos
  placeholders temporales dejados al conectar la selección de planes
  (`PricingSection.tsx`, `BillingContent.tsx`), que **no** registraban contraseñas ni tokens (solo
  `planId` y `userId`), pero se eliminaron de todas formas: cualquier `console.log` en producción
  queda visible en las devtools de cualquier visitante, así que la política es no usarlos para
  nada que toque datos de usuario, ni siquiera IDs.
- `lib/api/client.ts` (el cliente HTTP compartido por las 6 APIs) no hace logging propio de
  requests/responses — los errores se propagan como `ApiError` con un mensaje ya sanitizado
  (nunca incluye el body crudo de la respuesta, que podría contener tokens en un `RefreshTokenResponse`
  o similar).
- Lo que este repo **no controla**: los logs del lado servidor de los 6 microservicios. Si loguean
  passwords o tokens en texto plano, es un hallazgo para reportarle al equipo backend — no hay
  forma de auditar eso desde aquí sin acceso a sus logs.

## 6. Headers de seguridad HTTP (defensa en profundidad)

Auditoría adicional (2026-08-06), fuera de los 5 puntos originales:

- **`render.yaml`** ahora define `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy` y `Strict-Transport-Security` para todas las rutas (`/*`).
  Calibrados a lo que esta app realmente carga (verificado con grep de `https://` en `app/`/`components/`):
  las 5 APIs de LifeBalance en `onrender.com` (`connect-src`), e imágenes de producto de
  `http2.mlstatic.com` / `m.media-amazon.com` en `WatchProductSection` (`img-src`).
- `script-src`/`style-src` incluyen `'unsafe-inline'` porque el export estático de Next.js embebe el
  payload de hidratación como `<script>` inline, y varios componentes usan `style={{...}}` inline —
  sin `unsafe-inline` el sitio se rompería. Es un trade-off consciente, no un descuido.
- **Mantenimiento:** si algún `NEXT_PUBLIC_*_API_URL` cambia a un host distinto en el dashboard de
  Render, hay que actualizar `connect-src` en `render.yaml` también — el CSP es un header estático,
  no lee esas env vars en runtime.
- **Requiere acción manual:** estos headers solo se aplican si el servicio de Render está sincronizado
  como Blueprint desde este `render.yaml`. Si el servicio se creó manualmente en el dashboard (no vía
  Blueprint), hay que ir a Render → el servicio → "Blueprint" y sincronizar, o copiar los headers a
  mano en la sección de Headers del dashboard.

**Hallazgo relacionado, no corregido aquí:** `accessToken`/`refreshToken` se guardan en
`localStorage` (`lib/auth/session.ts`), legibles por cualquier JS que corra en la página. La mitigación
real es evitar que XSS ocurra (ya se cumple: sin `dangerouslySetInnerHTML` en todo el repo, React
escapa todo por defecto) — el CSP de arriba es la capa adicional. Migrar a cookies `httpOnly` requeriría
que el backend las emita con `Set-Cookie`, lo cual es un cambio de arquitectura mayor (este sitio no
tiene servidor propio que pueda setear cookies) y no se hizo como parte de esta sesión.

## Resumen de lo que quedó implementado

| Punto pedido | Implementado aquí | Pendiente / responsabilidad de otro equipo |
|---|---|---|
| SAST | ✅ ESLint + eslint-plugin-security + CodeQL en CI | SonarQube (requiere cuenta) |
| SCA | ✅ `npm audit` + Dependabot en CI, Snyk opcional; **Next.js subido a v16, 0 vulns altas en runtime** | Activar Snyk (requiere `SNYK_TOKEN`); 5 vulns altas restantes son de tooling de lint (requieren migrar a ESLint 9) |
| Secretos | ✅ `.gitignore`, `.env.example`, Gitleaks en CI, auditoría de código sin hallazgos | 🚨 **Revocar el PAT expuesto en `git remote` — sigue activo, ver arriba** |
| Mínimo privilegio | ⚠️ Hallazgo documentado arriba | Backend: separar roles de Mongo por servicio |
| Logging seguro | ✅ Sin `console.log` de datos de usuario en el cliente | Backend: auditar sus propios logs de servidor |
| Headers HTTP | ✅ CSP + headers de seguridad en `render.yaml` | Confirmar sync de Blueprint en Render; considerar httpOnly cookies si el backend llega a soportarlas |
