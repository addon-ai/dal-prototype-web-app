// Geometria de los pasos: cada tipo tiene una forma propia (la forma, el icono y el texto
// transmiten el significado; el color solo refuerza).
export const NODE_W = 176;
export const NODE_H = 72;
export const SVG_NS = 'http://www.w3.org/2000/svg';

const W = NODE_W;
const H = NODE_H;
const R = 10;

const PATHS = {
  rect: `M${R},0 H${W - R} A${R},${R} 0 0 1 ${W},${R} V${H - R} A${R},${R} 0 0 1 ${W - R},${H} H${R} A${R},${R} 0 0 1 0,${H - R} V${R} A${R},${R} 0 0 1 ${R},0 Z`,
  trapezoid: `M16,0 H${W - 16} L${W},${H} H0 Z`,
  document: `M0,0 H${W - 18} L${W},18 V${H} H0 Z`,
  hexagon: `M20,0 H${W - 20} L${W},${H / 2} L${W - 20},${H} H20 L0,${H / 2} Z`,
  diamond: `M${W / 2},0 L${W},${H / 2} L${W / 2},${H} L0,${H / 2} Z`,
  octagon: `M18,0 H${W - 18} L${W},18 V${H - 18} L${W - 18},${H} H18 L0,${H - 18} V18 Z`,
  circle: `M${H / 2},0 H${W - H / 2} A${H / 2},${H / 2} 0 0 1 ${W - H / 2},${H} H${H / 2} A${H / 2},${H / 2} 0 0 1 ${H / 2},0 Z`,
  envelope: `M0,8 Q0,0 8,0 H${W - 8} Q${W},0 ${W},8 V${H - 8} Q${W},${H} ${W - 8},${H} H8 Q0,${H} 0,${H - 8} Z`,
  parallelogram: `M22,0 H${W} L${W - 22},${H} H0 Z`,
};

// Posicion del icono, inicio del texto y ancho maximo por linea segun la forma.
const LAYOUT = {
  diamond: { iconX: 38, textX: 64, chars: 9 },
  hexagon: { iconX: 24, textX: 52, chars: 13 },
  octagon: { iconX: 20, textX: 48, chars: 14 },
  circle: { iconX: 22, textX: 50, chars: 14 },
  trapezoid: { iconX: 20, textX: 48, chars: 14 },
  parallelogram: { iconX: 26, textX: 54, chars: 13 },
  default: { iconX: 12, textX: 42, chars: 17 },
};

export function shapePath(shape) {
  return PATHS[shape] ?? PATHS.rect;
}

export function shapeLayout(shape) {
  return LAYOUT[shape] ?? LAYOUT.default;
}

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
