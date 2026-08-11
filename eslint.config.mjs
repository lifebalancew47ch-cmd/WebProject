// Flat config (ESLint 9+) — reemplaza a .eslintrc.json + .eslintignore.
// Requerido por eslint-config-next@16.3.0 (peerDependency eslint >=9.0.0,
// ver docs/SECURITY.md: upgrade a Next 16 también obliga a subir ESLint).
import security from "eslint-plugin-security";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  // Antes vivía en .eslintignore (ya no soportado en ESLint 9) y en el
  // ignore por defecto de `next lint` (removido en Next 16, el script
  // "lint" ahora corre `eslint .` directo).
  {
    ignores: ["node_modules/**", ".next/**", "out/**"],
  },
  ...nextCoreWebVitals,
  security.configs.recommended,
  {
    rules: {
      // Ver docs/SECURITY.md: muchísimos falsos positivos en TypeScript
      // (marca cualquier obj[variable], incluyendo accesos completamente
      // seguros a objetos tipados como PLANS[planId]).
      "security/detect-object-injection": "off",

      // El upgrade a eslint-config-next@16 trae reglas nuevas del React
      // Compiler plugin (react-hooks/set-state-in-effect, /immutability,
      // /preserve-manual-memoization) que ahora son "error" por defecto.
      // Detectaron 17 casos preexistentes en 11 archivos (patrones tipo
      // `setLoading(false)` directo dentro de un useEffect) — reales, pero
      // son deuda de calidad de React, no hallazgos de seguridad, y
      // corregirlos toca lógica de negocio en varios hooks/componentes que
      // no corresponde tocar sin revisión propia. Bajados a "warn" para no
      // bloquear el pipeline mientras se hace esa limpieza aparte; no
      // suprimir silenciosamente — quitar este override en cuanto se
      // corrijan los 17 casos (ver `npm run lint` para la lista).
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
];

export default eslintConfig;
