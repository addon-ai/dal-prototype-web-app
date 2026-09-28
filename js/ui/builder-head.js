// Cabecera del constructor y de resultados segun el agente abierto: avatar, nombre, descripcion,
// boton para editar nombre y avatar, y migaja.
import { getAgent } from '../data/agents/index.js';
import { createAgentAvatar } from './avatar.js';
import { openAgentEditor } from './agent-editor.js';
import { h } from './dom.js';

function paintTitle(el, agent, size, prefix = '') {
  const avatar = createAgentAvatar({ avatarId: agent.avatarId, size, decorative: true });
  el.replaceChildren(avatar, h('span', 'agent-title__name', `${prefix}${agent.name}`));
}

export function mountBuilderHead(store, view) {
  const title = view.querySelector('#constructor-title');
  const hint = view.querySelector('.stage__hint');
  const scenario = view.querySelector('#scenario-tag');
  const edit = view.querySelector('#agent-edit');
  const results = document.getElementById('resultados-title');
  view.querySelector('#back-agents').addEventListener('click', () => {
    store.dispatch({ type: 'SET_VIEW', view: 'agentes' });
  });
  edit.addEventListener('click', () => {
    openAgentEditor(store, store.getState().ui.agentId, edit);
  });
  const paint = (state) => {
    const agent = getAgent(state.ui.agentId);
    if (!agent) {
      return;
    }
    paintTitle(title, agent, 36);
    paintTitle(results, agent, 40, 'Resultados y costos: ');
    edit.setAttribute('aria-label', `Editar nombre y avatar de ${agent.name}`);
    hint.textContent = agent.description;
    scenario.textContent = 'Transportes Andina S.A.S. (ejemplo)';
  };
  store.subscribe((state) => `${state.ui.agentId}|${state.ui.agentsRev}`, (_v, state) => paint(state));
}
