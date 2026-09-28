// Narrativa de validacion: Problema, Solucion, Decisor, Resultado, Hipotesis. BORRADOR.
import { NARRATIVE, PENDING_LABEL } from '../data/narrative.js';
import { h } from './dom.js';

function hypothesisText(text) {
  const p = h('p');
  text.split(/(\{[XYZ]\})/).forEach((part) => {
    const match = /^\{([XYZ])\}$/.exec(part);
    if (match) {
      p.append(h('mark', 'pending', `${match[1]}: ${PENDING_LABEL}`));
    } else {
      p.append(part);
    }
  });
  return p;
}

function variablesList(variables) {
  const dl = h('dl', 'vars');
  variables.forEach((variable) => {
    dl.append(h('dt', '', variable.id), h('dd', '', `${variable.descripcion}: ${variable.valor}`));
  });
  return dl;
}

function card(element, index) {
  const section = h('section', `panel narrative__card${element.variables ? ' narrative__card--wide' : ''}`);
  section.setAttribute('aria-labelledby', `narr-${element.id}`);
  const title = h('h2', 'narrative__title', `${index + 1}. ${element.titulo}`);
  title.id = `narr-${element.id}`;
  section.append(title);
  if (element.variables) {
    section.append(hypothesisText(element.texto), variablesList(element.variables));
  } else {
    section.append(h('p', '', element.texto));
  }
  return section;
}

export function mountNarrative(root, store) {
  const head = h('div', 'narrative__head');
  const heading = h('h1', '', NARRATIVE.titulo);
  heading.id = 'narrativa-title';
  heading.tabIndex = -1;
  head.append(heading, h('p', 'tag tag--draft', NARRATIVE.estado));
  const pending = h('section', 'panel');
  pending.append(h('h2', 'panel__title', 'Por completar en la sesión 2'));
  const list = h('ul', 'list');
  NARRATIVE.pendientes.forEach((text) => list.append(h('li', '', text)));
  pending.append(list);
  const links = h('nav', 'narrative__links');
  links.setAttribute('aria-label', 'Ir a otras secciones');
  NARRATIVE.enlaces.forEach((link) => {
    const button = h('button', 'btn', link.texto);
    button.type = 'button';
    button.addEventListener('click', () => store.dispatch({ type: 'SET_VIEW', view: link.view }));
    links.append(button);
  });
  const cards = NARRATIVE.elementos.map(card);
  root.replaceChildren(head, ...cards, pending, links);
  root.classList.add('narrative-grid');
}
