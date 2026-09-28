// Coleccion de agentes: saludo, filtros con conteos, busqueda, orden y cuadricula de tarjetas.
import { h } from './dom.js';
import { agentCard, newAgentCard } from './agents-card.js';
import { listAgents, deleteAgent, ME } from '../data/agents/index.js';
import { clearDraft } from '../draft-storage.js';
import { askConfirm } from './confirm-dialog.js';

const FILTERS = [
  ['todos', 'Todos', () => true],
  ['mios', 'Míos', (agent) => agent.owner === ME],
  ['org', 'De mi organización', (agent) => agent.scope === 'organizacion'],
];
const SORTS = [
  ['recientes', 'Más recientes', (a, b) => a.edited - b.edited],
  ['nombre', 'Nombre (A a Z)', (a, b) => a.name.localeCompare(b.name, 'es')],
];
const normalize = (text) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export function mountAgents(view, store, openAgent, createNew) {
  const root = view.querySelector('#agents-root');
  const state = { filter: 'todos', query: '', sort: 'recientes' };

  const intro = h('p', 'agents__intro', 'Hola, Camila. Estos son los agentes de Transportes Andina S.A.S. (ejemplo).');
  const tag = h('p', 'tag', 'Datos de ejemplo');
  const bar = h('div', 'agents__bar');
  const filters = h('div', 'agents__filters');
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Filtrar agentes');
  const search = document.createElement('input');
  search.type = 'search';
  search.id = 'agents-search';
  search.className = 'select agents__search';
  search.placeholder = 'Buscar un agente…';
  search.setAttribute('aria-label', 'Buscar un agente');
  const sortSelect = document.createElement('select');
  sortSelect.className = 'select';
  sortSelect.setAttribute('aria-label', 'Ordenar agentes');
  SORTS.forEach(([value, label]) => {
    const option = h('option', '', label);
    option.value = value;
    sortSelect.append(option);
  });
  const status = h('p', 'agents__status');
  status.setAttribute('role', 'status');
  const grid = h('ul', 'agents__grid');
  bar.append(filters, search, sortSelect);
  root.append(intro, tag, bar, status, grid);

  function paintFilters() {
    filters.replaceChildren();
    FILTERS.forEach(([id, label, test]) => {
      const count = listAgents().filter(test).length;
      const button = h('button', 'btn agents__filter', `${label} (${count})`);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(state.filter === id));
      button.addEventListener('click', () => {
        state.filter = id;
        paint();
      });
      filters.append(button);
    });
  }

  function paint() {
    const test = FILTERS.find(([id]) => id === state.filter)[2];
    const order = SORTS.find(([id]) => id === state.sort)[2];
    const q = normalize(state.query.trim());
    const shown = listAgents()
      .filter(test)
      .filter((a) => !q || normalize(`${a.name} ${a.description}`).includes(q))
      .sort(order);
    paintFilters();
    grid.replaceChildren(...shown.map((agent) => agentCard(agent, openAgent, onDelete)));
    if (state.filter !== 'org') {
      grid.append(newAgentCard(onCreate));
    }
    status.textContent = shown.length
      ? `${shown.length} ${shown.length === 1 ? 'agente' : 'agentes'}`
      : 'No hay agentes con este filtro o búsqueda. Cambia el filtro o crea uno nuevo.';
  }

  const onCreate = (fromTemplate) => createNew(fromTemplate);

  function onDelete(agent, trigger) {
    askConfirm({
      trigger,
      title: `¿Eliminar «${agent.name}»?`,
      text: 'Se borran el agente, su avatar y su borrador de este navegador. No se puede deshacer.',
      confirmLabel: 'Eliminar agente',
      fallbackFocus: () => view.querySelector('h1'),
      onConfirm: () => {
        deleteAgent(agent.id);
        clearDraft(agent.id);
        store.dispatch({ type: 'AGENT_REMOVED', id: agent.id, notice: `Agente «${agent.name}» eliminado.` });
        view.querySelector('h1').focus({ preventScroll: true });
      },
    });
  }

  search.addEventListener('input', () => {
    state.query = search.value;
    paint();
  });
  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    paint();
  });
  store.subscribe((s) => s.ui.view, (v) => v === 'agentes' && paint());
  store.subscribe((s) => s.ui.agentsRev, paint);
  paint();
}
