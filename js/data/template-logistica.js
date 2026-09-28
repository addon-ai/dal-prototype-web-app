// Plantilla logistica precargada: seguimiento de envios con atencion de reclamos.
// Dato estatico y editable. Empresa y proceso: "a definir en sesion 2".
import { defaultSettings } from './catalog.js';

function node(id, step, label, x, y, overrides = {}) {
  return {
    id,
    step,
    label,
    x,
    y,
    settings: { ...defaultSettings(step), nombre: label, ...overrides },
  };
}

const TEMPLATE = {
  aDefinirSesion2: true,
  titulo: 'Asistente de seguimiento de envíos',
  descripcion: 'Atención de consultas de estado y reclamos por retrasos.',
  graph: {
    id: 'proto-seguimiento-envios',
    name: 'Asistente de seguimiento de envíos',
    version: '1.0.0',
    nodes: [
      node('guard_in', 'seguridad', 'Filtrar datos sensibles', 30, 150),
      node('clasificar', 'entiende', 'Entender la consulta', 230, 150, {
        creatividad: 0.2,
        largo: 300,
      }),
      node('buscar_politica', 'documentos', 'Consultar políticas y manuales', 440, 30, {
        fuente: 'politicas-compensacion',
      }),
      node('consultar_tms', 'sistemas', 'Consultar sistema de transporte', 440, 270),
      node('regla_retraso', 'regla', '¿Retraso crítico?', 660, 270),
      node('aprobar', 'aprobacion', 'Aprobación del supervisor', 660, 390),
      node('responder', 'entiende', 'Redactar respuesta', 860, 150, {
        creatividad: 0.4,
        largo: 500,
      }),
    ],
    edges: [
      { id: 'e1', from: 'guard_in', to: 'clasificar' },
      {
        id: 'e2',
        from: 'clasificar',
        to: 'buscar_politica',
        condition: 'si pregunta por políticas',
      },
      { id: 'e3', from: 'clasificar', to: 'consultar_tms', condition: 'si pregunta por un envío' },
      { id: 'e4', from: 'consultar_tms', to: 'regla_retraso' },
      { id: 'e5', from: 'regla_retraso', to: 'aprobar', condition: 'si hay retraso crítico' },
      { id: 'e6', from: 'regla_retraso', to: 'responder', condition: 'si no hay retraso crítico' },
      { id: 'e7', from: 'buscar_politica', to: 'responder' },
      { id: 'e8', from: 'aprobar', to: 'responder' },
    ],
  },
};

export const TEMPLATE_LOGISTICA = Object.freeze(TEMPLATE);

// Copia profunda editable, para cargar y para "Restaurar plantilla".
export function cloneTemplateGraph() {
  return structuredClone(TEMPLATE.graph);
}
