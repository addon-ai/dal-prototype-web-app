// Tarjetas de la coleccion de agentes (datos mock).
import { h, icon } from './dom.js';
import { ME } from '../data/agents/index.js';
import { STATUS } from './agent-status.js';
import { createAgentAvatar } from './avatar.js';

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

// Casilla de seleccion nativa: la etiqueta amplia el area clicable; el nombre accesible incluye al agente.
function selectBox(agent) {
  const label = h('label', 'check agent-card__check');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'check__input';
  input.dataset.id = agent.id;
  input.setAttribute('aria-label', `Seleccionar ${agent.name}`);
  label.append(input);
  return label;
}

// Cambio rapido de estado: activar / desactivar. Los cambios finos se hacen en "Editar agente".
function statusToggle(agent, status, onStatus) {
  const button = h('button', 'btn agent-card__state', status.action);
  button.type = 'button';
  button.dataset.statusFor = agent.id;
  button.setAttribute('aria-label', `${status.action} ${agent.name}`);
  button.addEventListener('click', () => onStatus(agent, status.next));
  return button;
}

export function agentCard(agent, { onOpen, onStatus }) {
  const status = STATUS[agent.status];
  const card = h('li', 'agent-card panel');
  const head = h('div', 'agent-card__head');
  const avatar = createAgentAvatar({
    avatarId: agent.avatarId,
    seed: agent.id,
    size: 56,
    name: agent.name,
    status: agent.status,
  });
  const badge = h('span', `badge badge--${status.cls}`);
  badge.append(icon(status.path), h('span', '', status.label));
  const titles = h('div', 'agent-card__titles');
  titles.append(h('h2', 'agent-card__title', agent.name), badge);
  head.append(avatar, titles);
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
    metric(agent.user ? '—' : agent.casos.toLocaleString('es-CO'), 'casos del mes'),
    metric(agent.user ? '—' : `${agent.auto} %`, 'automáticos'),
  );
  const actions = h('div', 'agent-card__actions');
  const open = h('button', 'btn btn--primary agent-card__open', 'Abrir en el constructor');
  open.type = 'button';
  open.setAttribute('aria-label', `Abrir en el constructor: ${agent.name}`);
  open.addEventListener('click', () => onOpen(agent.id));
  actions.append(open);
  actions.append(statusToggle(agent, status, onStatus));
  card.dataset.id = agent.id;
  card.append(selectBox(agent), head, h('p', 'agent-card__desc', agent.description), meta, metrics, actions);
  return card;
}

export function newAgentCard(onCreate) {
  const card = h('li', 'agent-card agent-card--new panel');
  const head = h('div', 'agent-card__head');
  head.append(
    createAgentAvatar({ avatarId: 'orbe-rayo', size: 56, decorative: true, badge: 'mas' }),
    h('h2', 'agent-card__title', 'Nuevo agente'),
  );
  card.append(
    head,
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
