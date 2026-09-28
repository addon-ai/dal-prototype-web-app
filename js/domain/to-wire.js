// Traduce el grafo del constructor a la forma del wire (receta tecnica para TI).
// No incluye state_schema ni llm_config.
import { getCatalogEntry } from '../data/catalog.js';

function nodeToWire(node) {
  const entry = getCatalogEntry(node.step);
  const wire = { id: node.id, type: entry ? entry.wireType : node.step, label: node.label };
  if (!entry) {
    return wire;
  }
  entry.settings.forEach((setting) => {
    if (!setting.wireKey) {
      return;
    }
    const value = node.settings[setting.key] ?? setting.default;
    if (value === undefined) {
      return;
    }
    wire[setting.wireKey] = setting.asArray ? [value] : value;
  });
  return { ...wire, ...(entry.wireFixed ?? {}) };
}

function edgeToWire(edge) {
  const wire = { from: edge.from, to: edge.to };
  if (edge.condition) {
    wire.condition = edge.condition;
  }
  return wire;
}

export function toWire(graph) {
  return {
    graph_id: graph.id,
    name: graph.name,
    version: graph.version,
    status: 'DRAFT',
    nodes: graph.nodes.map(nodeToWire),
    edges: graph.edges.map(edgeToWire),
  };
}
