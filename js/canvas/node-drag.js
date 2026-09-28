// Arrastre y seleccion de pasos con Pointer Events (mouse, lapiz y tactil). Los nodos usan
// `touch-action: none` en CSS para que la pagina no haga scroll durante el gesto.
const DRAG_THRESHOLD = 4;

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
    if (!nodeEl || event.button !== 0 || event.target.closest('.handle--out')) {
      return;
    }
    const node = store.getState().graph.nodes.find((item) => item.id === nodeEl.dataset.id);
    if (!node) {
      return;
    }
    drag = {
      id: node.id,
      el: nodeEl,
      start: { x: event.clientX, y: event.clientY },
      origin: { x: node.x, y: node.y },
      moved: false,
    };
    nodeEl.setPointerCapture(event.pointerId);
  });

  svg.addEventListener('pointermove', (event) => {
    if (!drag) {
      return;
    }
    const k = store.getState().ui.viewport.k;
    const sx = event.clientX - drag.start.x;
    const sy = event.clientY - drag.start.y;
    if (!drag.moved && Math.hypot(sx, sy) < DRAG_THRESHOLD) {
      return;
    }
    if (!drag.moved) {
      drag.moved = true;
      svg.classList.add('canvas--dragging');
      store.dispatch({ type: 'SELECT', id: drag.id });
    }
    store.dispatch({
      type: 'MOVE_STEP',
      id: drag.id,
      x: drag.origin.x + sx / k,
      y: drag.origin.y + sy / k,
    });
  });

  const end = (event) => {
    if (!drag) {
      return;
    }
    const finished = drag;
    drag = null;
    svg.classList.remove('canvas--dragging');
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
    }
  });
}
