// Receta tecnica (para TI): JSON y YAML equivalentes, en vivo, con copiar y descargar.
import { toWire } from '../domain/to-wire.js';
import { toYaml } from '../domain/yaml.js';
import { h } from './dom.js';

const FORMATS = [
  { id: 'json', label: 'JSON', mime: 'application/json', ext: 'json' },
  { id: 'yaml', label: 'YAML', mime: 'text/yaml', ext: 'yaml' },
];

function render(format, graph) {
  const wire = toWire(graph);
  return format === 'json' ? JSON.stringify(wire, null, 2) : toYaml(wire);
}

function selectText(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

export function mountRecipe(details, body, store) {
  let active = 'json';
  const tabs = h('div', 'tabs');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Formato de la receta');
  const tabButtons = FORMATS.map((format) => {
    const button = h('button', 'tabs__btn', format.label);
    button.type = 'button';
    button.id = `recipe-tab-${format.id}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', 'recipe-panel');
    button.dataset.format = format.id;
    return button;
  });
  tabs.append(...tabButtons);

  const copy = h('button', 'btn', 'Copiar');
  copy.type = 'button';
  const download = h('button', 'btn', 'Descargar');
  download.type = 'button';
  const status = h('span', 'recipe__status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const toolbar = h('div', 'recipe__toolbar');
  toolbar.append(tabs, copy, download, status);

  const code = h('code', 'recipe__code');
  const pre = h('pre', 'recipe__pre');
  pre.id = 'recipe-panel';
  pre.tabIndex = 0;
  pre.setAttribute('role', 'tabpanel');
  pre.append(code);
  body.replaceChildren(
    h(
      'p',
      'muted',
      'Descripción técnica del asistente que se está armando. Se actualiza al editar.',
    ),
    toolbar,
    pre,
  );

  const current = () => render(active, store.getState().graph);
  function paint() {
    code.textContent = current();
    tabButtons.forEach((button) => {
      const on = button.dataset.format === active;
      button.setAttribute('aria-selected', String(on));
      button.tabIndex = on ? 0 : -1;
    });
    pre.setAttribute('aria-labelledby', `recipe-tab-${active}`);
  }

  tabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-format]');
    if (button) {
      active = button.dataset.format;
      status.textContent = '';
      paint();
    }
  });
  tabs.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }
    active = active === 'json' ? 'yaml' : 'json';
    paint();
    tabButtons.find((button) => button.dataset.format === active).focus();
  });

  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(current());
      status.textContent = 'Copiado';
    } catch (error) {
      selectText(code);
      status.textContent = 'No se pudo copiar. El texto quedó seleccionado: cópialo con Ctrl+C.';
    }
  });

  download.addEventListener('click', () => {
    const format = FORMATS.find((item) => item.id === active);
    const blob = new Blob([current()], { type: format.mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receta-asistente.${format.ext}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = `Descargado: receta-asistente.${format.ext}`;
  });

  const syncExpanded = () => {
    details.querySelector('summary').setAttribute('aria-expanded', String(details.open));
  };
  details.addEventListener('toggle', syncExpanded);
  syncExpanded();

  paint();
  store.subscribe((state) => state.graph, paint);
}
