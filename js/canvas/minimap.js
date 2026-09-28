// Minimapa: vista general de los pasos y del area visible; clic o arrastre para moverse.
// Es una ayuda para puntero: el teclado usa los botones de zoom y encuadre.
import { nodesBounds } from './viewport.js';
import { NODE_W, NODE_H, svgEl } from './shapes.js';
import { canvasSize, setViewport } from './view-actions.js';
import { getCatalogEntry } from '../data/catalog.js';

const PAD = 60;

export function mountMinimap(wrap, svg, store) {
  const box = document.createElement('div');
  box.className = 'minimap';
  box.setAttribute('aria-hidden', 'true');
  const mini = svgEl('svg', { class: 'minimap__svg', preserveAspectRatio: 'xMidYMid meet' });
  box.append(mini);
  wrap.append(box);

  function view() {
    const { width, height } = canvasSize(svg);
    const { x, y, k } = store.getState().ui.viewport;
    return { x: -x / k, y: -y / k, w: width / k, h: height / k };
  }

  function draw() {
    const { nodes } = store.getState().graph;
    const v = view();
    const b = nodesBounds(nodes) ?? { minX: v.x, minY: v.y, maxX: v.x + v.w, maxY: v.y + v.h };
    const minX = Math.min(b.minX, v.x) - PAD;
    const minY = Math.min(b.minY, v.y) - PAD;
    const maxX = Math.max(b.maxX, v.x + v.w) + PAD;
    const maxY = Math.max(b.maxY, v.y + v.h) + PAD;
    mini.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
    mini.replaceChildren();
    nodes.forEach((node) => {
      const entry = getCatalogEntry(node.step);
      mini.append(
        svgEl('rect', {
          class: `minimap__node minimap__node--${entry.category}`,
          x: node.x,
          y: node.y,
          width: NODE_W,
          height: NODE_H,
          rx: 10,
        }),
      );
    });
    const outer = `M${minX},${minY}H${maxX}V${maxY}H${minX}Z`;
    const inner = `M${v.x},${v.y}h${v.w}v${v.h}h${-v.w}Z`;
    mini.append(
      svgEl('path', { class: 'minimap__mask', d: `${outer}${inner}`, 'fill-rule': 'evenodd' }),
      svgEl('rect', { class: 'minimap__view', x: v.x, y: v.y, width: v.w, height: v.h }),
    );
  }

  function moveTo(event) {
    const matrix = mini.getScreenCTM();
    if (!matrix) {
      return;
    }
    const point = mini.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const world = point.matrixTransform(matrix.inverse());
    const { width, height } = canvasSize(svg);
    const k = store.getState().ui.viewport.k;
    setViewport(store, { k, x: width / 2 - world.x * k, y: height / 2 - world.y * k });
  }

  let dragging = false;
  box.addEventListener('pointerdown', (event) => {
    dragging = true;
    box.setPointerCapture(event.pointerId);
    moveTo(event);
  });
  box.addEventListener('pointermove', (event) => {
    if (dragging) {
      moveTo(event);
    }
  });
  const stop = () => {
    dragging = false;
  };
  box.addEventListener('pointerup', stop);
  box.addEventListener('pointercancel', stop);

  store.subscribe((state) => state.graph, draw);
  store.subscribe((state) => state.ui.viewport, draw);
  new ResizeObserver(draw).observe(svg);
  draw();
}
