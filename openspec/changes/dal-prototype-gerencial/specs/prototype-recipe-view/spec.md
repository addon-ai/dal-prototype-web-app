# prototype-recipe-view Specification

## Purpose

Vista técnica "Receta técnica (para TI)" con JSON y YAML del asistente, en vivo y colapsada.

## Requirements

### Requirement: Colapsada por defecto

La receta MUST estar dentro de un control colapsable rotulado "Receta técnica (para TI)", cerrado al cargar, con `aria-expanded` correcto y operable por teclado.

#### Scenario: Estado inicial

- GIVEN la primera carga
- WHEN se observa la vista
- THEN la receta está colapsada y su contenido no es visible

#### Scenario: Abrir con teclado

- GIVEN el foco en el control
- WHEN se pulsa Enter o Espacio
- THEN se expande y `aria-expanded="true"`

### Requirement: JSON y YAML con forma del wire

La receta MUST ofrecer pestañas JSON y YAML con `graph_id`, `name`, `version`, `status`, `nodes` (`id`, `type`, `label`, config plana) y `edges` (`from`, `to`, `condition?`). MUST NOT incluir `state_schema` ni `llm_config`. El YAML MUST generarse con un serializador propio, sin dependencias.

#### Scenario: Forma del wire

- GIVEN la plantilla cargada
- WHEN se abre la pestaña JSON
- THEN el texto es JSON válido con `nodes` y `edges`, y cada arista condicional lleva `condition`

#### Scenario: YAML equivalente

- GIVEN el mismo estado
- WHEN se abre la pestaña YAML
- THEN contiene los mismos pasos y conexiones que el JSON

### Requirement: Actualización en vivo

Cualquier cambio en el lienzo o en el panel de ajustes MUST reflejarse en JSON y YAML sin recargar.

#### Scenario: Agregar paso

- GIVEN la receta abierta
- WHEN se agrega un paso al lienzo
- THEN aparece un nuevo elemento en `nodes` de ambos formatos

### Requirement: Copiar

Debe existir un botón "Copiar" que copie el formato activo y confirme con texto y `aria-live`. Si el portapapeles falla, MUST informar sin romper la vista.

#### Scenario: Copiar

- GIVEN la pestaña YAML activa
- WHEN se pulsa "Copiar"
- THEN el portapapeles recibe el YAML y se muestra "Copiado"

#### Scenario: Portapapeles no disponible

- GIVEN un navegador que rechaza la escritura
- WHEN se pulsa "Copiar"
- THEN se muestra un aviso de error y el texto sigue seleccionable
