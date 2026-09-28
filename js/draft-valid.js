// Validacion de un borrador leido del almacenamiento: solo pasos del catalogo y conexiones coherentes.
import { CATALOG } from './data/catalog.js';

export function isValidDraft(graph) {
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    return false;
  }
  const ids = new Set(graph.nodes.map((node) => node.id));
  return (
    graph.nodes.every(
      (node) => CATALOG.some((entry) => entry.step === node.step) && node.settings,
    ) && graph.edges.every((edge) => ids.has(edge.from) && ids.has(edge.to))
  );
}
