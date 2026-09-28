# prototype-dal-theme Specification

## Purpose

Identidad visual DAL por defecto en `prototype/`, con tokens en 3 capas, modo claro/oscuro y accesibilidad base.

## Requirements

### Requirement: Tokens en tres capas

El prototipo MUST definir tokens como CSS custom properties en capas primitive, semantic y component, copiados de `src/styles/tokens.css` (commit origen `f4fce1e`, anotado en `prototype/README.md`). Los estilos de componentes MUST NOT contener colores, tamaños ni radios hardcodeados. El prototipo MUST NOT importar nada de `src/`.

#### Scenario: Sin valores hardcodeados

- GIVEN los archivos de `prototype/css/` excepto la capa primitive
- WHEN se buscan literales de color (`#hex`, `rgb(`) fuera de las definiciones de tokens
- THEN no hay coincidencias en reglas de componentes

#### Scenario: Sin imports de src

- GIVEN los módulos de `prototype/`
- WHEN se revisan sus rutas de import y `href`/`src`
- THEN ninguna apunta a `src/` ni usa rutas absolutas

### Requirement: Modo claro y oscuro

El prototipo MUST ofrecer claro y oscuro con un botón de tema visible en la barra superior (junto al avatar) y en la pantalla de acceso, además del control del panel de cuenta, todos sincronizados. En la primera visita MUST respetar `prefers-color-scheme`; después, la preferencia guardada en `localStorage` (con degradación segura si no está disponible). Un script previo al primer pintado MUST aplicar `data-theme` en `<html>` y `<meta name="theme-color">` sin parpadeo. El botón MUST medir ≥44px y tener `aria-label` dinámico ("Cambiar a modo oscuro"/"Cambiar a modo claro").

#### Scenario: Cambio a oscuro

- GIVEN la página cargada en modo claro
- WHEN la persona activa el conmutador de tema
- THEN `<html>` tiene `data-theme="dark"` y los tokens semantic cambian

#### Scenario: Primera visita con sistema oscuro

- GIVEN sin preferencia guardada y `prefers-color-scheme: dark`
- WHEN se carga la página
- THEN `<html>` tiene `data-theme="dark"` desde el primer pintado

### Requirement: Marca, tipografía y fallback

El prototipo MUST mostrar el logo DAL desde `prototype/assets/` y usar las familias de fuente DAL con fallback `system-ui`. Todas las rutas MUST ser relativas.

#### Scenario: Sin conexión a Google Fonts

- GIVEN no hay acceso a fonts.googleapis.com
- WHEN se carga la página
- THEN el texto se muestra legible con `system-ui` sin romper el layout

### Requirement: Accesibilidad visual

El texto y los componentes de interfaz MUST cumplir contraste 4.5:1 (texto) y 3:1 (componentes) en claro y oscuro. El foco MUST ser visible con un `outline` reforzado (≥2px, ≥3:1), no solo el anillo de 10 %. Los objetivos táctiles MUST medir ≥44px. El significado MUST NOT depender solo del color (forma, icono SVG y texto). Con `prefers-reduced-motion: reduce` las transiciones y animaciones MUST desactivarse.

#### Scenario: Foco por teclado

- GIVEN un control interactivo
- WHEN recibe foco con Tab
- THEN muestra un contorno visible con contraste ≥3:1 contra su fondo

#### Scenario: Movimiento reducido

- GIVEN el sistema con `prefers-reduced-motion: reduce`
- WHEN se abre un panel o cambia una vista
- THEN no hay transición ni animación

#### Scenario: Móvil sin desbordamiento

- GIVEN un viewport de 360px de ancho
- WHEN se recorre cada vista
- THEN no aparece scroll horizontal de página
