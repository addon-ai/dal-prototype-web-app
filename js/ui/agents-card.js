// Tarjetas de la coleccion de agentes (datos mock).
import { h, icon } from './dom.js';
import { ME } from '../data/agents/index.js';

const STATUS = {
  activo: { label: 'Activo', path: 'M5 12l5 5 9-10', cls: 'ok' },
  borrador: { label: 'Borrador', path: 'M4 20h4L19 9l-4-4L4 16z', cls: 'draft' },
  'en-revision': {
    label: 'En revisión',
    path: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z',
    cls: 'review',
  },
};
const ICONS = [
  'M4 5h16v11H9l-5 4z',
  'M12 3l8 4v5c0 5-4 8-8 9-4-1-8-4-8-9V7z',
  'M3 7h11v9H3zM14 10h4l3 3v3h-7z',
  'M6 3h8l4 4v14H6zM9 12h6M9 16h6',
  'M5 4h14v16H5zM9 9h6M9 13h6',
  'M12 3a6 6 0 016 6c0 5 2 6 2 6H4s2-1 2-6a6 6 0 016-6zM10 19a2 2 0 004 0',
  'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18',
];

export function initials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}

export function relativeDate(days) {
  if (days === 0) {
    return 'hoy';
  }
  return days === 1 ? 'ayer' : `hace ${days} días`;
}

function metric(value, label) {
  const box = h('div', 'agent-metric');
  box.append(h('strong', 'agent-metric__value', value), h('span', 'agent-metric__label', label));
  return box;
}

export function agentCard(agent, index, onOpen) {
  const status = STATUS[agent.status];
  const card = h('li', 'agent-card panel');
  const head = h('div', 'agent-card__head');
  const chip = h('span', 'agent-card__icon');
  chip.append(icon(ICONS[index % ICONS.length]));
  const title = h('h2', 'agent-card__title', agent.name);
  const badge = h('span', `badge badge--${status.cls}`);
  badge.append(icon(status.path), h('span', '', status.label));
  head.append(chip, title);
  const owner = h('span', 'agent-owner');
  const mine = agent.owner === ME;
  owner.append(
    h('span', 'avatar avatar--sm', initials(agent.owner)),
    h('span', '', mine ? 'Yo' : agent.owner),
  );
  const scope = h('span', 'agent-scope', agent.scope === 'personal' ? 'Personal' : 'Organización');
  const meta = h('div', 'agent-card__meta');
  meta.append(owner, scope, h('span', '', `Editado ${relativeDate(agent.edited)}`));
  const metrics = h('div', 'agent-card__metrics');
  metrics.append(
    metric(agent.casos.toLocaleString('es-CO'), 'casos del mes'),
    metric(`${agent.auto} %`, 'automáticos'),
  );
  const open = h('button', 'btn btn--primary agent-card__open', 'Abrir en el constructor');
  open.type = 'button';
  open.setAttribute('aria-label', `Abrir en el constructor: ${agent.name}`);
  open.addEventListener('click', () => onOpen(agent.id));
  card.append(head, badge, h('p', 'agent-card__desc', agent.description), meta, metrics, open);
  return card;
}

export function newAgentCard(onCreate) {
  const card = h('li', 'agent-card agent-card--new panel');
  card.append(
    h('h2', 'agent-card__title', 'Nuevo agente'),
    h('p', 'agent-card__desc', 'Empieza con un lienzo vacío o parte de la plantilla de seguimiento.'),
  );
  [
    ['Empezar en blanco', false, 'btn btn--primary'],
    ['Usar la plantilla de seguimiento', true, 'btn'],
  ].forEach(([text, fromTemplate, cls]) => {
    const button = h('button', cls, text);
    button.type = 'button';
    button.addEventListener('click', () => onCreate(fromTemplate));
    card.append(button);
  });
  return card;
}
