// Dibujo (cadenas SVG estaticas) de cada tipo de personaje sobre una cuadricula de 64 x 64.
// Solo recibe colores y trazos de js/data/avatars.js: nada del usuario llega al marcado.
const INK = '#163a65';
const PLATE = '#f8fafc';
const EDGE = 'rgba(22,58,101,0.4)';

function robot(colors) {
  return `
    <line x1="32" y1="8" x2="32" y2="15" stroke="${PLATE}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="32" cy="7.5" r="3" fill="${colors[1]}" stroke="${PLATE}" stroke-width="1.5"/>
    <rect x="9" y="26" width="6" height="12" rx="3" fill="#dbe7f3" stroke="${EDGE}"/>
    <rect x="49" y="26" width="6" height="12" rx="3" fill="#dbe7f3" stroke="${EDGE}"/>
    <rect x="13" y="15" width="38" height="32" rx="12" fill="${PLATE}" stroke="${EDGE}" stroke-width="1.5"/>
    <rect x="18" y="22" width="28" height="15" rx="7.5" fill="${INK}"/>
    <circle cx="26" cy="29.5" r="3" fill="#12d27c"/><circle cx="38" cy="29.5" r="3" fill="#12d27c"/>
    <path d="M27 42q5 4 10 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="21" y="50" width="22" height="14" rx="7" fill="#dbe7f3" stroke="${EDGE}"/>`;
}

function hairBack(style, hair) {
  return style === 2 ? `<path d="M17 30a15 15 0 0130 0v16H17z" fill="${hair}"/>` : '';
}

function hairFront(style, hair) {
  const cap = `<path d="M18.5 29a13.5 13.5 0 0127 0q-6-9-13.5-9t-13.5 9z" fill="${hair}"/>`;
  return style === 1 ? `<circle cx="32" cy="14" r="5.5" fill="${hair}"/>${cap}` : cap;
}

function persona(colors, { skin, hair, style }) {
  return `
    ${hairBack(style, hair)}
    <path d="M8 64q0-17 24-17t24 17z" fill="${INK}"/>
    <path d="M26 47q6 6 12 0" fill="none" stroke="${PLATE}" stroke-width="2" stroke-linecap="round"/>
    <rect x="28.5" y="40" width="7" height="9" rx="3" fill="${skin}"/>
    <circle cx="32" cy="31" r="13" fill="${skin}"/>
    ${hairFront(style, hair)}
    <circle cx="27.5" cy="32" r="1.8" fill="${INK}"/><circle cx="36.5" cy="32" r="1.8" fill="${INK}"/>
    <circle cx="24" cy="36" r="2.4" fill="#ef8b72" opacity="0.35"/><circle cx="40" cy="36" r="2.4" fill="#ef8b72" opacity="0.35"/>
    <path d="M28 37q4 3.5 8 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    <path d="M17 32a15 15 0 0130 0" fill="none" stroke="${PLATE}" stroke-width="2" stroke-linecap="round"/>
    <rect x="14.5" y="30" width="4" height="8" rx="2" fill="${PLATE}"/><rect x="45.5" y="30" width="4" height="8" rx="2" fill="${PLATE}"/>`;
}

function orbe(colors, avatar, gradId) {
  return `
    <circle cx="32" cy="32" r="24" fill="#fff" opacity="0.16"/>
    <circle cx="32" cy="32" r="18" fill="url(#${gradId}-orb)" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>
    <ellipse cx="25" cy="23" rx="6" ry="3.4" fill="#fff" opacity="0.6" transform="rotate(-30 25 23)"/>
    <ellipse cx="32" cy="32" rx="26" ry="8" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.7" transform="rotate(-24 32 32)"/>
    <ellipse cx="26.5" cy="33" rx="2.4" ry="3.6" fill="${INK}"/><ellipse cx="37.5" cy="33" rx="2.4" ry="3.6" fill="${INK}"/>
    <path d="M27.5 40q4.5 4 9 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="10" cy="20" r="1.8" fill="#fff"/><circle cx="55" cy="14" r="1.4" fill="#fff"/>`;
}

export const ART = { robot, persona, orbe };
