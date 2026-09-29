// Coleccion de agentes: saludo, filtros (alcance, estado, busqueda), seleccion multiple con un
// solo "Eliminar" y cuadricula de tarjetas. Filtros y busqueda viajan en el hash (#/agentes?...).
import { h, icon } from './dom.js';
import { agentCard, newAgentCard } from './agents-card.js';
import { listAgents, deleteAgents, updateAgent, countHiddenSamples, restoreSamples } from '../data/agents/index.js';
import { clearDraft } from '../draft-storage.js';
import { askConfirm } from './confirm-dialog.js';
import { STATUS } from './agent-status.js';
import { createFilterBar, defaultFilters, filterAgents, filtersQuery, readFilters, SORTS } from './agents-filters.js';
import { createSelection, describeAgents } from './agents-selection.js';
import { emptyState } from './agents-empty.js';
import { setAgentsQuery } from '../navigation.js';

const RESTORE = 'M4 12a8 8 0 108-8M4 4v5h5';

export function mountAgents(view, store, openAgent, createNew, onFiltersChange = () => {}) {
  const root = view.querySelector('#agents-root');
  const f = readFilters(window.location.hash);
  const title = () => view.querySelector('h1');
  setAgentsQuery(() => filtersQuery(f));

  const intro = h('p', 'agents__intro', 'Hola, Camila. Estos son los agentes de Transportes Andina S.A.S. (ejemplo).');
  const filterBar = createFilterBar(f, paint);
  const selection = createSelection({ root, onDelete });
  const status = h('p', 'agents__status');
  status.setAttribute('role', 'status');
  const restore = h('button', 'btn btn--ghost agents__restore');
  restore.type = 'button';
  restore.prepend(icon(RESTORE));
  restore.append(h('span', '', 'Restaurar agentes de ejemplo'));
  restore.addEventListener('click', doRestore);
  const info = h('div', 'agents__info');
  info.append(status, restore);
  const grid = h('ul', 'agents__grid');
  root.append(intro, filterBar.el, selection.bar, info, grid);

  function paint() {
    const all = listAgents();
    filterBar.paint(all);
    const order = SORTS.find(([id]) => id === f.sort)[2];
    const shown = filterAgents(all, f).sort(order);
    const cards = shown.map((agent) => agentCard(agent, { onOpen: openAgent, onStatus: changeStatus }));
    if (all.length === 0) {
      cards.push(emptyState('none', { onRestore: doRestore, onCreate: () => createNew(false) }));
    } else if (shown.length === 0) {
      cards.push(emptyState('filters', { onClear: clearFilters }));
    } else if (f.scope !== 'org' && f.estado === 'todos' && !f.query.trim()) {
      cards.push(newAgentCard(createNew));
    }
    grid.replaceChildren(...cards);
    selection.setVisible(shown.map((agent) => agent.id));
    restore.hidden = countHiddenSamples() === 0 || all.length === 0;
    const none = all.length ? 'No hay agentes con estos filtros.' : 'No hay agentes.';
    status.textContent = shown.length ? `${shown.length} ${shown.length === 1 ? 'agente' : 'agentes'}` : none;
    onFiltersChange();
  }

  function clearFilters() {
    Object.assign(f, defaultFilters(), { sort: f.sort });
    filterBar.sync();
    paint();
    view.querySelector('.agents__filter')?.focus();
  }

  function changeStatus(agent, next) {
    updateAgent(agent.id, { status: next });
    store.dispatch({
      type: 'AGENTS_CHANGED',
      notice: `«${agent.name}» ahora está ${STATUS[next].label.toLowerCase()}.`,
    });
    grid.querySelector(`[data-status-for="${agent.id}"]`)?.focus();
  }

  function doRestore() {
    restoreSamples();
    store.dispatch({ type: 'AGENTS_CHANGED', notice: 'Agentes de ejemplo restaurados.' });
    title().focus({ preventScroll: true });
  }

  function onDelete(ids, trigger) {
    const chosen = listAgents().filter((agent) => ids.includes(agent.id));
    const n = chosen.length;
    const noun = n === 1 ? '1 agente' : `${n} agentes`;
    askConfirm({
      trigger,
      title: n === 1 ? '¿Eliminar 1 agente?' : `¿Eliminar ${n} agentes?`,
      text: `Vas a eliminar ${noun}: ${describeAgents(chosen)}. Esta acción no se puede deshacer.`,
      confirmLabel: `Eliminar ${noun}`,
      fallbackFocus: title,
      onConfirm: () => {
        chosen.forEach((agent) => clearDraft(agent.id));
        deleteAgents(ids);
        selection.clear();
        store.dispatch({ type: 'AGENT_REMOVED', ids, notice: n === 1 ? '1 agente eliminado.' : `${n} agentes eliminados.` });
        title().focus({ preventScroll: true });
      },
    });
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith('#/agentes')) {
      Object.assign(f, readFilters(window.location.hash), { sort: f.sort });
      filterBar.sync();
      paint();
    }
  });
  store.subscribe((s) => s.ui.view, (v) => (v === 'agentes' ? paint() : selection.clear()));
  store.subscribe((s) => s.ui.agentsRev, paint);
  paint();
}
