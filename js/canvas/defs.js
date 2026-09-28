// Definiciones SVG compartidas: flechas de las conexiones y patron de puntos del fondo.
import { svgEl } from './shapes.js';

const DOT_GAP = 20;

function marker(id) {
  const el = svgEl('marker', {
    id,
    viewBox: '0 0 10 10',
    refX: 9,
    refY: 5,
    markerWidth: 11,
    markerHeight: 11,
    markerUnits: 'userSpaceOnUse',
    orient: 'auto-start-reverse',
  });
  el.append(svgEl('path', { d: 'M0,0 L10,5 L0,10 z', class: `arrow ${id}` }));
  return el;
}

export function buildDefs() {
  const defs = svgEl('defs');
  ['arrow', 'arrow-cond', 'arrow-active'].forEach((id) => defs.append(marker(id)));
  const dots = svgEl('pattern', {
    id: 'dots',
    width: DOT_GAP,
    height: DOT_GAP,
    patternUnits: 'userSpaceOnUse',
  });
  dots.append(svgEl('circle', { cx: 1, cy: 1, r: 1.25, class: 'canvas__dot' }));
  defs.append(dots);
  return defs;
}

// El fondo de puntos sigue al viewport: se desplaza y escala con el contenido.
export function syncDots(svg, vp) {
  const dots = svg.querySelector('#dots');
  const gap = vp.k < 0.6 ? DOT_GAP * 2 : DOT_GAP;
  dots.setAttribute('width', gap);
  dots.setAttribute('height', gap);
  dots.setAttribute('patternTransform', `translate(${vp.x} ${vp.y}) scale(${vp.k})`);
}
