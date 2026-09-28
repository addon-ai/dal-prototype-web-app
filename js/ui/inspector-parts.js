// Piezas de formulario y encabezado del panel de ajustes (sin estado propio).
import { svgEl } from '../canvas/shapes.js';

const ICON_TRASH = 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3';
const ICON_CLOSE = 'M6 6l12 12M18 6L6 18';
export const ICON_LINK =
  'M9 15l6-6M8 12l-2 2a3.5 3.5 0 0 0 5 5l2-2M16 12l2-2a3.5 3.5 0 0 0-5-5l-2 2';

let uid = 0;

export function make(tag, className, textContent) {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  if (textContent !== undefined) {
    el.textContent = textContent;
  }
  return el;
}

export function field(labelText, control) {
  uid += 1;
  control.id = `insp-${uid}`;
  const wrapper = make('div', 'field');
  const label = make('label', 'field__label', labelText);
  label.htmlFor = control.id;
  wrapper.append(label, control);
  return wrapper;
}

export function button(label, className, onClick) {
  const b = make('button', `btn ${className}`.trim(), label);
  b.type = 'button';
  b.addEventListener('click', onClick);
  return b;
}

export function iconBtn(pathD, label, className, onClick) {
  const b = button('', className, onClick);
  const svg = svgEl('svg', { class: 'icon', viewBox: '0 0 24 24', 'aria-hidden': 'true' });
  svg.append(svgEl('path', { d: pathD }));
  b.prepend(svg);
  if (label) {
    b.append(make('span', '', label));
  }
  return b;
}

export function chip(entry) {
  const el = make('span', `chip chip--lg chip--${entry.category}`);
  const svg = svgEl('svg', { class: 'icon', viewBox: '0 0 24 24', 'aria-hidden': 'true' });
  svg.innerHTML = entry.icon;
  el.append(svg);
  return el;
}

export function edgeChip() {
  const el = make('span', 'chip chip--lg chip--edge');
  const svg = svgEl('svg', { class: 'icon', viewBox: '0 0 24 24', 'aria-hidden': 'true' });
  svg.append(svgEl('path', { d: ICON_LINK }));
  el.append(svg);
  return el;
}

export function header(store, { entry, title, subtitle, onDelete, deleteLabel }) {
  const head = make('header', 'inspector__head');
  const text = make('div', 'inspector__titles');
  const h2 = make('h2', 'inspector__title', title);
  text.append(h2, make('p', 'inspector__type', subtitle));
  head.append(entry ? chip(entry) : edgeChip(), text);
  const actions = make('div', 'inspector__head-actions');
  const del = iconBtn(ICON_TRASH, '', 'btn--icon btn--danger', onDelete);
  del.setAttribute('aria-label', deleteLabel);
  del.title = deleteLabel;
  const close = iconBtn(ICON_CLOSE, '', 'btn--icon btn--ghost inspector__close', () =>
    store.dispatch({ type: 'SELECT', id: null }),
  );
  close.setAttribute('aria-label', 'Cerrar los ajustes');
  actions.append(del, close);
  head.append(actions);
  return head;
}

