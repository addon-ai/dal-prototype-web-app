// Controles flotantes del lienzo (zoom, encuadre, restaurar plantilla) y estado vacio.
import { zoomStep, fitToScreen } from './view-actions.js';
import { emptyState } from './empty-state.js';
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

export function mountControls(wrap, svg, store, onRestore, onTemplate) {
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

  const empty = emptyState(store, svg, onTemplate);
  wrap.append(empty);

  zoomIn.addEventListener('click', () => zoomStep(store, svg, 1));
  zoomOut.addEventListener('click', () => zoomStep(store, svg, -1));
  fit.addEventListener('click', () => fitToScreen(store, svg));
  restore.addEventListener('click', onRestore);

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
