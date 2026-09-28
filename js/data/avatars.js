// Coleccion de avatares de agente: datos puros (sin DOM). js/ui/avatar.js los dibuja como SVG.
// kind: 'robot' | 'persona' | 'orbe'. colors: degradado del fondo [oscuro, claro].
export const PALETTES = {
  oceano: ['#163a65', '#4b7aa3'],
  menta: ['#0a8044', '#12d27c'],
  turquesa: ['#1d5c66', '#338a7b'],
  violeta: ['#5b3bb8', '#a78bfa'],
  coral: ['#b8402f', '#ef8b72'],
  cielo: ['#2b5f95', '#7aa3c9'],
};
const PALETTE_KEYS = Object.keys(PALETTES);

// Insignias de funcion (trazos en una cuadricula de 24 x 24).
export const BADGES = {
  camion: 'M2 7h11v9H2zM13 10h4l3 3v3h-7M6 19.5a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zM17 19.5a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2z',
  mapa: 'M12 21s-6-5.5-6-10a6 6 0 0112 0c0 4.5-6 10-6 10zM12 8.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z',
  reloj: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2',
  documento: 'M6 3h8l4 4v14H6zM9 12h6M9 16h6',
  alerta: 'M12 3l10 18H2zM12 10v5M12 18v.5',
  escudo: 'M12 3l8 4v5c0 5-4 8-8 9-4-1-8-4-8-9V7z',
  calendario: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  moneda: 'M12 3a9 9 0 100 18 9 9 0 000-18zM14.5 9h-4a1.5 1.5 0 000 3h3a1.5 1.5 0 010 3h-4M12 6.5v11',
  mensaje: 'M4 5h16v11H9l-5 4z',
  caja: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
  rayo: 'M13 2L4 14h7l-1 8 9-12h-7z',
  lupa: 'M11 4a7 7 0 100 14 7 7 0 000-14zM16 16l5 5',
  aduana: 'M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6',
  check: 'M5 12l5 5 9-10',
  mas: 'M12 5v14M5 12h14',
};

// skin / hair / style solo aplican a 'persona'.
export const AVATARS = [
  { id: 'robot-camion', label: 'Robot repartidor', kind: 'robot', palette: 'oceano', badge: 'camion' },
  { id: 'persona-mensaje', label: 'Asistente de reclamos', kind: 'persona', palette: 'coral', badge: 'mensaje', skin: '#e0ac82', hair: '#3b2a20', style: 0 },
  { id: 'robot-moneda', label: 'Robot cotizador', kind: 'robot', palette: 'menta', badge: 'moneda' },
  { id: 'orbe-documento', label: 'Orbe de facturas', kind: 'orbe', palette: 'turquesa', badge: 'documento' },
  { id: 'persona-calendario', label: 'Coordinadora de citas', kind: 'persona', palette: 'violeta', badge: 'calendario', skin: '#f3d2b3', hair: '#5a2f1c', style: 2 },
  { id: 'orbe-alerta', label: 'Orbe vigía', kind: 'orbe', palette: 'coral', badge: 'alerta' },
  { id: 'persona-aduana', label: 'Agente de aduanas', kind: 'persona', palette: 'cielo', badge: 'aduana', skin: '#b98060', hair: '#1b1b22', style: 1 },
  { id: 'robot-mapa', label: 'Robot explorador', kind: 'robot', palette: 'cielo', badge: 'mapa' },
  { id: 'orbe-reloj', label: 'Orbe puntual', kind: 'orbe', palette: 'violeta', badge: 'reloj' },
  { id: 'robot-caja', label: 'Robot de bodega', kind: 'robot', palette: 'turquesa', badge: 'caja' },
  { id: 'persona-escudo', label: 'Guardián de seguridad', kind: 'persona', palette: 'oceano', badge: 'escudo', skin: '#8d5a3c', hair: '#161616', style: 0 },
  { id: 'orbe-rayo', label: 'Orbe veloz', kind: 'orbe', palette: 'menta', badge: 'rayo' },
  { id: 'persona-lupa', label: 'Analista curiosa', kind: 'persona', palette: 'menta', badge: 'lupa', skin: '#f3d2b3', hair: '#a5541c', style: 2 },
  { id: 'robot-verificador', label: 'Robot verificador', kind: 'robot', palette: 'coral', badge: 'check' },
];

export function getAvatar(id) {
  return AVATARS.find((avatar) => avatar.id === id) ?? null;
}

export function hashSeed(seed) {
  let hash = 2166136261;
  String(seed).split('').forEach((char) => {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  });
  return hash;
}

// Avatar por defecto determinista para una semilla (por ejemplo, el id del agente).
export function pickAvatarId(seed) {
  return AVATARS[hashSeed(seed) % AVATARS.length].id;
}

export function pickPaletteKey(seed) {
  return PALETTE_KEYS[(hashSeed(seed) >>> 5) % PALETTE_KEYS.length];
}
