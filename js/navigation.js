// Navegacion por hash (#/agentes, #/constructor/:id, #/resultados/:id). Solo hash, sin red.
// El store es la fuente de verdad: la vista y el agente activos se reflejan en el hash y viceversa.
import { getAgent, cloneAgentGraph } from './data/agents/index.js';
import { getDraft } from './draft-storage.js';
import { isValidDraft } from './draft-valid.js';

export const VIEWS = ['agentes', 'constructor', 'resultados'];
const NEEDS_AGENT = ['constructor', 'resultados'];

export function parseHash(hash) {
  const [, view = '', id = ''] = /^#\/([a-z]+)(?:\/([\w-]+))?(?:\?.*)?$/.exec(hash) ?? [];
  return VIEWS.includes(view) ? { view, id } : { view: 'agentes', id: '' };
}

// La vista Agentes puede llevar filtros en el hash (#/agentes?estado=activo); los aporta su modulo.
let agentsQuery = () => '';
export function setAgentsQuery(provider) {
  agentsQuery = provider;
}

export function buildHash(view, agentId) {
  if (view === 'agentes') {
    return `#/agentes${agentsQuery()}`;
  }
  return NEEDS_AGENT.includes(view) && agentId ? `#/${view}/${agentId}` : `#/${view}`;
}

// Refleja los filtros en el hash sin crear entradas de historial.
export function syncQuery(store, isSignedIn) {
  const hash = buildHash('agentes');
  if (isSignedIn() && store.getState().ui.view === 'agentes' && window.location.hash !== hash) {
    window.history.replaceState(null, '', hash);
  }
}

// Carga el agente (con su borrador si existe) en el store. Devuelve false si no existe.
export function openAgentById(store, id) {
  const agent = getAgent(id);
  if (!agent) {
    return false;
  }
  const draft = getDraft(id);
  const saved = isValidDraft(draft) ? draft : cloneAgentGraph(id);
  const graph = { ...saved, name: agent.name }; // el nombre vigente manda sobre el del borrador
  store.dispatch({ type: 'OPEN_AGENT', id, graph, casosMes: agent.casos });
  return true;
}

// Aplica un destino pedido; si no es valido o falta el agente, cae en Agentes.
export function goTo(store, target) {
  const { view, id } = target;
  if (NEEDS_AGENT.includes(view) && id && id !== store.getState().ui.agentId) {
    if (!openAgentById(store, id)) {
      store.dispatch({ type: 'SET_NOTICE', text: 'Ese agente no existe. Elige uno de la colección.' });
      store.dispatch({ type: 'SET_VIEW', view: 'agentes' });
      return;
    }
  }
  store.dispatch({ type: 'SET_VIEW', view });
}

// Constructor y Resultados requieren un agente abierto: si no hay, vuelve a Agentes con aviso.
export function guardView(store, view) {
  if (NEEDS_AGENT.includes(view) && !store.getState().ui.agentId) {
    store.dispatch({ type: 'SET_NOTICE', text: 'Primero abre un agente de la colección.' });
    store.dispatch({ type: 'SET_VIEW', view: 'agentes' });
    return false;
  }
  return true;
}

export function mountHashSync(store, isSignedIn) {
  const write = () => {
    const { view, agentId } = store.getState().ui;
    const hash = buildHash(view, agentId);
    if (isSignedIn() && window.location.hash !== hash) {
      window.location.hash = hash;
    }
  };
  store.subscribe((s) => `${s.ui.view}|${s.ui.agentId}`, write);
  window.addEventListener('hashchange', () => {
    if (isSignedIn()) {
      goTo(store, parseHash(window.location.hash));
      write(); // un destino invalido (p. ej. agente eliminado) deja el hash de la vista real
    }
  });
  return write;
}

export function clearHash() {
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
}
