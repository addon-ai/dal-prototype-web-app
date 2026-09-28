// Zoom con la rueda (o pellizco) y paneo arrastrando el fondo. Mouse, lapiz y tactil.
import { zoomAt } from './viewport.js';
import { setViewport, canvasSize } from './view-actions.js';

const PAN_THRESHOLD = 4;
const WHEEL_SPEED = 0.0016;

export function attachPanZoom(svg, store) {
  const pointers = new Map();
  let pan = null;
  let pinch = null;

  const vp = () => store.getState().ui.viewport;
  function local(event) {
    const { left, top } = canvasSize(svg);
    return { x: event.clientX - left, y: event.clientY - top };
  }
  const distance = () => {
    const [a, b] = Array.from(pointers.values());
    return { d: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  };

  svg.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const point = local(event);
      setViewport(store, zoomAt(vp(), Math.exp(-event.deltaY * WHEEL_SPEED), point.x, point.y));
    },
    { passive: false },
  );

  svg.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.node, .edge') || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }
    pointers.set(event.pointerId, local(event));
    svg.setPointerCapture(event.pointerId);
    if (pointers.size === 1) {
      pan = { start: local(event), origin: { ...vp() }, moved: false };
    } else if (pointers.size === 2) {
      pan = null;
      const { d, mid } = distance();
      pinch = { d, mid, origin: { ...vp() } };
    }
  });

  svg.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId)) {
      return;
    }
    pointers.set(event.pointerId, local(event));
    if (pinch && pointers.size === 2) {
      const { d, mid } = distance();
      const base = zoomAt(pinch.origin, d / pinch.d, pinch.mid.x, pinch.mid.y);
      setViewport(store, { ...base, x: base.x + mid.x - pinch.mid.x, y: base.y + mid.y - pinch.mid.y });
    } else if (pan) {
      const point = local(event);
      const dx = point.x - pan.start.x;
      const dy = point.y - pan.start.y;
      if (!pan.moved && Math.hypot(dx, dy) < PAN_THRESHOLD) {
        return;
      }
      pan.moved = true;
      svg.classList.add('canvas--panning');
      setViewport(store, { ...pan.origin, x: pan.origin.x + dx, y: pan.origin.y + dy });
    }
  });

  const end = (event) => {
    if (!pointers.has(event.pointerId)) {
      return;
    }
    pointers.delete(event.pointerId);
    if (svg.hasPointerCapture(event.pointerId)) {
      svg.releasePointerCapture(event.pointerId);
    }
    if (pan && !pan.moved && event.type === 'pointerup') {
      store.dispatch({ type: 'SELECT', id: null });
    }
    if (pointers.size < 2) {
      pinch = null;
    }
    if (pointers.size === 0) {
      pan = null;
      svg.classList.remove('canvas--panning');
    }
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
}
