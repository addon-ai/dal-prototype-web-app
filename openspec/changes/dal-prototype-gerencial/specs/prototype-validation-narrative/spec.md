# prototype-validation-narrative Specification

## Purpose

Pantalla de narrativa de validación (borrador) para que un gerente entienda problema, intervención y resultado.

## Requirements

### Requirement: Secuencia de cinco elementos

La pantalla MUST presentar en orden: Problema, Solución, Usuario/Decisor, Resultado esperado e Hipótesis, con el contenido del borrador de `proposal.md`, en español de negocio.

#### Scenario: Orden y contenido

- GIVEN la pantalla de narrativa
- WHEN se carga
- THEN los cinco encabezados aparecen en el orden indicado, cada uno con texto

### Requirement: Rótulo de borrador

La pantalla MUST indicar "Borrador: confirmar en sesión 2". Las variables X, Y y Z de la hipótesis MUST mostrarse como "por definir" y MUST NOT tener valores numéricos inventados.

#### Scenario: Hipótesis sin cifras

- GIVEN la tarjeta de Hipótesis
- WHEN se lee
- THEN X, Y y Z figuran como "por definir"

### Requirement: Vínculo con el prototipo

La pantalla SHOULD enlazar al constructor y a los costos, y MUST ser alcanzable por teclado desde la navegación principal.

#### Scenario: Navegación

- GIVEN cualquier vista
- WHEN se navega con Tab a "Narrativa" y se pulsa Enter
- THEN se muestra la narrativa y el foco pasa a su encabezado

### Requirement: Lectura en móvil

El texto MUST leerse en viewport de 360px sin scroll horizontal, con jerarquía de encabezados semánticos (h1/h2).

#### Scenario: Móvil

- GIVEN un viewport de 360px
- WHEN se muestra la narrativa
- THEN no hay desbordamiento horizontal y los cinco elementos son legibles
