// Reducer puro del constructor. Cada accion devuelve un estado nuevo (o el mismo si no aplica).
import { CATALOG, getCatalogEntry, defaultSettings } from './data/catalog.js';
import { cloneTemplateGraph } from './data/template-logistica.js';
import { PRICING } from './pricing.config.js';
import { computeMetrics } from './domain/metrics.js';
import { computeInvoice } from './domain/costs.js';
import { formatCurrency } from './domain/format.js';
import { UI_HANDLERS, IDLE_SIM, INITIAL_VIEWPORT, withNotice } from './reducer-ui.js';

export const GRID = { stepX: 236, stepY: 130, startX: 40, startY: 40, columns: 4 };
const COORD_MIN = -2000;
const COORD_MAX = 6000;
const clampCoord = (value) => Math.min(COORD_MAX, Math.max(COORD_MIN, Math.round(value)));

export function createInitialState(graph = cloneTemplateGraph()) {
  return {
    graph,
    ui: {
      selectedId: null,
      connectFrom: null,
      view: 'constructor',
      notice: null,
      noticeSeq: 0,
      viewport: INITIAL_VIEWPORT,
      sim: IDLE_SIM,
    },
    scenario: { casosMes: 3000 },
  };
}

function estimatedCost(state, graph) {
  const metrics = computeMetrics(graph, state.scenario, CATALOG);
  const invoice = computeInvoice(metrics, PRICING);
  return formatCurrency(invoice.total, invoice.currency, 0);
}

function uniqueId(prefix, existing) {
  const ids = new Set(existing.map((item) => item.id));
  let n = 1;
  while (ids.has(`${prefix}_${n}`)) {
    n += 1;
  }
  return `${prefix}_${n}`;
}

function nextFreePosition(nodes) {
  for (let i = 0; i < 200; i += 1) {
    const x = GRID.startX + (i % GRID.columns) * GRID.stepX;
    const y = GRID.startY + Math.floor(i / GRID.columns) * GRID.stepY;
    const busy = nodes.some(
      (node) => Math.abs(node.x - x) < GRID.stepX - 40 && Math.abs(node.y - y) < GRID.stepY - 30,
    );
    if (!busy) {
      return { x, y };
    }
  }
  return { x: GRID.startX, y: GRID.startY };
}

function nodeName(graph, id) {
  const node = graph.nodes.find((item) => item.id === id);
  return node ? node.label : '';
}

function addStep(state, { step, x, y }) {
  const entry = getCatalogEntry(step);
  if (!entry) {
    return state;
  }
  const pos = x === undefined || y === undefined ? nextFreePosition(state.graph.nodes) : { x, y };
  const id = uniqueId(step, state.graph.nodes);
  const node = {
    id,
    step,
    label: entry.label,
    x: clampCoord(pos.x),
    y: clampCoord(pos.y),
    settings: defaultSettings(step),
  };
  const graph = { ...state.graph, nodes: [...state.graph.nodes, node] };
  const text = `Paso «${entry.label}» agregado. Costo estimado: ${estimatedCost(state, graph)} al mes.`;
  return withNotice({ ...state, graph }, text, { selectedId: id });
}

function moveStep(state, { id, x, y, announce }) {
  const target = state.graph.nodes.find((node) => node.id === id);
  if (!target) {
    return state;
  }
  const nx = clampCoord(x);
  const ny = clampCoord(y);
  if (nx === target.x && ny === target.y) {
    return state;
  }
  const nodes = state.graph.nodes.map((n) => (n.id === id ? { ...n, x: nx, y: ny } : n));
  const next = { ...state, graph: { ...state.graph, nodes } };
  return announce ? withNotice(next, `«${target.label}» movido.`) : next;
}

function coerce(setting, value) {
  return setting.type === 'range' ? Number(value) : value;
}

function updateSetting(state, { id, key, value }) {
  const target = state.graph.nodes.find((node) => node.id === id);
  const setting = target && getCatalogEntry(target.step)?.settings.find((s) => s.key === key);
  if (!setting) {
    return state;
  }
  const next = coerce(setting, value);
  const nodes = state.graph.nodes.map((n) => {
    if (n.id !== id) {
      return n;
    }
    const settings = { ...n.settings, [key]: next };
    return setting.target === 'label' ? { ...n, label: next, settings } : { ...n, settings };
  });
  return { ...state, graph: { ...state.graph, nodes } };
}

function connect(state, { from, to }) {
  if (to === undefined) {
    if (!from) {
      return withNotice(state, 'Conexión cancelada.', { connectFrom: null });
    }
    const label = nodeName(state.graph, from);
    return withNotice(
      state,
      `Conexión iniciada desde «${label}». Ve al paso de destino y pulsa Enter. Escape cancela.`,
      { connectFrom: from },
    );
  }
  const { nodes, edges } = state.graph;
  const reject = (why) =>
    withNotice(state, `No se creó la conexión: ${why}`, { connectFrom: null });
  if (from === to) {
    return reject('un paso no puede conectarse consigo mismo.');
  }
  if (!nodes.some((n) => n.id === from) || !nodes.some((n) => n.id === to)) {
    return reject('falta uno de los pasos.');
  }
  if (edges.some((e) => e.from === from && e.to === to)) {
    return reject('esos dos pasos ya están conectados.');
  }
  const edge = { id: uniqueId('e', edges), from, to };
  const graph = { ...state.graph, edges: [...edges, edge] };
  const text = `Conexión creada: «${nodeName(graph, from)}» luego «${nodeName(graph, to)}».`;
  return withNotice({ ...state, graph }, text, { connectFrom: null, selectedId: edge.id });
}

function setCondition(state, { id, condition }) {
  const text = (condition ?? '').trim();
  const edges = state.graph.edges.map((edge) => {
    if (edge.id !== id) {
      return edge;
    }
    const next = { ...edge };
    if (text) {
      next.condition = text;
    } else {
      delete next.condition;
    }
    return next;
  });
  return { ...state, graph: { ...state.graph, edges } };
}

function remove(state, { id }) {
  const { nodes, edges } = state.graph;
  const node = nodes.find((n) => n.id === id);
  const ui = { selectedId: null, connectFrom: null };
  if (node) {
    const graph = {
      ...state.graph,
      nodes: nodes.filter((n) => n.id !== id),
      edges: edges.filter((e) => e.from !== id && e.to !== id),
    };
    return withNotice({ ...state, graph }, `Paso «${node.label}» eliminado.`, ui);
  }
  if (edges.some((e) => e.id === id)) {
    const graph = { ...state.graph, edges: edges.filter((e) => e.id !== id) };
    return withNotice({ ...state, graph }, 'Conexión eliminada.', ui);
  }
  return state;
}

const HANDLERS = {
  ADD_STEP: addStep,
  MOVE_STEP: moveStep,
  UPDATE_SETTING: updateSetting,
  CONNECT: connect,
  SET_CONDITION: setCondition,
  REMOVE: remove,
  SELECT: (state, { id }) =>
    state.ui.selectedId === id ? state : { ...state, ui: { ...state.ui, selectedId: id } },
  LOAD_TEMPLATE: (state, { graph } = {}) =>
    withNotice({ ...state, graph: graph ?? cloneTemplateGraph() }, 'Plantilla restaurada.', {
      selectedId: null,
      connectFrom: null,
    }),
  SET_VOLUME: (state, { casosMes }) => ({ ...state, scenario: { ...state.scenario, casosMes } }),
  SET_VIEW: (state, { view }) => ({ ...state, ui: { ...state.ui, view } }),
  ...UI_HANDLERS,
};

export function reducer(state, action) {
  const handler = HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
