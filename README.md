# Prototipo gerencial de DAL

Sitio estático (HTML + CSS + JS vanilla con módulos ES) para demostrar DAL a perfiles gerenciales.
No usa build, dependencias npm ni red: toda la data es mock embebida en `js/data/`.

## Origen

Repositorio independiente: "Prototipo gerencial de DAL / Addon AI". No depende de ninguna app externa.
Los tokens visuales (`css/tokens.css`) se copiaron de los estándares de diseño de la app DAL en su
commit `f4fce1e`. Las reglas de React/TypeScript de la app no aplican aquí.
`eslint-disable` está prohibido en `js/`.

## Datos mock y precios ilustrativos

Todas las cifras (métricas, costos, precios por modelo) son **datos mock ilustrativos**, generados de
forma determinista a partir del grafo. No representan precios reales ni resultados de producción.

## Constructor (app shell a pantalla completa)

La app ocupa 100vw x 100dvh: barra superior compacta, paleta lateral colapsable (con busqueda y
acordeon por categoria), lienzo central con zoom/paneo (rueda, arrastrar el fondo, botones, teclas
`+`, `-`, `0`), minimapa, controles flotantes y "Probar recorrido" (simulacion con datos mock).
El inspector es una tercera columna desde 1280 px (reserva su ancho en la rejilla), un panel
lateral flotante entre 768 y 1279 px y
una hoja inferior en movil. El zoom/paneo y la simulacion viven en `ui` del store y no forman parte
de la receta. Los tokens (`css/tokens.css`) siguen la app DAL con contraste AA (ver su cabecera).

## Agentes, cuenta y rutas

- **Agentes** (`#/agentes`): colección mock de 7 agentes de logística (`js/data/agents/`), con filtros
  Todos/Míos/De mi organización, búsqueda, orden y tarjeta "Nuevo agente". Cada agente tiene su grafo,
  receta, resultados y costos; el borrador se guarda por agente (`dal-proto-draft-v2:<id>`).
- **Avatares**: 14 avatares SVG en línea (`js/data/avatars.js`, dibujo en `js/ui/avatar.js`), sin imágenes
  externas. Se editan junto al nombre con el botón «Editar» del constructor (diálogo accesible).
- **Constructor = agente nuevo**: la pestaña «Constructor» crea un agente en blanco («Agente nuevo N»).
  Los agentes creados y los cambios de nombre/avatar se guardan en `dal-proto-agents-v1` (localStorage,
  opcional); los creados se pueden eliminar con confirmación.
- **Rutas por hash**: `#/agentes`, `#/constructor/:id`, `#/resultados/:id` (solo hash, sin red).
- **Cuenta**: el avatar de la barra abre un panel con usuario y empresa de ejemplo, tema (también visible en la barra y en el acceso), cristal y
  "Cerrar sesión".

## Acceso de demostración y efecto cristal

- **Inicio de sesión (mock)**: en cada carga se muestra primero una pantalla de acceso. "Iniciar sesión"
  (o Enter) entra a la colección de Agentes (o al destino pedido por hash, si es válido), sin validar nada y aceptando campos vacíos. No se envía, guarda
  ni registra ninguna credencial (los campos se vacían al enviar). "Cerrar sesión" (barra superior) vuelve
  al acceso. Mientras está visible, el resto de la app queda `inert`.
- **Efecto cristal (Liquid Glass)**: activado por defecto; el botón de la barra superior lo alterna
  (`data-glass="on|off"` en `<html>`, preferencia opcional en localStorage `dal-proto-glass`). Tokens
  `--glass-*` en `css/tokens.css` (3 capas) y reglas en `css/glass.css`. Con `off`, sin soporte de
  `backdrop-filter` o con `prefers-reduced-transparency`, las superficies son sólidas.
- **Tema claro/oscuro**: botón sol/luna en la barra (junto al avatar), en el acceso y en la cuenta, todos sincronizados
  (`aria-label` dinámico, 44 px). Primera visita: `prefers-color-scheme`; después, `dal-proto-theme` en
  `localStorage` (opcional). El script de `index.html` fija `data-theme` y `theme-color` antes del primer pintado.
  Contraste de pares de tokens (WCAG): mínimo 4,66:1 en claro y 4,85:1 en oscuro para texto (3:1 en no textuales).
- **Sin badge "Datos de ejemplo"**: se retiró de barra, Agentes, cuenta, Resultados y constructor; se conservan
  "Precios ilustrativos", los avisos de "no es una oferta" y la marca "(ejemplo)" de la empresa ficticia.
- **Contraste del efecto cristal**: alfas mínimos de superficie medidos con WCAG (>= 4.5:1) sobre el peor
  fondo (orbes apilados y contenido saturado al 30 % detrás): claro 4,59-4,75; oscuro 4,54-4,72.
- **Ajustes del paso contraíbles**: el panel derecho se contrae a un riel (botón con `aria-expanded`;
  Escape lo contrae; se abre solo al seleccionar un paso). Estado opcional en `dal-proto-inspector`.

## Abrirlo en local

```bash
python3 -m http.server 8080   # o: npx serve .
```

Luego abrir `http://localhost:8080/`. Los módulos ES requieren servidor HTTP; `file://` no funciona.

## Publicación (GitHub Pages)

URL: https://addon-ai.github.io/dal-prototype-web-app/

1. En Settings > Pages, elegir Source: "GitHub Actions" (el workflow intenta habilitarlo con `enablement: true`).
2. El workflow `.github/workflows/pages-prototype.yml` corre en push a `main` (ignora `openspec/**` y `*.md`) o manualmente (`workflow_dispatch`).
3. En pull requests hacia `main` solo corre el job `verify`; `deploy` solo en `main` o `workflow_dispatch`.
4. El artefacto publicado (`_site`) incluye solo `index.html`, `css/`, `js/` y `assets/`.
5. El entorno `github-pages` puede restringir el deploy a la rama por defecto (Settings > Environments).
6. El sitio se sirve bajo `/dal-prototype-web-app/`; por eso todas las rutas son relativas (`./`).

El job `verify` comprueba: `node --check` de cada `.js`, ausencia de `fetch(`, `XMLHttpRequest`,
`WebSocket`, `EventSource` y `eslint-disable`, ausencia de `*.test.js`/`*.spec.js` y de rutas absolutas
en `index.html`.

## Smoke de consola

Con el sitio abierto, en la consola del navegador:

```js
const yaml = await import('./js/domain/yaml.js');
console.log(Object.keys(yaml));
```

Repetir con `./js/domain/to-wire.js`, `./js/domain/metrics.js` y `./js/domain/costs.js`: cada módulo
debe cargar sin errores y exponer sus funciones exportadas.

## Checklist manual de verificación

- [ ] Mouse: seleccionar, arrastrar y conectar nodos en el lienzo.
- [ ] Teclado: recorrer con Tab, operar el lienzo y los paneles solo con teclado; foco siempre visible.
- [ ] Táctil: arrastre y toques funcionan en un dispositivo táctil o emulado.
- [ ] Tema claro y oscuro: botón visible en la barra superior y en el acceso; la primera visita sigue `prefers-color-scheme` y luego la preferencia guardada; ambos temas legibles, con cristal activado y desactivado.
- [ ] No hay badges "Datos de ejemplo" en ninguna vista (se conservan "Precios ilustrativos" y "(ejemplo)" de la empresa ficticia).
- [ ] Ancho de 375 px: sin scroll horizontal de página; paneles utilizables.
- [ ] Contraste AA: texto normal >= 4.5:1 y texto grande/componentes >= 3:1 en ambos temas (DevTools > inspector de contraste).
- [ ] `prefers-reduced-motion`: sin animaciones no esenciales.
- [ ] Rótulos: cada control tiene nombre accesible y textos sin jerga técnica.
- [ ] Receta colapsada por defecto y se expande con teclado.
- [ ] Network: solo se solicitan las fuentes de Google Fonts, ninguna otra petición externa.
- [ ] Fuentes bloqueadas: con Google Fonts bloqueado, la página usa fallbacks y sigue siendo usable.
- [ ] Cifras idénticas entre dos cargas (determinismo).

## Narrativa de validación (retirada de la app; borrador)

La pestaña "Narrativa" se quitó de la app; su contenido se conserva aquí. Estado: borrador, confirmar en
sesión 2. Las variables X, Y y Z están "por definir" (sin cifras).

- **Problema**: las consultas de estado de envío y los reclamos saturan a atención al cliente; las respuestas
  son lentas y los criterios de compensación son inconsistentes.
- **Solución**: el asistente entiende la consulta, revisa el sistema de transporte y las políticas, aplica la
  regla de retraso y pide la aprobación del supervisor solo si hay compensación.
- **Usuario y decisor**: usuario, agente de servicio al cliente y supervisor; decisor, gerente de operaciones
  o de servicio al cliente.
- **Resultado esperado**: menor tiempo de respuesta y más casos resueltos sin intervención humana, con el
  costo por caso a la vista.
- **Hipótesis**: si el asistente resuelve al menos {X}% de las consultas de estado en menos de {Y} minutos,
  el equipo reduce {Z} horas por semana con un costo por caso menor que el actual. X: porcentaje de consultas
  resueltas; Y: minutos de respuesta; Z: horas por semana que se reducen (todas por definir).
- **Pendientes**: cómo funciona hoy el proceso; quién participa; qué indicador mejora.

La spec `openspec/changes/dal-prototype-gerencial/specs/prototype-validation-narrative/` describe la vista
que existió; queda como histórico.
