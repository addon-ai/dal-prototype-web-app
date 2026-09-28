# Design: Prototipo gerencial de DAL (GitHub Pages)

## Technical Approach

Sitio estático en `prototype/` (HTML + CSS + JS vanilla con módulos ES, sin build ni dependencias npm) publicado por un workflow de Pages aislado. Un store pub/sub único alimenta cuatro vistas: lienzo SVG, receta JSON/YAML, estadísticas/costos y narrativa. **Cero red**: toda la data es mock embebida en módulos JS dentro de `prototype/js/data/`; las métricas se derivan del grafo con un generador determinista. Solo se cargan Google Fonts (con fallback) y, opcionalmente, `localStorage` para el borrador. Implementa el Enfoque 1 de `exploration.md` y las 7 capabilities de `proposal.md`.

## Architecture Decisions

| #   | Decisión           | Elegido                                                                                                                                 | Descartado                                                        | Justificación                                                                                                                                                                                                                           |
| --- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Capa de datos      | Módulos mock estáticos (`data/*.js`) + generador determinista; **sin capa de red**                                                      | fetch a API DAL/mock server; JSON vía `fetch('./data.json')`; MSW | Restricción dura del usuario. Módulos ES evitan incluso `fetch` local, funcionan igual en Pages y en `npx serve`; sin CORS, sin auth, sin backend que falle en demo                                                                     |
| D2  | Métricas simuladas | Fórmula `f(grafo, volumen, pricing)` + PRNG `mulberry32` con semilla fija `20260928` solo para la serie temporal                        | `Math.random`; cifras fijas                                       | Determinista = misma demo cada vez; al añadir/quitar pasos las cifras cambian coherentemente (p. ej. + "Aprobación" ⇒ + tiempo y − casos 100% automáticos)                                                                              |
| D3  | YAML               | Serializador propio `yaml.js` (~60 líneas)                                                                                              | CDN `yaml`/`js-yaml`                                              | Subconjunto controlado (objetos, arrays, string, number, boolean). Strings emitidos con `JSON.stringify` (escalar doble-comillas es YAML válido) → sin ambigüedad de escape. Sin dependencia externa, funciona offline, cero riesgo CDN |
| D4  | Lienzo             | SVG + Pointer Events (`setPointerCapture`)                                                                                              | Drawflow/Rete vía CDN; React Flow + esm.sh                        | Tokens DAL y a11y bajo control; sin dependencias (D1)                                                                                                                                                                                   |
| D5  | Estado             | Store pub/sub con `dispatch(action)` → reducer puro → `notify`                                                                          | Estado disperso en DOM; framework                                 | Una fuente de verdad para lienzo, receta y costos; reducer testeable a mano en consola                                                                                                                                                  |
| D6  | Tokens             | 3 capas en `css/tokens.css`: primitive (copia de `src/styles/tokens.css` @ `f4fce1e`) → semantic → component (`--node-*`, `--canvas-*`) | Importar `src/styles`                                             | El prototipo no importa nada de `src/`; commit origen anotado contra deriva                                                                                                                                                             |
| D7  | Foco               | `outline: 2px solid var(--color-focus-ring)` + offset 2px (≥3:1)                                                                        | Anillo verde 10% del repo                                         | El anillo original es casi invisible                                                                                                                                                                                                    |
| D8  | ESLint             | No tocar `eslint.config.js`; JS válido ESM, sin `eslint-disable`                                                                        | Añadir `ignores`                                                  | Evidencia en proposal (`rules: {}` para `.js`)                                                                                                                                                                                          |
| D9  | Persistencia       | `localStorage` opcional, envuelto en try/catch; si falla se usa la plantilla                                                            | IndexedDB; servidor                                               | Requisito "funciona sin él"                                                                                                                                                                                                             |

## File Changes

| Archivo                                                                            | Acción | Descripción                                                                                                                                                                     |
| ---------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prototype/index.html`                                                             | Create | Shell: header (logo, tema, vistas), `<main>` con paleta, lienzo, inspector, `<details>` "Receta técnica (para TI)"; anti-FOUC de tema; preconnect + Google Fonts `display=swap` |
| `prototype/css/{tokens,base,layout,canvas,panels}.css`                             | Create | Tokens 3 capas; reset + a11y (reduced-motion, focus); grid mobile-first; nodos/aristas; paneles y gráficos                                                                      |
| `prototype/js/main.js`                                                             | Create | Composition root: crea store, monta vistas, carga borrador o plantilla                                                                                                          |
| `prototype/js/store.js`                                                            | Create | `createStore(reducer, initial)`; `subscribe(selector, fn)`                                                                                                                      |
| `prototype/js/reducer.js`                                                          | Create | Acciones: `ADD_STEP, MOVE_STEP, UPDATE_SETTING, CONNECT, SET_CONDITION, REMOVE, SELECT, LOAD_TEMPLATE, SET_VOLUME, SET_VIEW`                                                    |
| `prototype/js/data/catalog.js`                                                     | Create | ~9 pasos: nombre de negocio, `wireType`, forma, icono SVG, 2-4 ajustes, factores de consumo                                                                                     |
| `prototype/js/data/template-logistica.js`                                          | Create | Grafo precargado (JSON de exploración §B) con posiciones; bandera `aDefinirSesion2: true`                                                                                       |
| `prototype/js/pricing.config.js`                                                   | Create | ÚNICO archivo con cifras; `illustrative: true`                                                                                                                                  |
| `prototype/js/data/narrative.js`                                                   | Create | Problema/Solución/Decisor/Resultado/Hipótesis (borrador)                                                                                                                        |
| `prototype/js/canvas/{render,drag,keyboard,edges}.js`                              | Create | Render SVG, arrastre con pointer, teclado, bezier y etiquetas de decisión                                                                                                       |
| `prototype/js/ui/{palette,inspector,recipe,stats,costs,charts,narrative,theme}.js` | Create | Vistas suscritas al store                                                                                                                                                       |
| `prototype/js/domain/{to-wire,yaml,metrics,prng,costs,format}.js`                  | Create | Funciones puras                                                                                                                                                                 |
| `prototype/js/draft-storage.js`                                                    | Create | get/set/clear con try/catch                                                                                                                                                     |
| `prototype/assets/{favicon.svg,logo-sidebar.svg,logo-sidebar-dark.svg}`            | Create | Copias de `public/` y `src/assets/`                                                                                                                                             |
| `prototype/README.md`                                                              | Create | Cómo abrir (`npx serve prototype`), excepción a CLAUDE.md, origen `f4fce1e`, checklist de verificación                                                                          |
| `.github/workflows/pages-prototype.yml`                                            | Create | Workflow de exploración §F + paso `verify` (ver Testing)                                                                                                                        |
| `.dockerignore`                                                                    | Modify | Añadir línea `prototype`                                                                                                                                                        |

Cada módulo ≤ ~200 líneas.

## Interfaces / Contracts

```js
// Estado del store
{ graph: { id, name, nodes: [{ id, step, label, x, y, settings }],
           edges: [{ id, from, to, condition? /* texto de negocio */ }] },
  ui: { selectedId, connectFrom, view: 'constructor'|'resultados'|'narrativa' },
  scenario: { casosMes: 3000 } }

// catalog.js — entrada por paso
{ step: 'entiende', label: 'Entiende y responde', wireType: 'llm', shape: 'rect',
  settings: [{ key: 'creatividad', type: 'range', wireKey: 'temperature', min: 0, max: 1 }],
  consumo: { tokensIn: 800, tokensOut: 300, segundos: 2 } }

// pricing.config.js
export const PRICING = { illustrative: true, currency: 'USD',
  plan: { name: 'Piloto', monthly: 0, includes: { runs: 0, docs: 0, rag_gb: 0,
          integration_calls: 0, constructor_seats: 0, operator_seats: 0 } },
  rates: { 'run-overage': 0, 'doc-overage': 0, 'rag-gb-overage': 0,
           'integration-call-overage': 0, 'constructor-seat': 0, 'operator-seat': 0 },
  tokenPricePer1M: { 'modelo-estandar': { input: 0, output: 0 } },
  discountPercent: 0 };   // valores reales de ejemplo se fijan en apply
```

`toWire(graph)` → forma del wire (`graph_id, name, version, status:'DRAFT', nodes[{id,type,label,...wireKeys}], edges[{from,to,condition?}]`), **sin** `state_schema` ni `llm_config`. `computeMetrics(graph, scenario, catalog)` → `{casos, exitoPct, p50s, p95s, bloqueadosPct, aprobacionesPend, tokensPorModelo, consumo:{meter:{usado,cupo,pct}}, serie:[{dia,casos}]}`. `computeInvoice(metrics, PRICING)` → líneas `{concepto, cantidad, tarifa, monto}` + subtotal, descuento, total.

## Data Flow

```
data/*.js ─(import)─→ main.js ─→ store ←─ dispatch ── palette / canvas / inspector
                                   │ notify
          ┌────────────┬───────────┼──────────────┐
      canvas/render  recipe(toWire→JSON|YAML)  stats(computeMetrics)→costs(computeInvoice)
                                   └─→ draft-storage (opcional, debounce 500 ms)
```

### Secuencia: arrastrar paso → receta → costos

```
Usuario      palette/drag      store/reducer     canvas     recipe     metrics→costs
  │ pointerdown  │                   │               │          │             │
  │─────────────→│ ghost + capture   │               │          │             │
  │ pointerup    │                   │               │          │             │
  │─────────────→│ ADD_STEP{step,x,y}│               │          │             │
  │              │──────────────────→│ nuevo estado  │          │             │
  │              │                   │─ notify ─────→│ render   │             │
  │              │                   │─ notify ────────────────→│ toWire+yaml │
  │              │                   │─ notify ──────────────────────────────→│ recalcula
  │ aria-live: "Paso 'Aprobación' agregado. Costo estimado: $X/mes"          │
```

Teclado/táctil: en la paleta `Enter` agrega el paso en la siguiente posición libre; con un nodo enfocado, flechas = `MOVE_STEP` (±16 px, Shift ±64), `C` inicia conexión y `Enter` sobre destino la crea, `Supr` elimina. Nodos son `<g role="button" tabindex="0" aria-label>`; targets ≥44 px. En < 768 px la paleta es hoja inferior con botones "Agregar".

## Fuentes

`<link rel=preconnect>` + hoja Google Fonts con `display=swap`; pila `'IBM Plex Sans', system-ui, -apple-system, sans-serif` (igual para Roboto/Noto/JetBrains Mono). Sin conexión el layout no cambia de métricas críticas; no se bloquea el render.

## Testing Strategy (sin `*.test.js` en `prototype/`)

| Capa                | Qué                                                                                                                                                                                                                            | Cómo                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------- | --------- | ---------------------------------------------- | -------------------------------- |
| Estática (CI Pages) | Sintaxis ESM, sin red, rutas relativas                                                                                                                                                                                         | Paso `verify` del workflow: `find prototype -name '*.js' -exec node --check {} \;` y `! find prototype -name '_.test.js' -o -name '_.spec.js' | grep .`; `! grep -rnE "fetch\( | XMLHttpRequest | WebSocket | EventSource" prototype/js`; `! grep -rnE "(src | href)=\"/" prototype/index.html` |
| Repo                | No interferencia                                                                                                                                                                                                               | `npm run lint`, `type-check`, `vitest run`, `build` en verde                                                                                  |
| Funciones puras     | toWire, yaml, metrics, costs                                                                                                                                                                                                   | Smoke en consola del navegador documentado en README (`import('./js/domain/yaml.js')`), no archivos de test                                   |
| Manual              | Checklist en README: mouse/teclado/táctil, tema claro/oscuro, 375 px sin scroll horizontal, contraste AA, reduced-motion, rótulos "Datos de ejemplo"/"Precios ilustrativos", receta colapsada, DevTools > Network solo fuentes |

Playwright no está instalado; un `*.spec.ts` sería recogido por Vitest. Se descarta en este cambio.

> Desviación (apply): `pricing.config.js` vive en `prototype/js/pricing.config.js` (ruta del spec), no en `js/data/`.

## Migration / Rollout

Sin migración. Activar Settings > Pages > Source "GitHub Actions". Rollback: revert + Unpublish.

## Open Questions

- [ ] Visibilidad de Pages en repo privado (plan B: repo público o zip) — no bloquea.
- [ ] Cifras de `pricing.config.js`: ilustrativas hasta sesión 2.
