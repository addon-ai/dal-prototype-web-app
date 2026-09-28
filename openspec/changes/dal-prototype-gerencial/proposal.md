# Proposal: Prototipo gerencial de DAL (GitHub Pages)

## Intent

DAL hoy solo lo entienden perfiles técnicos. Para validar "Addon AI" con una empresa logística (Family & Friends), un gerente o CEO tiene que ver en minutos **qué problema resuelve, cómo interviene en el proceso y qué resultado genera**. No se busca más funcionalidad, sino un prototipo navegable, en español y con la identidad visual DAL por defecto.

## Scope

### In Scope

- `prototype/` estático (HTML + JS vanilla, sin build) publicado en GitHub Pages.
- Constructor de pasos tipo n8n: arrastrar y soltar, con alternativa de teclado y táctil, y lenguaje de negocio.
- Plantilla logística editable: seguimiento de envíos con atención de reclamos.
- Vista colapsable "Receta técnica (para TI)" con JSON y YAML en vivo.
- Estadísticas simuladas y costos por servicio facturable al consumidor, rotulados "Datos de ejemplo" y "Precios ilustrativos".
- Pantalla de narrativa de validación (borrador).

### Out of Scope

- Todo lo marcado EXCLUIDO en exploration.md ("Superficie consumidor"): admin, ops, costo base, margen, `state_schema` y `llm_config`.
- Ejecución real, backend, i18n EN, Liquid Glass y paletas alternativas.
- Cifras reales de precios y la empresa o proceso definitivos (se definen en la sesión 2).

## Capabilities

| Capability                       | Qué cubre                                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `prototype-dal-theme`            | Tokens primitive→semantic→component copiados de `src/styles/tokens.css` (commit origen `f4fce1e`), fuentes, logo, modo claro/oscuro y a11y |
| `prototype-canvas-builder`       | Paleta de ~9 pasos, lienzo SVG, conexiones y decisiones, panel de 2-4 ajustes, teclado y táctil                                            |
| `prototype-logistics-scenario`   | Plantilla precargada editable, marcada "a definir en sesión 2"                                                                             |
| `prototype-recipe-view`          | JSON y YAML con forma del wire, serializador propio, copiar                                                                                |
| `prototype-usage-costs`          | KPIs de negocio, consumo frente a cupo y factura estimada; todas las cifras en UN archivo `prototype/js/pricing.config.js`                 |
| `prototype-validation-narrative` | Problema → Solución → Decisor → Resultado → Hipótesis                                                                                      |
| `prototype-pages-deploy`         | Workflow aislado de Pages y exclusión en Docker                                                                                            |

## Approach

Se confirma el Enfoque 1 de la exploración:

- SVG + Pointer Events, módulos ES y un store pub/sub único que renderiza el lienzo, la receta y las estadísticas.
- Gráficos en SVG propio, con significado expresado por forma, icono y texto, no solo por color.
- Solo rutas relativas.
- El prototipo no importa nada de `src/`. Las reglas de CLAUDE.md para `src/` no aplican aquí; la excepción se documenta en `prototype/README.md`.

**ESLint: no se modifica `eslint.config.js`.** Evidencia: `npx eslint --print-config prototype/js/canvas.js` devuelve `rules: {}` con espree en ESM 2026, y un `.js` de prueba vía `--stdin` sale con código 0 bajo `--max-warnings 0`. Restricciones para que siga pasando:

- JS sintácticamente válido.
- Sin comentarios `eslint-disable`, porque `reportUnusedDisableDirectives` los reporta como warning.
- Sin archivos `*.test.js` ni `*.spec.js` en `prototype/`, porque Vitest los recogería.

## Affected Areas

| Área                                                                                               | Impacto                                                                   |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `prototype/**` (index.html, css/, js/, assets/, README.md)                                         | Nuevo                                                                     |
| `.github/workflows/pages-prototype.yml`                                                            | Nuevo: se dispara con `paths: prototype/**` y está aislado de `ci-cd.yml` |
| `.dockerignore`                                                                                    | Se añade `prototype`                                                      |
| Solo lectura: `src/styles/tokens.css`, `index.html`, `public/favicon.svg`, `src/assets/logo-*.svg` | —                                                                         |
| No se tocan: `vite.config.ts`, `eslint.config.js`, `tsconfig*` ni los archivos sucios              | —                                                                         |

## Risks

| Riesgo                                                             | Prob. | Mitigación                                                                 |
| ------------------------------------------------------------------ | ----- | -------------------------------------------------------------------------- |
| Un gerente toma los precios como oferta                            | Media | Rótulo visible "ilustrativo" y config único                                |
| Repo privado: Pages requiere plan de pago y el sitio queda público | Alta  | Pregunta abierta; plan B: otro repo público o compartir el zip. No bloquea |
| Deriva de los tokens copiados                                      | Media | Anotar el commit origen `f4fce1e`                                          |
| Drag & drop inaccesible                                            | Media | Teclado (Enter/flechas), táctil ≥44px y foco reforzado                     |
| Google Fonts sin conexión                                          | Baja  | Fallback `system-ui`                                                       |

## Rollback Plan

Es un cambio aditivo y aislado:

1. `git revert` del/los commits, o borrar `prototype/`, el workflow y la línea de `.dockerignore`.
2. Despublicar desde Settings > Pages (Unpublish).

El build, el CI y la imagen de la app no dependen del prototipo.

## Dependencies

- Activar Settings > Pages > Source: "GitHub Actions".

## Success Criteria

- [ ] Sin guía, un gerente explica en ≤5 min el problema, dónde interviene el asistente y el resultado esperado.
- [ ] La plantilla logística carga y se edita con mouse, teclado y táctil.
- [ ] Cada costo mostrado corresponde a un servicio facturable al consumidor y lleva el rótulo "ilustrativo".
- [ ] La receta JSON/YAML se actualiza en vivo y está colapsada por defecto.
- [ ] Contraste AA, foco visible, sin scroll horizontal en móvil y `prefers-reduced-motion` respetado.
- [ ] `npm run lint`, `type-check`, `vitest` y `build` siguen en verde; Pages publica la URL.

## Narrativa de validación (BORRADOR — confirmar en sesión 2)

| Elemento           | Borrador                                                                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problema           | Las consultas de estado de envío y los reclamos saturan a atención al cliente; las respuestas son lentas y los criterios de compensación, inconsistentes                                     |
| Solución           | El asistente Addon entiende la consulta, consulta el TMS y las políticas, aplica la regla de retraso y escala al supervisor solo si hay compensación                                         |
| Usuario / Decisor  | Usuario: agente de servicio al cliente y supervisor. Decisor: gerente de operaciones o servicio al cliente                                                                                   |
| Resultado esperado | Menor tiempo de respuesta y más casos resueltos sin intervención humana, con costo por caso visible                                                                                          |
| Hipótesis          | "Si el asistente resuelve ≥X% de las consultas de estado en <Y min, el equipo reduce Z h/semana a un costo por caso menor que el actual" (X, Y y Z por definir con datos del proceso actual) |

Pendiente entre sesiones: cómo funciona hoy el proceso, quién participa y qué indicador mejora.
