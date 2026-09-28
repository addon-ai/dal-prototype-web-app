// Conectar arrastrando desde el puerto de salida de un paso hasta otro paso.
// Alternativas sin arrastre: tecla C + Enter, o "Conectar con el paso" en los ajustes.
import { NODE_W, NODE_H, svgEl } from './shapes.js';
import { bezier } from './edges.js';
import { clientToWorld } from './view-actions.js';

function targetNodeAt(event, sourceId) {
  const el = document.elementFromPoint(event.clientX, event.clientY);
  const node = el?.closest?.('.node');
  return node && node.dataset.id !== sourceId ? node : null;
}

export function attachConnectDrag(svg, store) {
  const layer = svg.querySelector('.canvas__temp');
  let session = null;

  svg.addEventListener('pointerdown', (event) => {
    const handle = event.target.closest('.handle--out');
    if (!handle || event.button !== 0) {
      return;
    }
    const nodeEl = handle.closest('.node');
    const node = store.getState().graph.nodes.find((item) => item.id === nodeEl.dataset.id);
    if (!node) {
      return;
    }
    event.preventDefault();
    const path = svgEl('path', { class: 'edge__temp', 'marker-end': 'url(#arrow-active)' });
    layer.replaceChildren(path);
    session = { node, nodeEl, path, target: null };
    nodeEl.classList.add('node--connecting');
    svg.classList.add('canvas--connecting');
    svg.setPointerCapture(event.pointerId);
  });

  svg.addEventListener('pointermove', (event) => {
    if (!session) {
      return;
    }
    const point = clientToWorld(store, svg, event.clientX, event.clientY);
    const from = { x: session.node.x + NODE_W, y: session.node.y + NODE_H / 2 };
    session.path.setAttribute('d', bezier(from, point).d);
    const target = targetNodeAt(event, session.node.id);
    if (target !== session.target) {
      session.target?.classList.remove('node--drop-target');
      target?.classList.add('node--drop-target');
      session.target = target;
    }
  });

  const end = (event) => {
    if (!session) {
      return;
    }
    const done = session;
    session = null;
    done.target?.classList.remove('node--drop-target');
    done.nodeEl.classList.remove('node--connecting');
    svg.classList.remove('canvas--connecting');
    layer.replaceChildren();
    if (svg.hasPointerCapture(event.pointerId)) {
      svg.releasePointerCapture(event.pointerId);
    }
    if (event.type === 'pointerup' && done.target) {
      store.dispatch({ type: 'CONNECT', from: done.node.id, to: done.target.dataset.id });
    }
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
}
