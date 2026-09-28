// Acciones de viewport reutilizables (botones, teclado, minimapa, paleta).
import { NODE_W, NODE_H } from './shapes.js';
import {
  zoomAt,
  screenToWorld,
  fitViewport,
  nodesBounds,
  revealNode,
  ZOOM,
} from './viewport.js';

const READABLE_ZOOM = 0.55;

export function canvasSize(svg) {
  const rect = svg.getBoundingClientRect();
  return { width: rect.width, height: rect.height, left: rect.left, top: rect.top };
}

export function setViewport(store, viewport) {
  store.dispatch({ type: 'SET_VIEWPORT', viewport });
}

export function zoomBy(store, svg, factor) {
  const { width, height } = canvasSize(svg);
  setViewport(store, zoomAt(store.getState().ui.viewport, factor, width / 2, height / 2));
}

export function zoomStep(store, svg, direction) {
  zoomBy(store, svg, direction > 0 ? ZOOM.step : 1 / ZOOM.step);
}

export function fitToScreen(store, svg) {
  const { width, height } = canvasSize(svg);
  setViewport(store, fitViewport(store.getState().graph.nodes, width, height));
}

export function panBy(store, dx, dy) {
  const vp = store.getState().ui.viewport;
  setViewport(store, { ...vp, x: vp.x + dx, y: vp.y + dy });
}

export function revealById(store, svg, id) {
  const node = store.getState().graph.nodes.find((item) => item.id === id);
  if (!node) {
    return;
  }
  const { width, height } = canvasSize(svg);
  const next = revealNode(store.getState().ui.viewport, node, width, height);
  if (next !== store.getState().ui.viewport) {
    setViewport(store, next);
  }
}

export function clientToWorld(store, svg, clientX, clientY) {
  const { left, top } = canvasSize(svg);
  return screenToWorld(store.getState().ui.viewport, clientX - left, clientY - top);
}

// Posicion para un paso nuevo: centro visible del lienzo, sin apilarlo sobre otro.
export function centerPosition(store, svg) {
  const { width, height, left, top } = canvasSize(svg);
  // En movil la hoja de ajustes tapa la mitad inferior: el paso nuevo se coloca mas arriba.
  const fy = width < 768 ? 0.3 : 0.5;
  const center = clientToWorld(store, svg, left + width / 2, top + height * fy);
  const { nodes } = store.getState().graph;
  let x = center.x - NODE_W / 2;
  let y = center.y - NODE_H / 2;
  const busy = () => nodes.some((node) => Math.abs(node.x - x) < 24 && Math.abs(node.y - y) < 24);
  for (let i = 0; i < 20 && busy(); i += 1) {
    x += 28;
    y += 28;
  }
  return { x, y };
}

// Vista inicial: encuadra todo; en pantallas estrechas prioriza lo legible (inicio del flujo).
export function initialFit(store, svg) {
  const { width, height } = canvasSize(svg);
  const { nodes } = store.getState().graph;
  const fit = fitViewport(nodes, width, height);
  const box = nodesBounds(nodes);
  if (fit.k >= READABLE_ZOOM || !box) {
    setViewport(store, fit);
    return;
  }
  const y = (height - (box.maxY - box.minY) * READABLE_ZOOM) / 2 - box.minY * READABLE_ZOOM;
  setViewport(store, { k: READABLE_ZOOM, x: 24 - box.minX * READABLE_ZOOM, y });
}
