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

const READABLE_ZOOM = 0.55; // movil
const READABLE_ZOOM_WIDE = 0.45; // tablet y escritorio
const START_PAD = 16;
const FLOAT_INSET = 56; // ancho de los controles flotantes del lienzo

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
  setViewport(store, fitViewport(store.getState().graph.nodes, width, height, FLOAT_INSET));
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

// Vista inicial: encuadra todo; si eso queda ilegible (pantalla estrecha) muestra el inicio del
// flujo (primeras dos columnas, sin cortar la primera tarjeta) y "Ajustar" encuadra todo.
export function initialViewport(nodes, width, height) {
  const fit = fitViewport(nodes, width, height, FLOAT_INSET);
  const box = nodesBounds(nodes);
  const min = window.matchMedia('(max-width: 767px)').matches ? READABLE_ZOOM : READABLE_ZOOM_WIDE;
  if (fit.k >= min || !box) {
    return fit;
  }
  const xs = [...new Set(nodes.map((node) => node.x))].sort((a, b) => a - b);
  const span = (xs[1] ?? xs[0]) + NODE_W - box.minX;
  const k = Math.min(0.75, Math.max(min, (width - START_PAD * 2) / span));
  const first = nodes.reduce((a, b) => (b.x < a.x ? b : a));
  const cy = (first.y + NODE_H / 2) * k;
  return { k, x: START_PAD - box.minX * k, y: Math.max(START_PAD, height * 0.4 - cy) };
}

// Encuadre inicial y reencuadre automatico mientras el usuario no haya tocado la vista
// (cambio de tamano del lienzo por paneles, receta o giro del movil).
export function mountAutoFit(wrap, svg, store) {
  let last = null;
  let lastAgent = store.getState().ui.agentId;
  const apply = () => {
    const { width, height } = canvasSize(svg);
    if (width <= 0 || height <= 0) {
      return;
    }
    const current = store.getState().ui.viewport;
    const { agentId } = store.getState().ui;
    if (last && current !== last && agentId === lastAgent) {
      return;
    }
    lastAgent = agentId;
    setViewport(store, initialViewport(store.getState().graph.nodes, width, height));
    last = store.getState().ui.viewport;
  };
  new ResizeObserver(apply).observe(wrap);
}
