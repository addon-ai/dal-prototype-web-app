// Cabecera del constructor y de resultados segun el agente abierto: nombre, descripcion y migaja.
import { getAgent } from '../data/agents/index.js';

export function mountBuilderHead(store, view) {
  const title = view.querySelector('#constructor-title');
  const hint = view.querySelector('.stage__hint');
  const scenario = view.querySelector('#scenario-tag');
  const results = document.getElementById('resultados-title');
  view.querySelector('#back-agents').addEventListener('click', () => {
    store.dispatch({ type: 'SET_VIEW', view: 'agentes' });
  });
  store.subscribe(
    (state) => state.ui.agentId,
    (id) => {
      const agent = getAgent(id);
      if (!agent) {
        return;
      }
      title.textContent = agent.name;
      hint.textContent = agent.description;
      scenario.textContent = 'Datos de ejemplo · Transportes Andina S.A.S. (ejemplo)';
      results.textContent = `Resultados y costos: ${agent.name}`;
    },
  );
}
