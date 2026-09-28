// Matematica pura del viewport (zoom y paneo). Coordenadas de pantalla relativas al lienzo.
import { NODE_W, NODE_H } from './shapes.js';

export const ZOOM = { min: 0.3, max: 2, step: 1.2 };

export const clampZoom = (k) => Math.min(ZOOM.max, Math.max(ZOOM.min, k));

export function zoomAt(vp, factor, px, py) {
  const k = clampZoom(vp.k * factor);
  const ratio = k / vp.k;
  return { k, x: px - (px - vp.x) * ratio, y: py - (py - vp.y) * ratio };
}

export function screenToWorld(vp, px, py) {
  return { x: (px - vp.x) / vp.k, y: (py - vp.y) / vp.k };
}

export function nodesBounds(nodes) {
  if (nodes.length === 0) {
    return null;
  }
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs) + NODE_W,
    maxY: Math.max(...ys) + NODE_H,
  };
}

// Margen proporcional al lienzo: holgado pero sin desperdiciar espacio.
export function fitPad(width, height) {
  return Math.round(Math.max(16, Math.min(32, Math.min(width, height) * 0.035)));
}

// Viewport que encuadra todos los pasos con margen; sin pasos, vista neutra.
// `inset` reserva un borde izquierdo (controles flotantes) para que no tapen el primer paso.
export function fitViewport(nodes, width, height, inset = 0, pad = fitPad(width, height)) {
  const box = nodesBounds(nodes);
  if (!box || width <= 0 || height <= 0) {
    return { x: 0, y: 0, k: 1 };
  }
  const w = box.maxX - box.minX;
  const h = box.maxY - box.minY;
  const k = clampZoom(Math.min(1.25, (width - inset - pad * 2) / w, (height - pad * 2) / h));
  return {
    k,
    x: inset + (width - inset - w * k) / 2 - box.minX * k,
    y: (height - h * k) / 2 - box.minY * k,
  };
}

// Desplaza el viewport lo minimo para que el paso quede visible.
export function revealNode(vp, node, width, height, pad = 24) {
  const left = node.x * vp.k + vp.x;
  const top = node.y * vp.k + vp.y;
  const right = left + NODE_W * vp.k;
  const bottom = top + NODE_H * vp.k;
  let dx = 0;
  let dy = 0;
  if (left < pad) {
    dx = pad - left;
  } else if (right > width - pad) {
    dx = width - pad - right;
  }
  if (top < pad) {
    dy = pad - top;
  } else if (bottom > height - pad) {
    dy = height - pad - bottom;
  }
  return dx === 0 && dy === 0 ? vp : { ...vp, x: vp.x + dx, y: vp.y + dy };
}
