// Constantes de geometria de las tarjetas de paso y utilidades SVG.
export const NODE_W = 196;
export const NODE_H = 92;
export const HEADER_H = 32;
export const SVG_NS = 'http://www.w3.org/2000/svg';

export function svgEl(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
  return el;
}

// Corta un texto en hasta `maxLines` lineas de `maxChars` caracteres.
export function wrapLabel(text, maxChars, maxLines = 2) {
  const lines = [];
  let current = '';
  text.split(/\s+/).forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  });
  if (current) {
    lines.push(current);
  }
  if (lines.length <= maxLines) {
    return lines;
  }
  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1];
  kept[maxLines - 1] = `${last.slice(0, Math.max(1, maxChars - 1))}…`;
  return kept;
}

export function truncate(text, max) {
  return text.length <= max ? text : `${text.slice(0, Math.max(1, max - 1))}…`;
}
