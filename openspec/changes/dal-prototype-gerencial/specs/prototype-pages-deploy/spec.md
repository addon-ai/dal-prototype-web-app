# prototype-pages-deploy Specification

## Purpose

Publicación aislada en GitHub Pages sin afectar el build, el CI ni la imagen de la app.

## Requirements

### Requirement: Workflow aislado de Pages

Debe existir `.github/workflows/pages-prototype.yml` que se dispare por `push` a `main` con `paths: prototype/**` (y el propio workflow) y por `workflow_dispatch`, con permisos mínimos (`contents: read`, `pages: write`, `id-token: write`), y publique solo el directorio `prototype`. `ci-cd.yml` MUST NOT modificarse.

#### Scenario: Cambio fuera del prototipo

- GIVEN un push a `main` que no toca `prototype/**`
- WHEN se evalúan los disparadores
- THEN el workflow de Pages no se ejecuta

#### Scenario: Cambio en el prototipo

- GIVEN un push a `main` que modifica `prototype/index.html`
- WHEN corre el workflow
- THEN se sube `prototype` como artefacto y se despliega en el entorno `github-pages`

### Requirement: Sitio 100% estático

El sitio publicado MUST ser estático, sin build, backend, base de datos, API ni autenticación. Las únicas peticiones externas permitidas son las fuentes de Google Fonts, con fallback `system-ui`.

#### Scenario: Peticiones de red

- GIVEN el sitio desplegado
- WHEN se recorren todas las vistas
- THEN las únicas peticiones fuera del origen son a Google Fonts y ninguna es `fetch`/XHR a una API

### Requirement: Rutas relativas

Todo recurso del prototipo MUST referenciarse con rutas relativas para funcionar bajo `/dal-web-app/`.

#### Scenario: Subruta

- GIVEN el sitio servido en `/dal-web-app/`
- WHEN se cargan CSS, JS y assets
- THEN ninguno devuelve 404 y no hay rutas que empiecen con `/`

### Requirement: Exclusión en Docker

`.dockerignore` MUST incluir `prototype`.

#### Scenario: Contexto de build

- GIVEN `.dockerignore` actualizado
- WHEN se construye la imagen
- THEN `prototype/` no forma parte del contexto

### Requirement: Herramientas del repo intactas

`prototype/` MUST NOT contener archivos `*.test.js` ni `*.spec.js` ni comentarios `eslint-disable`. `eslint.config.js`, `vite.config.ts` y `tsconfig*` MUST NOT modificarse. `npm run lint`, `type-check`, `vitest` y `build` MUST seguir pasando.

#### Scenario: Lint sin cambios de configuración

- GIVEN `prototype/js/*.js` presentes
- WHEN se ejecuta `npm run lint`
- THEN sale con código 0 bajo `--max-warnings 0`

#### Scenario: Ausencia de pruebas y directivas

- GIVEN el árbol `prototype/`
- WHEN se buscan `*.test.js`, `*.spec.js` y `eslint-disable`
- THEN no hay coincidencias

### Requirement: Documentación del deslinde

`prototype/README.md` MUST documentar que el prototipo es autónomo fuera de `src/`, que las reglas de CLAUDE.md para `src/` no aplican, el commit origen de tokens (`f4fce1e`), el aviso de precios ilustrativos y la activación de Settings > Pages > Source "GitHub Actions".

#### Scenario: README completo

- GIVEN `prototype/README.md`
- WHEN se revisa
- THEN contiene los cuatro puntos
