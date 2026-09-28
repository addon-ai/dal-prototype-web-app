// UNICO archivo con cifras de precio, cupos y descuentos.
// Todo es ILUSTRATIVO: no constituye una oferta. Se ajusta en la sesion 2.
// Solo servicios facturables al consumidor: sin costo base ni margen.
export const PRICING = {
  illustrative: true,
  currency: 'USD',
  notice: 'Precios ilustrativos. El total estimado no constituye una oferta.',
  plan: {
    name: 'Piloto',
    monthly: 490,
    includes: {
      runs: 2500,
      docs: 400,
      rag_gb: 5,
      integration_calls: 6000,
      constructor_seats: 2,
      operator_seats: 5,
    },
    seats: { constructor: 2, operator: 6 },
  },
  rates: {
    'run-overage': 0.12,
    'doc-overage': 0.08,
    'rag-gb-overage': 2.5,
    'integration-call-overage': 0.004,
    'constructor-seat': 30,
    'operator-seat': 15,
  },
  tokenPricePer1M: {
    'modelo-estandar': { input: 0.5, output: 1.5 },
  },
  discountPercent: 10,
  thresholds: { warning: 80, critical: 100 },
  concepts: {
    plan: 'Plan mensual',
    runs: 'Casos atendidos',
    ai: 'Consumo de IA',
    rag_gb: 'Base de conocimiento',
    docs: 'Lectura de documentos',
    integration_calls: 'Conexión con tus sistemas',
    constructor_seats: 'Usuarios que diseñan',
    operator_seats: 'Usuarios que atienden',
  },
};
