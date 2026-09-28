// Estado vacio del lienzo: sugerencias de primer paso y opcion de partir de la plantilla.
import { getCatalogEntry } from '../data/catalog.js';
import { centerPosition } from './view-actions.js';
import { svgEl } from './shapes.js';
import { h } from '../ui/dom.js';

const FIRST_STEPS = [
  ['entiende', 'Entender la consulta del cliente'],
  ['seguridad', 'Proteger los datos primero'],
  ['sistemas', 'Consultar tus sistemas'],
  ['documentos', 'Buscar en documentos de la empresa'],
];

function suggestion(store, svg, [step, text]) {
  const entry = getCatalogEntry(step);
  const button = h('button', 'btn empty__suggest');
  button.type = 'button';
  button.setAttribute('aria-label', `Agregar como primer paso: ${entry.label}. ${text}`);
  const chip = h('span', `chip chip--${entry.category}`);
  const art = svgEl('svg', { class: 'icon', viewBox: '0 0 24 24' });
  art.setAttribute('aria-hidden', 'true');
  art.innerHTML = entry.icon;
  chip.append(art);
  button.append(chip, h('span', 'empty__suggest-text', text));
  button.addEventListener('click', () => {
    const { x, y } = centerPosition(store, svg);
    store.dispatch({ type: 'ADD_STEP', step, x, y });
  });
  return button;
}

export function emptyState(store, svg, onTemplate) {
  const box = h('div', 'empty');
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', 'Lienzo vacío');
  const art = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  art.setAttribute('class', 'empty__art');
  art.setAttribute('viewBox', '0 0 160 96');
  art.setAttribute('aria-hidden', 'true');
  art.innerHTML =
    '<rect x="6" y="10" width="52" height="34" rx="9"/><rect x="102" y="52" width="52" height="34" rx="9"/><path d="M58 27h20a14 14 0 0 1 14 14v11"/><circle cx="58" cy="27" r="4"/><circle cx="102" cy="69" r="4"/>';
  const list = h('div', 'empty__suggestions');
  list.setAttribute('role', 'group');
  list.setAttribute('aria-label', 'Ideas para el primer paso');
  list.append(...FIRST_STEPS.map((item) => suggestion(store, svg, item)));
  const template = h('button', 'btn empty__template', 'Empezar desde una plantilla de seguimiento');
  template.type = 'button';
  template.addEventListener('click', onTemplate);
  box.append(
    art,
    h('h2', 'empty__title', 'Tu lienzo está vacío'),
    h('p', 'muted', 'Elige con qué paso empezar, o usa «Agregar un paso» para ver todos los pasos.'),
    list,
    template,
  );
  return box;
}
