# prototype-usage-costs Specification

## Purpose

Estadísticas simuladas y costos por servicio facturable al consumidor, con cifras ilustrativas parametrizadas.

## Requirements

### Requirement: KPIs de negocio simulados

La vista MUST mostrar casos atendidos (hoy/semana/mes), tasa de éxito, tiempo típico y peor caso de respuesta, casos bloqueados por seguridad, aprobaciones pendientes y cumplimiento de plazo. Los datos MUST ser deterministas (semilla fija) y rotulados "Datos de ejemplo". MUST NOT mostrar métricas internas (DLQ, circuit-breaker, calidad RAG, salud de proveedores).

#### Scenario: Rótulo de datos

- GIVEN la vista de estadísticas
- WHEN se carga
- THEN se lee "Datos de ejemplo" y dos cargas producen las mismas cifras

### Requirement: Datos estáticos, sin servicios

Estadísticas, consumo y costos MUST provenir de datos mock estáticos embebidos en JS/JSON dentro de `prototype/`. El prototipo MUST NOT conectarse a base de datos, backend, API ni servicio alguno, ni usar autenticación.

#### Scenario: Sin red propia

- GIVEN la página cargada con la red bloqueada salvo Google Fonts
- WHEN se recorren estadísticas y costos
- THEN todo se muestra y no hay peticiones `fetch`/XHR a APIs propias ni de terceros

### Requirement: Gráficos accesibles

Los gráficos MUST ser SVG propio, con título, leyenda y alternativa textual (`<title>`/`aria-label` o tabla). El significado MUST NOT depender solo del color (patrón, forma o etiqueta directa).

#### Scenario: Alternativa textual

- GIVEN un gráfico de casos en el tiempo
- WHEN lo lee un lector de pantalla
- THEN expone resumen y valores en texto

### Requirement: Costo por servicio facturable

La pantalla MUST listar una línea por servicio facturable al consumidor: plan, casos atendidos, consumo de IA, base de conocimiento, lectura de documentos y usuarios con licencia; avatar/voz e integraciones MAY aparecer como opcionales. MUST NOT mostrar costo base del proveedor, margen, recargos desglosados ni edición de tarifario.

#### Scenario: Líneas de costo

- GIVEN la vista de costos
- WHEN se revisa
- THEN cada línea muestra concepto, cantidad, tarifa unitaria y monto, más subtotal y total estimado

### Requirement: Consumo frente a cupo

Cada servicio con cupo MUST mostrar barra de consumo vs cupo incluido con porcentaje en texto y estado (normal/aviso/crítico) indicado por icono y etiqueta además del color. El excedente MUST valorarse con la tarifa unitaria.

#### Scenario: Excedente

- GIVEN un consumo de 120 % del cupo de documentos
- WHEN se calcula la factura estimada
- THEN el 20 % excedente se cobra a la tarifa unitaria y el estado es "crítico" con icono y texto

### Requirement: Cifras en un solo archivo

Todos los precios, cupos y descuentos MUST definirse únicamente en `prototype/js/pricing.config.js`. Los demás módulos MUST NOT contener cifras de precio.

#### Scenario: Cambiar una tarifa

- GIVEN una modificación de una tarifa en `pricing.config.js`
- WHEN se recarga
- THEN la factura estimada refleja el cambio sin editar otro archivo

### Requirement: Rótulo "ilustrativo"

Todo monto y tarifa MUST ir junto al rótulo "Precios ilustrativos" visible en la misma pantalla, y el total estimado MUST indicar que no constituye oferta.

#### Scenario: Rótulo visible

- GIVEN la vista de costos
- WHEN se observa
- THEN "Precios ilustrativos" se ve junto al total sin interacción previa
