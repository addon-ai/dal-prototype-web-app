// Filtros de la coleccion de agentes: alcance, estado y busqueda de texto (se combinan con AND),
// mas la barra que los muestra y su forma en el hash (#/agentes?alcance=mios&estado=activo&q=...).
import { h, icon } from './dom.js';
import { ME } from '../data/agents/index.js';
import { STATUS } from './agent-status.js';

const CLOSE = 'M6 6l12 12M18 6L6 18';
const DEBOUNCE_MS = 200;
const QUERY_MAX = 80;

export const SCOPES = [
  ['todos', 'Todos', () => true],
  ['mios', 'Míos', (agent) => agent.owner === ME],
  ['org', 'De mi organización', (agent) => agent.scope === 'organizacion'],
];
export const ESTADOS = [['todos', 'Todos'], ...Object.entries(STATUS).map(([id, item]) => [id, item.label])];
export const SORTS = [
  ['recientes', 'Más recientes', (a, b) => a.edited - b.edited],
  ['nombre', 'Nombre (A a Z)', (a, b) => a.name.localeCompare(b.name, 'es')],
];

const normalize = (text) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const has = (list, id) => list.some(([key]) => key === id);

export const defaultFilters = () => ({ scope: 'todos', estado: 'todos', query: '', sort: 'recientes' });
export const isFiltered = (f) => f.scope !== 'todos' || f.estado !== 'todos' || f.query.trim() !== '';

// `skip` ('scope' | 'estado') ignora ese filtro para contar sus opciones sin el propio filtro.
export function filterAgents(list, f, skip) {
  const inScope = SCOPES.find(([id]) => id === f.scope)[2];
  const q = normalize(f.query.trim());
  return list.filter(
    (agent) =>
      (skip === 'scope' || inScope(agent)) &&
      (skip === 'estado' || f.estado === 'todos' || agent.status === f.estado) &&
      (!q || normalize(`${agent.name} ${agent.description} ${agent.owner} ${STATUS[agent.status].label}`).includes(q)),
  );
}

export function readFilters(hash) {
  const f = defaultFilters();
  const params = new URLSearchParams(hash.startsWith('#/agentes') ? (hash.split('?')[1] ?? '') : '');
  f.scope = has(SCOPES, params.get('alcance')) ? params.get('alcance') : f.scope;
  f.estado = has(ESTADOS, params.get('estado')) ? params.get('estado') : f.estado;
  f.query = (params.get('q') ?? '').slice(0, QUERY_MAX);
  return f;
}

export function filtersQuery(f) {
  const params = new URLSearchParams();
  if (f.scope !== 'todos') params.set('alcance', f.scope);
  if (f.estado !== 'todos') params.set('estado', f.estado);
  if (f.query.trim()) params.set('q', f.query.trim());
  const text = params.toString();
  return text ? `?${text}` : '';
}

// Grupo de botones con aria-pressed; se crean una vez y solo se actualizan (el foco no se pierde).
function chipGroup(label, options, get, set) {
  const group = h('div', 'agents__filters');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', label);
  const buttons = options.map(([id, text]) => {
    const button = h('button', 'btn agents__filter');
    button.type = 'button';
    button.addEventListener('click', () => set(id));
    group.append(button);
    return { id, text, button };
  });
  const paint = (counts) =>
    buttons.forEach(({ id, text, button }) => {
      button.textContent = `${text} (${counts[id]})`;
      button.setAttribute('aria-pressed', String(get() === id));
    });
  return { group, paint };
}

// Desplegable nativo (teclado y tactil del sistema); `options` = [[valor, texto], ...].
function selectControl(label, options, set) {
  const select = document.createElement('select');
  select.className = 'select agents__select-control';
  select.setAttribute('aria-label', label);
  options.forEach(([value, text]) => {
    const option = h('option', '', text);
    option.value = value;
    select.append(option);
  });
  select.addEventListener('change', () => set(select.value));
  return { select };
}

function searchBox(f, onChange) {
  const box = h('div', 'agents__search');
  const input = document.createElement('input');
  input.type = 'search';
  input.id = 'agents-search';
  input.className = 'select';
  input.placeholder = 'Buscar agentes…';
  input.title = 'Busca por nombre, descripción, propietario o estado';
  input.setAttribute('aria-label', 'Buscar un agente');
  input.value = f.query;
  const clear = h('button', 'btn btn--icon btn--ghost agents__search-clear');
  clear.type = 'button';
  clear.hidden = !f.query;
  clear.setAttribute('aria-label', 'Limpiar búsqueda');
  clear.append(icon(CLOSE));
  let timer = null;
  input.addEventListener('input', () => {
    clear.hidden = !input.value;
    clearTimeout(timer);
    timer = setTimeout(() => {
      f.query = input.value;
      onChange();
    }, DEBOUNCE_MS);
  });
  clear.addEventListener('click', () => {
    clearTimeout(timer);
    input.value = '';
    clear.hidden = true;
    f.query = '';
    input.focus();
    onChange();
  });
  box.append(input, clear);
  return { box, sync: () => { input.value = f.query; clear.hidden = !f.query; } };
}

// Devuelve { el, paint(agentes), sync() }. `f` es el objeto de filtros (se modifica en su lugar).
export function createFilterBar(f, onChange) {
  const pick = (key) => (id) => {
    f[key] = id;
    onChange();
  };
  const scopes = chipGroup('Filtrar por alcance', SCOPES, () => f.scope, pick('scope'));
  const search = searchBox(f, onChange);
  const estado = selectControl('Filtrar por estado', ESTADOS, pick('estado'));
  const sort = selectControl('Ordenar por', SORTS, pick('sort'));
  const controls = h('div', 'agents__controls');
  controls.append(search.box, estado.select, sort.select);
  const el = h('div', 'agents__bar');
  el.append(scopes.group, controls);
  return {
    el,
    sync: () => {
      search.sync();
      estado.select.value = f.estado;
      sort.select.value = f.sort;
    },
    paint: (all) => {
      const byScope = filterAgents(all, f, 'scope');
      const byEstado = filterAgents(all, f, 'estado');
      scopes.paint(Object.fromEntries(SCOPES.map(([id, , test]) => [id, byScope.filter(test).length])));
      estado.select.value = f.estado;
      [...estado.select.options].forEach((option) => {
        const id = option.value;
        option.textContent = `${id === 'todos' ? 'Todos los estados' : STATUS[id].label} (${byEstado.filter((a) => id === 'todos' || a.status === id).length})`;
      });
    },
  };
}
