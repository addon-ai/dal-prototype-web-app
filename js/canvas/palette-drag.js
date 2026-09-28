// Arrastre desde la paleta al lienzo (mouse/lapiz). En tactil se usa el boton "Agregar".
// Devuelve `consumeDrag()`: true si el ultimo gesto fue un arrastre (hay que ignorar el clic).
import { getCatalogEntry } from '../data/catalog.js';
import { NODE_W, NODE_H, svgEl } from './shapes.js';
import { clientToWorld } from './view-actions.js';

const GHOST_THRESHOLD = 6;

function createGhost(entry) {
  const ghost = document.createElement('div');
  ghost.className = `ghost ghost--${entry.category}`;
  ghost.setAttribute('aria-hidden', 'true');
  const chip = document.createElement('span');
  chip.className = 'ghost__chip';
  const icon = svgEl('svg', { class: 'icon', viewBox: '0 0 24 24' });
  icon.innerHTML = entry.icon;
  chip.append(icon);
  const text = document.createElement('span');
  text.textContent = entry.label;
  ghost.append(chip, text);
  document.body.append(ghost);
  return ghost;
}

function isInside(rect, event) {
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

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
      wrap.classList.toggle('canvas-wrap--drop', isInside(wrap.getBoundingClientRect(), event));
    }
  });

  const end = (event) => {
    if (!session) {
      return;
    }
    const done = session;
    session = null;
    wrap.classList.remove('canvas-wrap--drop');
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
    if (event.type === 'pointerup' && isInside(wrap.getBoundingClientRect(), event)) {
      const point = clientToWorld(store, svg, event.clientX, event.clientY);
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
