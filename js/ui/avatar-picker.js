// Selector de avatar: radiogroup con flechas, Inicio y Fin (seleccion y foco se mueven juntos).
import { AVATARS } from '../data/avatars.js';
import { createAgentAvatar } from './avatar.js';
import { h, icon } from './dom.js';

export function createAvatarPicker({ value, onChange }) {
  let current = value;
  const group = h('div', 'avatar-picker');
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-label', 'Avatar del agente');
  const options = AVATARS.map((avatar) => {
    const option = h('button', 'avatar-picker__opt');
    option.type = 'button';
    option.setAttribute('role', 'radio');
    option.setAttribute('aria-label', avatar.label);
    option.title = avatar.label;
    option.dataset.avatar = avatar.id;
    const mark = h('span', 'avatar-picker__mark');
    mark.append(icon('M5 12l5 5 9-10'));
    option.append(createAgentAvatar({ avatarId: avatar.id, size: 48, decorative: true }), mark);
    return option;
  });
  group.append(...options);

  function paint() {
    options.forEach((option) => {
      const on = option.dataset.avatar === current;
      option.setAttribute('aria-checked', String(on));
      option.tabIndex = on ? 0 : -1;
    });
  }

  function select(id, focus) {
    current = id;
    paint();
    if (focus) {
      options.find((option) => option.dataset.avatar === id).focus();
    }
    onChange(id);
  }

  group.addEventListener('click', (event) => {
    const option = event.target.closest('.avatar-picker__opt');
    if (option) {
      select(option.dataset.avatar, false);
    }
  });
  group.addEventListener('keydown', (event) => {
    const index = AVATARS.findIndex((avatar) => avatar.id === current);
    const last = AVATARS.length - 1;
    const moves = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: last,
    };
    if (event.key in moves) {
      event.preventDefault();
      const next = (moves[event.key] + AVATARS.length) % AVATARS.length;
      select(AVATARS[next].id, true);
    }
  });
  paint();
  return { el: group, get: () => current, set: (id) => { current = id; paint(); } };
}
