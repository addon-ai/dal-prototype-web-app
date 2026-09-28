// Metricas simuladas y deterministas: f(grafo, escenario, catalogo). Datos de ejemplo.
import { PRICING } from '../pricing.config.js';
import { SEED, mulberry32 } from './prng.js';

const DIAS = 30;
const MODELO = 'modelo-estandar';

// Probabilidad de que un caso pase por cada paso. Las salidas condicionales se reparten.
function reachByNode(graph) {
  const incoming = new Map(graph.nodes.map((node) => [node.id, []]));
  graph.edges.forEach((edge) => {
    if (incoming.has(edge.to)) {
      incoming.get(edge.to).push(edge);
    }
  });
  const condCount = new Map();
  graph.edges.forEach((edge) => {
    if (edge.condition) {
      condCount.set(edge.from, (condCount.get(edge.from) ?? 0) + 1);
    }
  });
  const reach = new Map(graph.nodes.map((node) => [node.id, 0]));
  for (let pass = 0; pass <= graph.nodes.length; pass += 1) {
    graph.nodes.forEach((node) => {
      const edges = incoming.get(node.id);
      if (edges.length === 0) {
        reach.set(node.id, 1);
        return;
      }
      const sum = edges.reduce((acc, edge) => {
        const share = edge.condition ? 1 / condCount.get(edge.from) : 1;
        return acc + (reach.get(edge.from) ?? 0) * share;
      }, 0);
      reach.set(node.id, Math.min(1, sum));
    });
  }
  return reach;
}

function perCaseUsage(graph, catalog) {
  const reach = reachByNode(graph);
  const usage = { tokensIn: 0, tokensOut: 0, segundos: 0, docs: 0, llamadas: 0, espera: 0 };
  const has = { seguridad: 0, regla: 0, documentos: 0 };
  let aprobacion = 0;
  graph.nodes.forEach((node) => {
    const entry = catalog.find((item) => item.step === node.step);
    const weight = reach.get(node.id) ?? 0;
    const c = entry ? entry.consumo : {};
    usage.tokensIn += weight * (c.tokensIn ?? 0);
    usage.tokensOut += weight * (c.tokensOut ?? 0);
    usage.segundos += weight * (c.segundos ?? 0);
    usage.docs += weight * (c.docs ?? 0);
    usage.llamadas += weight * (c.llamadas ?? 0);
    if (node.step === 'aprobacion') {
      aprobacion += weight;
      usage.espera += weight * (c.esperaHumanaSeg ?? 0);
    }
    if (node.step in has) {
      has[node.step] += 1;
    }
  });
  return { usage, has, aprobacion: Math.min(1, aprobacion) };
}

function buildSerie(casos) {
  const random = mulberry32(SEED);
  const raw = Array.from({ length: DIAS }, (_, i) => {
    const finDeSemana = i % 7 === 5 || i % 7 === 6;
    return (finDeSemana ? 0.55 : 1) * (0.85 + random() * 0.3);
  });
  const total = raw.reduce((acc, value) => acc + value, 0);
  const serie = raw.map((value, i) => ({ dia: i + 1, casos: Math.floor((value / total) * casos) }));
  const resto = casos - serie.reduce((acc, item) => acc + item.casos, 0);
  serie[DIAS - 1].casos += resto;
  return serie;
}

function meter(usado, cupo) {
  const rounded = Math.round(usado * 100) / 100;
  return { usado: rounded, cupo, pct: cupo > 0 ? Math.round((usado / cupo) * 100) : 0 };
}

export function computeMetrics(graph, scenario, catalog) {
  const casos = Math.max(0, Math.round(scenario.casosMes));
  const { usage, has, aprobacion } = perCaseUsage(graph, catalog);
  const includes = PRICING.plan.includes;
  const automaticosPct = Math.round((1 - aprobacion) * 1000) / 10;
  const exitoBase = 93 + (has.seguridad ? 2 : 0) + (has.regla ? 1.5 : 0) + (has.documentos ? 1 : 0);
  const exitoPct = Math.min(99, exitoBase) - aprobacion * 1.5;
  return {
    casos,
    automaticosPct,
    exitoPct: Math.round(exitoPct * 10) / 10,
    p50s: Math.round(usage.segundos + aprobacion * usage.espera * 0.6),
    p95s: Math.round(usage.segundos * 2.2 + usage.espera * 1.8),
    bloqueadosPct: has.seguridad ? 2.4 : 0,
    aprobacionesPend: Math.round(casos * aprobacion * 0.06),
    tokensPorModelo: {
      [MODELO]: {
        input: Math.round(casos * usage.tokensIn),
        output: Math.round(casos * usage.tokensOut),
      },
    },
    consumo: {
      runs: meter(casos, includes.runs),
      docs: meter(casos * usage.docs, includes.docs),
      rag_gb: meter(has.documentos ? 1.5 * has.documentos + 0.5 : 0, includes.rag_gb),
      integration_calls: meter(casos * usage.llamadas, includes.integration_calls),
    },
    serie: buildSerie(casos),
  };
}
