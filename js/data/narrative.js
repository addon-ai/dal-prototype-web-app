// Narrativa de validacion (BORRADOR). Variables X, Y y Z: "por definir", sin cifras.
export const NARRATIVE_STATUS = 'Borrador: confirmar en sesión 2';
export const PENDING_LABEL = 'por definir';

export const NARRATIVE = Object.freeze({
  titulo: 'Por qué este asistente',
  estado: NARRATIVE_STATUS,
  elementos: [
    {
      id: 'problema',
      titulo: 'Problema',
      texto:
        'Las consultas de estado de envío y los reclamos saturan a atención al cliente. Las respuestas son lentas y los criterios de compensación son inconsistentes.',
    },
    {
      id: 'solucion',
      titulo: 'Solución',
      texto:
        'El asistente entiende la consulta, revisa el sistema de transporte y las políticas, aplica la regla de retraso y pide la aprobación del supervisor solo si hay compensación.',
    },
    {
      id: 'decisor',
      titulo: 'Usuario y decisor',
      texto:
        'Usuario: agente de servicio al cliente y supervisor. Decisor: gerente de operaciones o de servicio al cliente.',
    },
    {
      id: 'resultado',
      titulo: 'Resultado esperado',
      texto:
        'Menor tiempo de respuesta y más casos resueltos sin intervención humana, con el costo por caso a la vista.',
    },
    {
      id: 'hipotesis',
      titulo: 'Hipótesis',
      texto:
        'Si el asistente resuelve al menos {X}% de las consultas de estado en menos de {Y} minutos, el equipo reduce {Z} horas por semana con un costo por caso menor que el actual.',
      variables: [
        { id: 'X', descripcion: 'Porcentaje de consultas resueltas', valor: PENDING_LABEL },
        { id: 'Y', descripcion: 'Minutos de respuesta', valor: PENDING_LABEL },
        { id: 'Z', descripcion: 'Horas por semana que se reducen', valor: PENDING_LABEL },
      ],
    },
  ],
  pendientes: ['Cómo funciona hoy el proceso', 'Quién participa', 'Qué indicador mejora'],
  enlaces: [
    { id: 'ir-constructor', texto: 'Ver el constructor', view: 'constructor' },
    { id: 'ir-costos', texto: 'Ver costos estimados', view: 'resultados' },
  ],
});
