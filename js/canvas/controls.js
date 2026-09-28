// Controles flotantes del lienzo (zoom, encuadre, restaurar plantilla) y estado vacio.
import { zoomStep, fitToScreen, centerPosition } from './view-actions.js';
import { h, icon } from '../ui/dom.js';

const ICONS = {
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  reset: 'M4 12a8 8 0 1 0 3-6.2M4 4v4h4',
};

function control(pathD, label, id) {
  const b = h('button', 'btn btn--icon float__btn');
  b.type = 'button';
  b.setAttribute('aria-label', label);
  b.title = label;
  if (id) {
    b.id = id;
  }
  b.append(icon(pathD));
  return b;
}

function emptyState(store, svg, restore) {
  const box = h('div', 'empty');
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', 'Lienzo vacío');
  const art = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  art.setAttribute('class', 'empty__art');
  art.setAttribute('viewBox', '0 0 160 96');
  art.setAttribute('aria-hidden', 'true');
  art.innerHTML =
    '<rect x="6" y="10" width="52" height="34" rx="9"/><rect x="102" y="52" width="52" height="34" rx="9"/><path d="M58 27h20a14 14 0 0 1 14 14v11"/><circle cx="58" cy="27" r="4"/><circle cx="102" cy="69" r="4"/>';
  const actions = h('div', 'empty__actions');
  const add = h('button', 'btn btn--primary', 'Agregar el primer paso');
  add.type = 'button';
  add.addEventListener('click', () => {
    const { x, y } = centerPosition(store, svg);
    store.dispatch({ type: 'ADD_STEP', step: 'entiende', x, y });
  });
  actions.append(add, restore);
  box.append(
    art,
    h('h2', 'empty__title', 'Tu lienzo está vacío'),
    h(
      'p',
      'muted',
      'Arrastra un paso desde la paleta, pulsa Agregar, o vuelve a la plantilla de ejemplo.',
    ),
    actions,
  );
  return box;
}

export function mountControls(wrap, svg, store, onRestore) {
  const zoomIn = control(ICONS.plus, 'Acercar');
  const zoomOut = control(ICONS.minus, 'Alejar');
  const fit = control(ICONS.fit, 'Ajustar a la pantalla');
  const restore = control(ICONS.reset, 'Restaurar plantilla', 'restore-template');
  const level = h('span', 'float__level');
  level.setAttribute('aria-hidden', 'true');
  const box = h('div', 'float');
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', 'Controles del lienzo');
  box.append(level, zoomIn, zoomOut, fit, restore);
  wrap.append(box);

  const emptyRestore = h('button', 'btn', 'Restaurar plantilla');
  emptyRestore.type = 'button';
  const empty = emptyState(store, svg, emptyRestore);
  wrap.append(empty);

  zoomIn.addEventListener('click', () => zoomStep(store, svg, 1));
  zoomOut.addEventListener('click', () => zoomStep(store, svg, -1));
  fit.addEventListener('click', () => fitToScreen(store, svg));
  [restore, emptyRestore].forEach((button) => button.addEventListener('click', onRestore));

  const paintLevel = (vp) => {
    level.textContent = `${Math.round(vp.k * 100)} %`;
  };
  const paintEmpty = (nodes) => {
    empty.hidden = nodes.length > 0;
  };
  paintLevel(store.getState().ui.viewport);
  paintEmpty(store.getState().graph.nodes);
  store.subscribe((state) => state.ui.viewport, paintLevel);
  store.subscribe((state) => state.graph.nodes, paintEmpty);
}
