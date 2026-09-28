// Acciones de la coleccion de agentes: abrir un agente carga su grafo y su volumen base.
import { IDLE_SIM, INITIAL_VIEWPORT, withNotice } from './reducer-ui.js';

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

export const AGENT_HANDLERS = {
  OPEN_AGENT: openAgent,
};
