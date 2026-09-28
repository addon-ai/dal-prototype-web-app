# prototype-canvas-builder Specification

## Purpose

Constructor de pasos tipo n8n, en lenguaje de negocio, operable con mouse, teclado y táctil.

## Requirements

### Requirement: Paleta de pasos en lenguaje de negocio

La paleta MUST ofrecer ~9 pasos: Entiende y responde, Consulta documentos de la empresa, Lee documentos, Conecta con tus sistemas, Regla de negocio, Control de seguridad, Aprobación de una persona, Avisa, Prepara datos. Cada paso MUST distinguirse por forma, icono SVG y texto. La UI principal MUST NOT mostrar jerga técnica (nodo, arista, LLM, RAG, token, JSON, guardrail).

#### Scenario: Paleta visible

- GIVEN la vista del constructor
- WHEN se carga
- THEN la paleta lista los pasos con nombre de negocio, icono y forma propios

### Requirement: Agregar y mover pasos con puntero

La persona MUST poder arrastrar un paso de la paleta al lienzo SVG y reubicar pasos existentes, con Pointer Events (mouse y táctil).

#### Scenario: Arrastrar desde la paleta

- GIVEN un lienzo con la plantilla
- WHEN se arrastra "Avisa" al lienzo y se suelta
- THEN aparece un paso nuevo en esa posición

#### Scenario: Táctil

- GIVEN un dispositivo táctil
- WHEN se arrastra un paso con un dedo
- THEN el paso se mueve y la página no hace scroll durante el gesto

### Requirement: Alternativa de teclado

Toda acción de arrastre MUST tener alternativa de teclado: Enter agrega el paso de la paleta enfocado; las flechas mueven el paso seleccionado; Supr lo elimina; existe una acción para conectar pasos sin puntero. Cada paso MUST tener `aria-label` y foco visible. Los cambios SHOULD anunciarse en una región `aria-live`.

#### Scenario: Agregar con teclado

- GIVEN el foco en un paso de la paleta
- WHEN se pulsa Enter
- THEN se agrega el paso al lienzo, queda seleccionado y se anuncia

#### Scenario: Mover con flechas

- GIVEN un paso seleccionado
- WHEN se pulsa la flecha derecha
- THEN el paso se desplaza y las conexiones lo siguen

### Requirement: Conexiones y decisiones

Los pasos MUST poder conectarse con flechas "luego". Una conexión MAY llevar una condición "si …, entonces …" y MUST distinguirse por etiqueta y trazo, no solo por color. El lienzo MUST NOT permitir conexiones duplicadas ni de un paso a sí mismo.

#### Scenario: Conexión condicional

- GIVEN dos pasos
- WHEN se conectan y se escribe la condición "si es reclamo"
- THEN la flecha muestra la etiqueta y la receta registra la condición

#### Scenario: Conexión inválida

- GIVEN un paso
- WHEN se intenta conectar consigo mismo
- THEN no se crea la conexión y se informa el motivo

### Requirement: Panel de ajustes simple

Al seleccionar un paso, el panel MUST mostrar 2 a 4 ajustes de negocio (p. ej. nombre, creatividad precisa↔creativa, largo de respuesta) y MUST NOT exponer `state_schema`, `llm_config` ni parámetros de proveedor.

#### Scenario: Editar ajuste

- GIVEN un paso "Entiende y responde" seleccionado
- WHEN se cambia el nombre
- THEN el lienzo y la receta reflejan el cambio de inmediato

### Requirement: Móvil

En viewport <768px la paleta MUST presentarse como lista u hoja inferior con objetivos ≥44px.

#### Scenario: Paleta en móvil

- GIVEN un viewport de 360px
- WHEN se abre la paleta
- THEN los ítems miden ≥44px de alto y no hay scroll horizontal
