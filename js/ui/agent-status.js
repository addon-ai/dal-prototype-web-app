// Estados de un agente: rotulo, glifo (refuerzo no cromatico del color) y clase de insignia.
export const STATUS = {
  activo: { label: 'Activo', path: 'M5 12l5 5 9-10', cls: 'ok' },
  borrador: { label: 'Borrador', path: 'M4 20h4L19 9l-4-4L4 16z', cls: 'draft' },
  'en-revision': {
    label: 'En revisión',
    path: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z',
    cls: 'review',
  },
};
