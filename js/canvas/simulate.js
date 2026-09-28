// "Probar recorrido": resalta, paso a paso, el camino del asistente con datos de ejemplo.
// Solo cambia el estado de UI (`ui.sim`); no toca el grafo ni la receta.
import { simulationPath } from '../domain/simulation.js';
import { revealById } from './view-actions.js';
import { h, icon } from '../ui/dom.js';

const STEP_MS = 1100;
const STEP_MS_REDUCED = 700;
const CLEAR_MS = 6000;
const PLAY = 'M8 5v14l11-7z';
const STOP = 'M7 7h10v10H7z';
const LABELS = { idle: 'Probar recorrido', running: 'Detener recorrido', finished: 'Repetir recorrido' };

export function mountSimulation(actions, svg, store) {
  const button = h('button', 'btn btn--primary sim__btn');
  button.type = 'button';
  const progress = h('span', 'sim__progress');
  actions.append(button, progress);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer = null;
  let queue = [];
  let index = 0;

  function stop(silent = false) {
    clearTimeout(timer);
    timer = null;
    if (store.getState().ui.sim.status !== 'idle') {
      store.dispatch({ type: 'SIM_STOP', silent });
    }
  }

  function tick() {
    if (index >= queue.length) {
      store.dispatch({ type: 'SIM_END' });
      timer = setTimeout(() => stop(true), CLEAR_MS);
      return;
    }
    const { nodeId, edgeIds } = queue[index];
    index += 1;
    const node = store.getState().graph.nodes.find((item) => item.id === nodeId);
    store.dispatch({ type: 'SIM_STEP', nodeId, edgeIds, label: node.label });
    revealById(store, svg, nodeId);
    timer = setTimeout(tick, reduced.matches ? STEP_MS_REDUCED : STEP_MS);
  }

  function start() {
    clearTimeout(timer);
    queue = simulationPath(store.getState().graph);
    index = 0;
    store.dispatch({ type: 'SIM_START' });
    tick();
  }

  button.addEventListener('click', () => {
    if (store.getState().ui.sim.status === 'running') {
      stop();
    } else {
      start();
    }
  });

  function paint(state) {
    const { sim } = state.ui;
    const running = sim.status === 'running';
    button.replaceChildren(icon(running ? STOP : PLAY), h('span', '', LABELS[sim.status]));
    button.disabled = state.graph.nodes.length === 0;
    const seen = sim.done.length + (sim.active ? 1 : 0);
    const total = state.graph.nodes.length;
    const texts = { idle: '', running: `Paso ${seen} de ${total}`, finished: 'Recorrido listo' };
    progress.textContent = texts[sim.status];
  }
  paint(store.getState());
  store.subscribe((state) => state.ui.sim, (_v, state) => paint(state));
  store.subscribe((state) => state.graph, (_v, state) => {
    if (state.ui.sim.status !== 'idle') {
      stop();
    }
    paint(state);
  });
}
