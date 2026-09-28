// Paleta de pasos en lenguaje de negocio: busqueda, categorias colapsables (acordeon) y
// tarjetas arrastrables. Cada tarjeta es un boton "Agregar": Enter o clic lo suma al lienzo,
// lo selecciona y lo anuncia con su costo estimado. Colapsable a una barra de iconos.
import { CATALOG } from '../data/catalog.js';
import { CATEGORIES } from '../data/categories.js';
import { attachPaletteDrag } from '../canvas/palette-drag.js';
import { centerPosition } from '../canvas/view-actions.js';
import { svgEl } from '../canvas/shapes.js';
import { h, icon } from './dom.js';

const ICON_CHEVRON = 'M6 9l6 6 6-6';
const ICON_PANEL = 'M4 5h16v14H4z M9 5v14';

function chipIcon(entry) {
  const chip = h('span', `chip chip--${entry.category}`);
  const svg = svgEl('svg', { class: 'icon', viewBox: '0 0 24 24' });
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = entry.icon;
  chip.append(svg);
  return chip;
}

function buildItem(entry) {
  const li = h('li', 'palette-item-wrap');
  const button = h('button', `palette-item palette-item--${entry.category}`);
  button.type = 'button';
  button.dataset.step = entry.step;
  button.title = entry.label;
  button.setAttribute('aria-label', `Agregar paso: ${entry.label}. ${entry.description}`);
  const body = h('span', 'palette-item__body');
  body.append(
    h('span', 'palette-item__name', entry.label),
    h('span', 'palette-item__desc', entry.description),
  );
  button.append(chipIcon(entry), body, h('span', 'palette-item__action', 'Agregar'));
  li.append(button);
  return li;
}

function buildCategory(category, items, open) {
  const section = h('section', 'pal-cat');
  section.dataset.cat = category.id;
  section.dataset.open = String(open);
  const head = h('h3', 'pal-cat__title');
  const toggle = h('button', 'pal-cat__head');
  toggle.type = 'button';
  toggle.id = `pal-head-${category.id}`;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-controls', `pal-list-${category.id}`);
  toggle.append(
    h('span', `pal-cat__dot pal-cat__dot--${category.id}`),
    h('span', 'pal-cat__name', category.label),
    h('span', 'pal-cat__count', String(items.length)),
    icon(ICON_CHEVRON),
  );
  head.append(toggle);
  const list = h('ul', 'pal-cat__list');
  list.id = `pal-list-${category.id}`;
  list.setAttribute('aria-labelledby', toggle.id);
  list.append(...items.map(buildItem));
  section.append(head, list);
  return { section, toggle };
}

function buildSearch() {
  const wrapper = h('div', 'palette__search');
  const label = h('label', 'visually-hidden', 'Buscar un paso');
  const input = h('input', 'palette__input');
  input.type = 'search';
  input.id = 'palette-search';
  input.placeholder = 'Buscar un paso…';
  input.autocomplete = 'off';
  label.htmlFor = input.id;
  wrapper.append(label, input);
  return { wrapper, input };
}

export function mountPalette({ palette, toggle, panel, wrap, svg, store }) {
  const view = palette.closest('.view');
  const heading = h('div', 'palette__head');
  const collapse = h('button', 'btn btn--icon btn--ghost palette__collapse');
  collapse.type = 'button';
  collapse.setAttribute('aria-controls', 'palette-body');
  collapse.append(icon(ICON_PANEL));
  heading.append(h('h2', 'palette__title', 'Pasos'), collapse);

  const search = buildSearch();
  const status = h('p', 'visually-hidden');
  status.setAttribute('role', 'status');
  const empty = h('p', 'palette__empty', 'No hay pasos con ese nombre. Prueba con otra palabra.');
  empty.hidden = true;
  const body = h('div', 'palette__body');
  body.id = 'palette-body';
  const drag = attachPaletteDrag(body, wrap, svg, store);

  const cats = CATEGORIES.map((category, index) => {
    const items = CATALOG.filter((entry) => entry.category === category.id);
    return { category, items, ...buildCategory(category, items, index < 2) };
  });
  body.append(empty, ...cats.map((cat) => cat.section));
  panel.replaceChildren(heading, search.wrapper, status, body);

  function setCatOpen(cat, open) {
    cat.section.dataset.open = String(open);
    cat.toggle.setAttribute('aria-expanded', String(open));
  }
  cats.forEach((cat) => {
    cat.toggle.addEventListener('click', () => setCatOpen(cat, cat.section.dataset.open !== 'true'));
  });

  const userOpen = cats.map((cat) => cat.section.dataset.open === 'true');
  search.input.addEventListener('input', () => {
    const query = search.input.value.trim().toLowerCase();
    let total = 0;
    cats.forEach((cat, i) => {
      let matches = 0;
      cat.items.forEach((entry, j) => {
        const hit = !query || `${entry.label} ${entry.description}`.toLowerCase().includes(query);
        cat.section.querySelectorAll('.palette-item-wrap')[j].hidden = !hit;
        matches += hit ? 1 : 0;
      });
      cat.section.hidden = matches === 0;
      setCatOpen(cat, query ? true : userOpen[i]);
      total += matches;
    });
    empty.hidden = total > 0;
    status.textContent = query ? `${total} pasos encontrados.` : '';
  });
  cats.forEach((cat, i) => {
    cat.toggle.addEventListener('click', () => {
      userOpen[i] = cat.section.dataset.open === 'true';
    });
  });

  function setCollapsed(collapsed) {
    view.dataset.palette = collapsed ? 'collapsed' : 'expanded';
    collapse.setAttribute('aria-expanded', String(!collapsed));
    collapse.setAttribute('aria-label', collapsed ? 'Expandir la paleta de pasos' : 'Contraer la paleta de pasos');
    collapse.title = collapse.getAttribute('aria-label');
  }
  setCollapsed(false);
  collapse.addEventListener('click', () => setCollapsed(view.dataset.palette !== 'collapsed'));

  function setOpen(open) {
    palette.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  const sheetMode = () => getComputedStyle(toggle).display !== 'none';
  toggle.addEventListener('click', () => setOpen(palette.dataset.open !== 'true'));

  body.addEventListener('click', (event) => {
    const item = event.target.closest('[data-step]');
    if (!item || drag.consumeDrag()) {
      return;
    }
    const { x, y } = centerPosition(store, svg);
    store.dispatch({ type: 'ADD_STEP', step: item.dataset.step, x, y });
    if (sheetMode()) {
      setOpen(false);
      toggle.focus();
    }
  });
}
