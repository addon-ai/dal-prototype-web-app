# prototype-logistics-scenario Specification

## Purpose

Plantilla logística precargada (seguimiento de envíos con atención de reclamos), editable y marcada como borrador.

## Requirements

### Requirement: Plantilla precargada

Al abrir el prototipo, el lienzo MUST cargar la plantilla "Asistente de seguimiento de envíos" con al menos: control de seguridad, entiende la consulta, consulta documentos/políticas, conecta con el sistema de transporte, regla de retraso, aprobación del supervisor y redacta respuesta, con sus conexiones y decisiones.

#### Scenario: Carga inicial

- GIVEN una primera visita
- WHEN termina la carga
- THEN el lienzo muestra los pasos y conexiones de la plantilla sin acción previa

### Requirement: Datos mock sin servicios

La plantilla MUST definirse como dato estático embebido en `prototype/`. El prototipo MUST NOT usar base de datos, backend, API, autenticación ni persistencia en servidor. MAY guardar el borrador del usuario en `localStorage`, y la app MUST funcionar igual sin él.

#### Scenario: localStorage no disponible

- GIVEN `localStorage` bloqueado o lanza error
- WHEN se carga y se edita la plantilla
- THEN todo funciona y solo se pierde la persistencia del borrador

### Requirement: Rótulo de borrador

La vista MUST mostrar visible el texto "a definir en sesión 2" indicando que empresa y proceso no son definitivos.

#### Scenario: Rótulo presente

- GIVEN la plantilla cargada
- WHEN se observa el encabezado del escenario
- THEN se lee "a definir en sesión 2"

### Requirement: Editable y restaurable

La persona MUST poder agregar, quitar, renombrar y reconectar pasos de la plantilla. Debe existir una acción "Restaurar plantilla" que devuelva el estado inicial.

#### Scenario: Restaurar

- GIVEN una plantilla modificada
- WHEN se activa "Restaurar plantilla"
- THEN el lienzo, la receta y las estadísticas vuelven al estado inicial

### Requirement: Vocabulario de negocio

Los textos de la plantilla MUST estar en español de negocio (asistente, paso, caso atendido) y MUST NOT usar términos técnicos en la UI principal.

#### Scenario: Sin jerga

- GIVEN la vista principal
- WHEN se revisan sus textos visibles
- THEN no aparecen "nodo", "arista", "LLM", "RAG", "token" ni "JSON" fuera de la receta técnica
