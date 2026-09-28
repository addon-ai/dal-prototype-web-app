// Recorrido de ejemplo: orden en que el asistente pasaria por los pasos (solo datos mock).
// Es un orden topologico (Kahn); si hay ciclos, los pasos restantes se agregan al final.
// Devuelve una lista de tramos: { nodeId, edgeIds } con las conexiones que llegan al paso.
export function simulationPath(graph) {
  const { nodes, edges } = graph;
  const ids = new Set(nodes.map((node) => node.id));
  const valid = edges.filter((edge) => ids.has(edge.from) && ids.has(edge.to));
  const pending = new Map(nodes.map((node) => [node.id, 0]));
  valid.forEach((edge) => pending.set(edge.to, pending.get(edge.to) + 1));
  const queue = nodes.filter((node) => pending.get(node.id) === 0).map((node) => node.id);
  const order = [];
  while (queue.length > 0) {
    const id = queue.shift();
    order.push(id);
    valid
      .filter((edge) => edge.from === id)
      .forEach((edge) => {
        pending.set(edge.to, pending.get(edge.to) - 1);
        if (pending.get(edge.to) === 0) {
          queue.push(edge.to);
        }
      });
  }
  nodes.forEach((node) => {
    if (!order.includes(node.id)) {
      order.push(node.id);
    }
  });
  const seen = new Set();
  return order.map((nodeId) => {
    const edgeIds = valid
      .filter((edge) => edge.to === nodeId && seen.has(edge.from))
      .map((edge) => edge.id);
    seen.add(nodeId);
    return { nodeId, edgeIds };
  });
}
