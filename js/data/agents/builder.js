// Ayudantes para definir grafos mock de agentes con los pasos del catalogo (sin red).
import { defaultSettings } from '../catalog.js';

// Nodo: [id, paso, etiqueta, x, y, ajustes que cambian el valor por defecto]
export function n(id, step, label, x, y, overrides = {}) {
  return { id, step, label, x, y, settings: { ...defaultSettings(step), nombre: label, ...overrides } };
}

// Conexion: [de, a, condicion opcional]; los ids se numeran en orden.
export function link(index, from, to, condition) {
  return condition ? { id: `e${index}`, from, to, condition } : { id: `e${index}`, from, to };
}

export function graphOf(id, name, nodes, links) {
  return {
    id,
    name,
    version: '1.0.0',
    nodes,
    edges: links.map(([from, to, condition], i) => link(i + 1, from, to, condition)),
  };
}
