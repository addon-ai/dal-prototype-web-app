// Paleta de pasos en lenguaje de negocio. Cada paso es un boton "Agregar": Enter o clic
// lo suma al lienzo, lo selecciona y lo anuncia con su costo estimado.
import { CATALOG } from '../data/catalog.js';
import { attachPaletteDrag } from '../canvas/drag.js';
import { shapePath, svgEl } from '../canvas/shapes.js';

function iconSvg(entry) {
  const svg = svgEl('svg', { class: 'icon palette-item__icon', viewBox: '0 0 24 24' });
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = entry.icon;
  return svg;
}

function shapeSvg(entry) {
  const svg = svgEl('svg', { class: 'palette-item__shape', viewBox: '0 0 176 72' });
  svg.setAttribute('aria-hidden', 'true');
  svg.append(svgEl('path', { d: shapePath(entry.shape) }));
  return svg;
}

function text(tag, className, value) {
  const el = document.createElement(tag);
  el.className = className;
  el.textContent = value;
  return el;
}

function buildItem(entry) {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `palette-item palette-item--${entry.category}`;
  button.dataset.step = entry.step;
  button.setAttribute('aria-label', `Agregar paso: ${entry.label}. ${entry.description}`);
  const body = document.createElement('span');
  body.className = 'palette-item__body';
  body.append(
    text('span', 'palette-item__name', entry.label),
    text('span', 'palette-item__desc', entry.description),
  );
  button.append(
    iconSvg(entry),
    body,
    shapeSvg(entry),
    text('span', 'palette-item__action', 'Agregar'),
  );
  li.append(button);
  return li;
}

export function mountPalette({ palette, toggle, list, wrap, svg, store }) {
  list.replaceChildren(...CATALOG.map(buildItem));
  const drag = attachPaletteDrag(list, wrap, svg, store);

  function setOpen(open) {
    palette.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  const sheetMode = () => getComputedStyle(toggle).display !== 'none';

  toggle.addEventListener('click', () => setOpen(palette.dataset.open !== 'true'));

  list.addEventListener('click', (event) => {
    const item = event.target.closest('[data-step]');
    if (!item || drag.consumeDrag()) {
      return;
    }
    store.dispatch({ type: 'ADD_STEP', step: item.dataset.step });
    if (sheetMode()) {
      setOpen(false);
      toggle.focus();
    }
  });
}
