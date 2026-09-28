// Avatares SVG en linea, deterministas y sin imagenes externas.
// createAgentAvatar({ avatarId | seed, size, name, decorative, status, badge })
import { AVATARS, BADGES, PALETTES, getAvatar, hashSeed, pickPaletteKey } from '../data/avatars.js';
import { ART } from '../data/avatar-art.js';
import { STATUS } from './agent-status.js';
import { h, icon } from './dom.js';

const NS = 'http://www.w3.org/2000/svg';
let counter = 0;

function resolve(avatarId, seed) {
  const byId = getAvatar(avatarId);
  if (byId) {
    return { avatar: byId, colors: PALETTES[byId.palette] };
  }
  const avatar = AVATARS[hashSeed(seed ?? 'agente') % AVATARS.length];
  return { avatar, colors: PALETTES[pickPaletteKey(seed ?? 'agente')] };
}

function markup({ avatar, colors }, badgeKey, gradId) {
  const badge = BADGES[badgeKey] ?? BADGES[avatar.badge];
  return `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/>
      </linearGradient>
      <radialGradient id="${gradId}-orb" cx="0.4" cy="0.35" r="0.8">
        <stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#e9f1f8"/>
        <stop offset="1" stop-color="${colors[1]}"/>
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="32" fill="url(#${gradId})"/>
    <ellipse cx="22" cy="10" rx="20" ry="8" fill="#fff" opacity="0.14"/>
    ${ART[avatar.kind](colors, avatar, gradId)}
    <circle cx="49" cy="49" r="11.5" fill="${colors[0]}" stroke="#fff" stroke-width="2.4"/>
    <g transform="translate(42.2 42.2) scale(0.57)" fill="none" stroke="#fff" stroke-width="2.6"
       stroke-linecap="round" stroke-linejoin="round"><path d="${badge}"/></g>`;
}

export function createAgentAvatar({
  avatarId,
  seed,
  size = 40,
  name = '',
  decorative = false,
  status,
  badge,
} = {}) {
  counter += 1;
  const resolved = resolve(avatarId, seed);
  const root = h('span', 'agent-avatar');
  root.style.setProperty('--avatar-size', `${size}px`);
  root.dataset.avatar = resolved.avatar.id;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'agent-avatar__art');
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = markup(resolved, badge, `avt${counter}`);
  root.append(svg);
  if (decorative) {
    root.setAttribute('aria-hidden', 'true');
  } else {
    root.setAttribute('role', 'img');
    const who = name ? `Avatar de ${name}` : `Avatar: ${resolved.avatar.label}`;
    root.setAttribute('aria-label', status ? `${who}. Estado: ${STATUS[status].label}` : who);
  }
  if (status && STATUS[status]) {
    root.dataset.status = STATUS[status].cls;
    const glyph = h('span', 'agent-avatar__status');
    glyph.append(icon(STATUS[status].path));
    root.append(glyph);
  }
  return root;
}
