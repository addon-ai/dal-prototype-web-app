// Acciones de la coleccion de agentes: abrir carga su grafo y su volumen base; los cambios en la
// coleccion (crear, renombrar, cambiar avatar, eliminar) suben `ui.agentsRev` para repintar vistas.
import { IDLE_SIM, INITIAL_VIEWPORT, withNotice } from './reducer-ui.js';

export const EMPTY_GRAPH = { id: 'sin-agente', name: '', version: '1.0.0', nodes: [], edges: [] };

function openAgent(state, { id, graph, casosMes }) {
  const next = {
    ...state,
    graph,
    scenario: { casosMes },
    ui: {
      ...state.ui,
      agentId: id,
      selectedId: null,
      connectFrom: null,
      viewport: INITIAL_VIEWPORT,
      sim: IDLE_SIM,
    },
  };
  return withNotice(next, `Agente «${graph.name}» abierto.`);
}

function bump(state) {
  return { ...state, ui: { ...state.ui, agentsRev: (state.ui.agentsRev ?? 0) + 1 } };
}

// El agente abierto sigue el nombre nuevo (la receta y el borrador lo usan).
function agentsChanged(state, { id, name, notice }) {
  let next = bump(state);
  if (id && id === state.ui.agentId && name && state.graph.name !== name) {
    next = { ...next, graph: { ...state.graph, name } };
  }
  return notice ? withNotice(next, notice) : next;
}

function agentRemoved(state, { id, notice }) {
  let next = bump(state);
  if (state.ui.agentId === id) {
    next = {
      ...next,
      graph: EMPTY_GRAPH,
      ui: { ...next.ui, agentId: null, selectedId: null, connectFrom: null, sim: IDLE_SIM },
    };
  }
  return notice ? withNotice(next, notice) : next;
}

export const AGENT_HANDLERS = {
  OPEN_AGENT: openAgent,
  AGENTS_CHANGED: agentsChanged,
  AGENT_REMOVED: agentRemoved,
};
