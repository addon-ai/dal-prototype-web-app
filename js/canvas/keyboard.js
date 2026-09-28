// Alternativa de teclado a todo el arrastre: flechas mueven, C conecta, Enter selecciona
// o conecta con el paso de destino, Supr elimina, Escape cancela. Mas/menos hacen zoom y 0
// encuadra todo. Con el lienzo enfocado, las flechas lo desplazan. Los anuncios salen del store.
import { zoomStep, fitToScreen, panBy, revealById } from './view-actions.js';

const STEP = 16;
const STEP_BIG = 64;

const ARROWS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

function moveWithArrows(store, id, event) {
  const [ux, uy] = ARROWS[event.key];
  const size = event.shiftKey ? STEP_BIG : STEP;
  const node = store.getState().graph.nodes.find((item) => item.id === id);
  if (!node) {
    return;
  }
  if (store.getState().ui.selectedId !== id) {
    store.dispatch({ type: 'SELECT', id });
  }
  store.dispatch({
    type: 'MOVE_STEP',
    id,
    x: node.x + ux * size,
    y: node.y + uy * size,
    announce: true,
  });
}

function activateNode(store, id) {
  const { connectFrom } = store.getState().ui;
  if (connectFrom && connectFrom !== id) {
    store.dispatch({ type: 'CONNECT', from: connectFrom, to: id });
  } else if (connectFrom === id) {
    store.dispatch({ type: 'CONNECT', from: null });
  } else {
    store.dispatch({ type: 'SELECT', id });
  }
}

const PAN_STEP = 48;

function viewKey(svg, store, event) {
  if (event.key === '+' || event.key === '=') {
    zoomStep(store, svg, 1);
  } else if (event.key === '-' || event.key === '_') {
    zoomStep(store, svg, -1);
  } else if (event.key === '0') {
    fitToScreen(store, svg);
  } else if (event.target === svg && event.key in ARROWS) {
    const [ux, uy] = ARROWS[event.key];
    panBy(store, -ux * PAN_STEP, -uy * PAN_STEP);
  } else {
    return false;
  }
  event.preventDefault();
  return true;
}

export function attachKeyboard(svg, store) {
  // Al enfocar un paso con Tab, se desplaza el lienzo lo justo para verlo completo.
  svg.addEventListener('focusin', (event) => {
    const holder = event.target.closest('.node');
    if (holder) {
      revealById(store, svg, holder.dataset.id);
    }
  });

  svg.addEventListener('keydown', (event) => {
    if (!event.ctrlKey && !event.metaKey && !event.altKey && viewKey(svg, store, event)) {
      return;
    }
    const holder = event.target.closest('.node, .edge');
    if (event.key === 'Escape' && store.getState().ui.connectFrom) {
      event.preventDefault();
      store.dispatch({ type: 'CONNECT', from: null });
      return;
    }
    if (!holder) {
      return;
    }
    const id = holder.dataset.id;
    const isNode = holder.classList.contains('node');
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isNode) {
        activateNode(store, id);
      } else {
        store.dispatch({ type: 'SELECT', id });
      }
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      store.dispatch({ type: 'REMOVE', id });
      svg.focus();
    } else if (isNode && event.key in ARROWS) {
      event.preventDefault();
      moveWithArrows(store, id, event);
    } else if (isNode && (event.key === 'c' || event.key === 'C')) {
      event.preventDefault();
      store.dispatch({ type: 'CONNECT', from: id });
    }
  });
}
