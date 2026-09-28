// Acciones de UI del lienzo: viewport (zoom/paneo) y recorrido de prueba.
// Nada de esto forma parte del grafo ni de la receta exportada.

export const IDLE_SIM = Object.freeze({
  status: 'idle',
  done: [],
  doneEdges: [],
  active: null,
  activeEdges: [],
});

export const INITIAL_VIEWPORT = Object.freeze({ x: 0, y: 0, k: 1 });

export function withNotice(state, text, patch = {}) {
  return {
    ...state,
    ui: { ...state.ui, ...patch, notice: text, noticeSeq: state.ui.noticeSeq + 1 },
  };
}

function setViewport(state, { viewport }) {
  const cur = state.ui.viewport;
  const same = cur.x === viewport.x && cur.y === viewport.y && cur.k === viewport.k;
  return same ? state : { ...state, ui: { ...state.ui, viewport: { ...viewport } } };
}

function simStart(state) {
  const sim = { ...IDLE_SIM, status: 'running' };
  return withNotice(state, 'Recorrido de prueba iniciado.', { sim });
}

function simStep(state, { nodeId, edgeIds, label }) {
  const { sim } = state.ui;
  const next = {
    status: 'running',
    done: sim.active ? [...sim.done, sim.active] : sim.done,
    doneEdges: [...sim.doneEdges, ...sim.activeEdges],
    active: nodeId,
    activeEdges: edgeIds,
  };
  return withNotice(state, `Recorrido: paso «${label}».`, { sim: next });
}

function simEnd(state) {
  const { sim } = state.ui;
  const done = sim.active ? [...sim.done, sim.active] : sim.done;
  const next = {
    status: 'finished',
    done,
    doneEdges: [...sim.doneEdges, ...sim.activeEdges],
    active: null,
    activeEdges: [],
  };
  return withNotice(state, `Recorrido terminado: ${done.length} pasos revisados.`, { sim: next });
}

function simStop(state, { silent } = {}) {
  if (state.ui.sim.status === 'idle') {
    return state;
  }
  if (silent) {
    return { ...state, ui: { ...state.ui, sim: IDLE_SIM } };
  }
  return withNotice(state, 'Recorrido de prueba detenido.', { sim: IDLE_SIM });
}

export const UI_HANDLERS = {
  SET_NOTICE: (state, { text }) => withNotice(state, text),
  SET_VIEWPORT: setViewport,
  SIM_START: simStart,
  SIM_STEP: simStep,
  SIM_END: simEnd,
  SIM_STOP: simStop,
};
