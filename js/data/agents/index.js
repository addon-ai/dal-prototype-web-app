// Coleccion mock de agentes de la empresa de ejemplo. Sin red; cada agente tiene su propio grafo.
import { cloneTemplateGraph } from '../template-logistica.js';
import { RECLAMOS, COTIZACION, CONCILIACION } from './logistica-a.js';
import { CITAS, ALERTAS, ADUANA } from './logistica-b.js';

export const ME = 'Camila Rojas';

// owner: nombre del propietario; scope: 'personal' | 'organizacion'; edited: dias desde la ultima edicion
function meta(id, name, description, status, owner, scope, edited, casos, auto, graph) {
  return { id, name, description, status, owner, scope, edited, casos, auto, graph };
}

const SEED = [
  meta('seguimiento-envios', 'Asistente de seguimiento de envíos',
    'Responde dónde está cada envío y atiende los retrasos con el criterio de la empresa.',
    'activo', ME, 'organizacion', 1, 3000, 82, cloneTemplateGraph()),
  meta('atencion-reclamos', 'Atención de reclamos',
    'Recibe reclamos de clientes, revisa el envío y propone la compensación correcta.',
    'activo', 'Andrés Salazar', 'organizacion', 3, 1200, 64, RECLAMOS),
  meta('cotizacion-fletes', 'Cotización de fletes',
    'Convierte una solicitud de transporte en una cotización clara en minutos.',
    'en-revision', ME, 'personal', 5, 900, 71, COTIZACION),
  meta('conciliacion-facturas', 'Conciliación de facturas de transporte',
    'Compara las facturas de los transportistas con las guías y señala diferencias.',
    'borrador', 'Laura Mejía', 'organizacion', 9, 2400, 58, CONCILIACION),
  meta('citas-descarga', 'Programación de citas de descarga',
    'Coordina con los transportistas el horario de llegada a cada muelle.',
    'activo', 'Julián Correa', 'organizacion', 2, 1500, 76, CITAS),
  meta('alertas-retrasos', 'Alertas de retrasos a clientes',
    'Avisa a los clientes antes de que pregunten cuando un envío se atrasa.',
    'borrador', ME, 'personal', 0, 4200, 88, ALERTAS),
  meta('verificacion-aduanera', 'Verificación de documentos aduaneros',
    'Revisa que los documentos de exportación estén completos antes de radicarlos.',
    'en-revision', 'Laura Mejía', 'organizacion', 14, 600, 49, ADUANA),
];

let sequence = 0;
const created = [];

export function listAgents() {
  return [...created, ...SEED];
}

export function getAgent(id) {
  return listAgents().find((agent) => agent.id === id) ?? null;
}

// Copia editable del grafo original del agente ("Restaurar plantilla").
export function cloneAgentGraph(id) {
  const agent = getAgent(id);
  return agent ? structuredClone(agent.graph) : null;
}

// Agente nuevo de la sesion: en blanco o con la plantilla de seguimiento.
export function createAgent(fromTemplate) {
  sequence += 1;
  const id = `nuevo-${sequence}`;
  const name = `Agente nuevo ${sequence}`;
  const graph = fromTemplate
    ? { ...cloneTemplateGraph(), id, name }
    : { id, name, version: '1.0.0', nodes: [], edges: [] };
  const description = fromTemplate
    ? 'Copia de la plantilla de seguimiento de envíos para ajustar a tu caso.'
    : 'Agente en blanco: agrega pasos desde la paleta para empezar.';
  const agent = meta(id, name, description, 'borrador', ME, 'personal', 0, 1000, 0, graph);
  created.unshift(agent);
  return agent;
}
