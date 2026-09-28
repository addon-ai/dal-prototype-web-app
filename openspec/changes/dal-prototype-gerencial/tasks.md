# Tasks: Prototipo gerencial de DAL (GitHub Pages)

> Movido a repo independiente dal-prototype-web-app: las rutas `prototype/...` de este documento equivalen a la raíz del repo.

Reglas transversales: todo mockeado, sin red (solo Google Fonts); rutas relativas; sin `*.test.js`/`*.spec.js` ni `eslint-disable` en `prototype/`; no tocar `eslint.config.js`, `vite.config.ts`, `tsconfig*`, `ci-cd.yml` ni los archivos sin commitear (`executionMappers.ts`, `graphMappers.ts`, `HttpGraphRepository.test.ts`). Módulos ≤ ~200 líneas. Abreviaturas: spec = `specs/prototype-<capability>/spec.md`.

## Fase 1: Andamiaje y tema

- [x] 1.1 Editar `.dockerignore`: añadir línea `prototype`. (pages-deploy: Exclusión en Docker)
- [x] 1.2 Copiar `public/favicon.svg` y `src/assets/logo-sidebar*.svg` a `prototype/assets/{favicon.svg,logo-sidebar.svg,logo-sidebar-dark.svg}`. (dal-theme: Marca)
- [x] 1.3 Crear `prototype/css/tokens.css` con 3 capas: primitive (copia de `src/styles/tokens.css` @ `f4fce1e`), semantic (claro por defecto; `[data-theme="dark"]`), component (`--node-*`, `--canvas-*`, `--color-focus-ring`). (dal-theme: Tokens, Modo claro/oscuro)
- [x] 1.4 Crear `prototype/css/base.css`: reset, tipografía con fallback `system-ui`, `outline: 2px` + offset 2px, `prefers-reduced-motion`, targets ≥44px, sin colores literales. (dal-theme: Accesibilidad visual, Sin hardcodeados)
- [x] 1.5 Crear `prototype/css/layout.css`: grid mobile-first, sin scroll horizontal a 360/375px, paleta como hoja inferior <768px. (canvas-builder: Móvil; dal-theme: Móvil sin desbordamiento)
- [x] 1.6 Crear `prototype/index.html`: header (logo, conmutador de tema, navegación Constructor/Resultados/Narrativa), `<main>`, región `aria-live`, `<details>` "Receta técnica (para TI)" cerrado, rótulo "a definir en sesión 2", anti-FOUC de tema, preconnect + Google Fonts `display=swap`, solo rutas relativas. (dal-theme: Marca; logistics: Rótulo; recipe: Colapsada)
- [x] 1.7 Crear `prototype/js/ui/theme.js`: conmutador `data-theme="dark"`, persistencia en `localStorage` con try/catch. (dal-theme: Cambio a oscuro)
- [x] 1.8 Crear `prototype/js/draft-storage.js`: get/set/clear con try/catch. (logistics: localStorage no disponible)

## Fase 2: Datos mock

- [x] 2.1 Crear `prototype/js/data/catalog.js`: 9 pasos (nombre de negocio, `wireType`, forma, icono SVG, 2-4 ajustes, `consumo`), sin jerga técnica en textos. (canvas-builder: Paleta, Panel de ajustes)
- [x] 2.2 Crear `prototype/js/data/template-logistica.js`: grafo con los 7 pasos mínimos, posiciones, aristas y condiciones, `aDefinirSesion2: true`. (logistics: Plantilla precargada, Vocabulario)
- [x] 2.3 Crear `prototype/js/pricing.config.js` (ruta según spec, ver Decisiones): único archivo con cifras, `illustrative: true`, cupos, tarifas, descuento, precios por 1M tokens. (usage-costs: Cifras en un solo archivo)
- [x] 2.4 Crear `prototype/js/data/narrative.js`: los 5 elementos del borrador de `proposal.md`; X, Y, Z como "por definir". (validation-narrative: Secuencia, Hipótesis sin cifras)
- [x] 2.5 Crear `prototype/js/domain/prng.js`: `mulberry32(seed)` con semilla `20260928`. (usage-costs: KPIs deterministas)

## Fase 3: Store y lógica pura

- [x] 3.1 Crear `prototype/js/store.js`: `createStore(reducer, initial)`, `dispatch`, `subscribe(selector, fn)`.
- [x] 3.2 Crear `prototype/js/reducer.js`: `ADD_STEP, MOVE_STEP, UPDATE_SETTING, CONNECT, SET_CONDITION, REMOVE, SELECT, LOAD_TEMPLATE, SET_VOLUME, SET_VIEW`; `CONNECT` rechaza duplicados y autoconexión con motivo. (canvas-builder: Conexión inválida; logistics: Restaurar)
- [x] 3.3 Crear `prototype/js/domain/to-wire.js`: `toWire(graph)` con `graph_id, name, version, status:'DRAFT', nodes, edges` (`condition?`), sin `state_schema` ni `llm_config`. (recipe: Forma del wire, Conexión condicional)
- [x] 3.4 Crear `prototype/js/domain/yaml.js`: serializador propio (objetos, arrays, string vía `JSON.stringify`, number, boolean). (recipe: YAML equivalente)
- [x] 3.5 Crear `prototype/js/domain/metrics.js`: `computeMetrics(graph, scenario, catalog)` según contrato del diseño; más pasos "Aprobación" ⇒ más tiempo y menos casos automáticos. (usage-costs: Rótulo de datos)
- [x] 3.6 Crear `prototype/js/domain/costs.js`: `computeInvoice(metrics, PRICING)` con líneas, subtotal, descuento, total y excedente a tarifa unitaria. (usage-costs: Excedente, Líneas de costo)
- [x] 3.7 Crear `prototype/js/domain/format.js`: formato de moneda/porcentaje/tiempo en español.

## Fase 4: Lienzo SVG y accesibilidad

- [x] 4.1 Crear `prototype/js/canvas/render.js`: nodos `<g role="button" tabindex="0" aria-label>`, forma + icono + texto, targets ≥44px. (canvas-builder: Paleta visible)
- [x] 4.2 Crear `prototype/js/canvas/edges.js`: bezier con flecha "luego", etiqueta y trazo distintos para condicionales. (canvas-builder: Conexión condicional)
- [x] 4.3 Crear `prototype/js/canvas/drag.js`: Pointer Events con `setPointerCapture`, `touch-action: none`, ghost desde paleta. (canvas-builder: Arrastrar desde la paleta, Táctil)
- [x] 4.4 Crear `prototype/js/canvas/keyboard.js`: flechas ±16 px (Shift ±64), `C` conecta, Enter sobre destino, Supr elimina. (canvas-builder: Mover con flechas)
- [x] 4.5 Crear `prototype/js/ui/palette.js`: lista con botones "Agregar"; Enter agrega, selecciona y anuncia en `aria-live` con costo estimado. (canvas-builder: Agregar con teclado, Paleta en móvil)
- [x] 4.6 Crear `prototype/js/ui/inspector.js`: 2-4 ajustes, nombre y condición de arista; sin `state_schema`/`llm_config`. (canvas-builder: Editar ajuste)
- [x] 4.7 Crear `prototype/css/canvas.css`: estilos de nodos/aristas solo con tokens `--node-*`/`--canvas-*`.

## Fase 5: Paneles

- [x] 5.1 Crear `prototype/js/ui/recipe.js`: pestañas JSON/YAML, `aria-expanded` del `<details>`, botón "Copiar" con `aria-live`, manejo de fallo del portapapeles. (recipe-view: todos los escenarios)
- [x] 5.2 Crear `prototype/js/ui/charts.js`: gráficos SVG propios con `<title>`, leyenda, tabla/`aria-label`, patrón o etiqueta directa. (usage-costs: Gráficos accesibles)
- [x] 5.3 Crear `prototype/js/ui/stats.js`: KPIs de negocio (el badge "Datos de ejemplo" se retiró), sin métricas internas. (usage-costs: KPIs)
- [x] 5.4 Crear `prototype/js/ui/costs.js`: líneas de costo, barras consumo vs cupo con icono+etiqueta de estado, "Precios ilustrativos" junto al total y aviso de no-oferta. (usage-costs: Consumo frente a cupo, Rótulo ilustrativo)
- [x] 5.5 Crear `prototype/js/ui/narrative.js`: 5 secciones h2 en orden, "Borrador: confirmar en sesión 2", enlaces a constructor y costos, foco al h1/h2 al navegar. (validation-narrative: Orden, Navegación, Móvil)
- [x] 5.6 Crear `prototype/css/panels.css` con tokens únicamente; botón "Restaurar plantilla" cableado a `LOAD_TEMPLATE`. (logistics: Restaurar)
- [x] 5.7 Crear `prototype/js/main.js`: composition root; carga borrador o plantilla; suscribe vistas; debounce 500 ms del borrador. (logistics: Carga inicial, localStorage no disponible)

## Fase 6: Workflow, README y verificación estática

- [x] 6.1 (adaptado al repo independiente: triggers `main`/`workflow_dispatch`, sube `_site` con index.html, css, js, assets) Crear `.github/workflows/pages-prototype.yml`: `push` a `main` con `paths: prototype/**` y el propio workflow, `workflow_dispatch`, permisos `contents: read`, `pages: write`, `id-token: write`, sube solo `prototype`, entorno `github-pages`. (pages-deploy: Workflow aislado)
- [x] 6.2 Añadir paso `verify` previo al deploy: `node --check` por cada `.js`; falla si hay `*.test.js`/`*.spec.js`, `fetch(|XMLHttpRequest|WebSocket|EventSource` en `prototype/js`, `eslint-disable`, o `(src|href)="/` en `index.html`. (pages-deploy: Sitio estático, Rutas relativas, Ausencia de pruebas)
- [x] 6.3 Crear `prototype/README.md`: autonomía fuera de `src/`, CLAUDE.md no aplica, commit origen `f4fce1e`, precios ilustrativos, activar Pages > Source "GitHub Actions", `npx serve prototype`. (pages-deploy: README completo)
- [x] 6.4 Añadir al README el smoke de consola (`import('./js/domain/yaml.js')`, `to-wire`, `metrics`, `costs`) y el checklist manual (mouse/teclado/táctil, claro/oscuro, 375 px, contraste AA, reduced-motion, rótulos, receta colapsada, Network solo fuentes, fuentes bloqueadas). (dal-theme: Sin conexión a Google Fonts)

## Fase 7: Verificación final

- [ ] 7.1 Ejecutar localmente los greps y `node --check` del paso `verify`; grep de colores literales fuera de la capa primitive y de jerga en textos visibles. (dal-theme: Sin hardcodeados; logistics: Sin jerga)
- [ ] 7.2 Ejecutar `npm run lint` (`--max-warnings 0`), `type-check`, `vitest run` y `build`: deben seguir en verde. (pages-deploy: Lint sin cambios)
- [ ] 7.3 Confirmar con `git status` que no cambiaron `eslint.config.js`, `vite.config.ts`, `ci-cd.yml` ni los tres archivos sin commitear.
- [ ] 7.4 Smoke: `npx serve prototype`, recorrer el checklist del README; verificar cifras idénticas en dos cargas.

## Decisiones que requieren al usuario

- Visibilidad de Pages: repo privado exige plan de pago y el sitio queda público; plan B, repo público aparte o zip.
- Cifras de `pricing.config.js`: valores ilustrativos hasta la sesión 2; el usuario debe aprobar o proveer los de ejemplo.
- Ruta de `pricing.config.js`: el spec dice `prototype/js/pricing.config.js`, el diseño `prototype/js/data/pricing.config.js`. Se asume la del spec; confirmar.
- Empresa, proceso y variables X, Y, Z de la narrativa: se definen en la sesión 2.
