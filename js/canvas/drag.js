// Arrastre con Pointer Events (mouse, lapiz y tactil). Los nodos usan `touch-action: none`
// en CSS para que la pagina no haga scroll durante el gesto.
import { getCatalogEntry } from '../data/catalog.js';
import { NODE_W, NODE_H, svgEl } from './shapes.js';

const DRAG_THRESHOLD = 4;
const GHOST_THRESHOLD = 6;

export function toSvgPoint(svg, clientX, clientY) {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const matrix = svg.getScreenCTM();
  return matrix ? point.matrixTransform(matrix.inverse()) : { x: clientX, y: clientY };
}

function finishClick(store, id) {
  const { connectFrom } = store.getState().ui;
  if (connectFrom && connectFrom !== id) {
    store.dispatch({ type: 'CONNECT', from: connectFrom, to: id });
  } else if (connectFrom === id) {
    store.dispatch({ type: 'CONNECT', from: null });
  } else {
    store.dispatch({ type: 'SELECT', id });
  }
}

export function attachNodeDrag(svg, store) {
  let drag = null;

  svg.addEventListener('pointerdown', (event) => {
    const nodeEl = event.target.closest('.node');
    if (!nodeEl || event.button !== 0) {
      return;
    }
    const node = store.getState().graph.nodes.find((item) => item.id === nodeEl.dataset.id);
    if (!node) {
      return;
    }
    const start = toSvgPoint(svg, event.clientX, event.clientY);
    drag = { id: node.id, el: nodeEl, start, origin: { x: node.x, y: node.y }, moved: false };
    nodeEl.setPointerCapture(event.pointerId);
  });

  svg.addEventListener('pointermove', (event) => {
    if (!drag) {
      return;
    }
    const point = toSvgPoint(svg, event.clientX, event.clientY);
    const dx = point.x - drag.start.x;
    const dy = point.y - drag.start.y;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) {
      return;
    }
    if (!drag.moved) {
      drag.moved = true;
      store.dispatch({ type: 'SELECT', id: drag.id });
    }
    store.dispatch({
      type: 'MOVE_STEP',
      id: drag.id,
      x: drag.origin.x + dx,
      y: drag.origin.y + dy,
    });
  });

  const end = (event) => {
    if (!drag) {
      return;
    }
    const finished = drag;
    drag = null;
    if (finished.el.hasPointerCapture(event.pointerId)) {
      finished.el.releasePointerCapture(event.pointerId);
    }
    if (event.type === 'pointerup' && !finished.moved) {
      finishClick(store, finished.id);
    }
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);

  // Las conexiones se seleccionan con clic o toque.
  svg.addEventListener('click', (event) => {
    const edgeEl = event.target.closest('.edge');
    if (edgeEl) {
      store.dispatch({ type: 'SELECT', id: edgeEl.dataset.id });
    } else if (!event.target.closest('.node')) {
      store.dispatch({ type: 'SELECT', id: null });
    }
  });
}

function createGhost(entry) {
  const ghost = document.createElement('div');
  ghost.className = 'ghost';
  ghost.setAttribute('aria-hidden', 'true');
  const icon = svgEl('svg', { class: 'icon', viewBox: '0 0 24 24' });
  icon.innerHTML = entry.icon;
  const text = document.createElement('span');
  text.textContent = entry.label;
  ghost.append(icon, text);
  document.body.append(ghost);
  return ghost;
}

// Arrastre desde la paleta (mouse/lapiz). En tactil la paleta usa el boton "Agregar".
// Devuelve `consumeDrag()`: true si el ultimo gesto fue un arrastre (hay que ignorar el clic).
export function attachPaletteDrag(list, wrap, svg, store) {
  let session = null;
  let justDragged = false;

  list.addEventListener('pointerdown', (event) => {
    const item = event.target.closest('[data-step]');
    if (!item || event.button !== 0 || event.pointerType === 'touch') {
      return;
    }
    session = { item, step: item.dataset.step, x: event.clientX, y: event.clientY, ghost: null };
    item.setPointerCapture(event.pointerId);
  });

  list.addEventListener('pointermove', (event) => {
    if (!session) {
      return;
    }
    if (
      !session.ghost &&
      Math.hypot(event.clientX - session.x, event.clientY - session.y) > GHOST_THRESHOLD
    ) {
      session.ghost = createGhost(getCatalogEntry(session.step));
    }
    if (session.ghost) {
      session.ghost.style.left = `${event.clientX}px`;
      session.ghost.style.top = `${event.clientY}px`;
    }
  });

  const end = (event) => {
    if (!session) {
      return;
    }
    const done = session;
    session = null;
    if (done.item.hasPointerCapture(event.pointerId)) {
      done.item.releasePointerCapture(event.pointerId);
    }
    if (!done.ghost) {
      return;
    }
    done.ghost.remove();
    justDragged = true;
    setTimeout(() => {
      justDragged = false;
    }, 0);
    const rect = wrap.getBoundingClientRect();
    const inside =
      event.type === 'pointerup' &&
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (inside) {
      const point = toSvgPoint(svg, event.clientX, event.clientY);
      store.dispatch({
        type: 'ADD_STEP',
        step: done.step,
        x: point.x - NODE_W / 2,
        y: point.y - NODE_H / 2,
      });
    }
  };
  list.addEventListener('pointerup', end);
  list.addEventListener('pointercancel', end);

  return { consumeDrag: () => justDragged };
}
