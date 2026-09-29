// Estados de un agente: rotulo, glifo (refuerzo no cromatico del color) y clase de insignia.
// El anillo del avatar usa ademas un trazo distinto: solido (activo), guiones (borrador), puntos (inactivo).
export const STATUS = {
  borrador: { label: 'Borrador', path: 'M4 20h4L19 9l-4-4L4 16z', cls: 'draft', action: 'Activar', next: 'activo' },
  activo: { label: 'Activo', path: 'M5 12l5 5 9-10', cls: 'ok', action: 'Desactivar', next: 'inactivo' },
  inactivo: { label: 'Inactivo', path: 'M8 5v14M16 5v14', cls: 'off', action: 'Activar', next: 'activo' },
};
