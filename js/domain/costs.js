// Factura estimada a partir de las metricas y de la configuracion de precios (ilustrativa).
function round2(value) {
  return Math.round(value * 100) / 100;
}

function overageLine(pricing, key, meter, rateKey) {
  const cantidad = Math.max(0, Math.round((meter.usado - meter.cupo) * 100) / 100);
  const tarifa = pricing.rates[rateKey];
  return {
    key,
    concepto: pricing.concepts[key],
    cantidad,
    tarifa,
    monto: round2(cantidad * tarifa),
  };
}

function seatLine(pricing, key, seats, rateKey) {
  const cantidad = Math.max(0, seats - pricing.plan.includes[key]);
  const tarifa = pricing.rates[rateKey];
  return {
    key,
    concepto: pricing.concepts[key],
    cantidad,
    tarifa,
    monto: round2(cantidad * tarifa),
  };
}

export function computeInvoice(metrics, pricing) {
  const { consumo, tokensPorModelo } = metrics;
  const tokens = Object.entries(tokensPorModelo).reduce((acc, [model, usage]) => {
    const price = pricing.tokenPricePer1M[model] ?? { input: 0, output: 0 };
    return acc + (usage.input / 1e6) * price.input + (usage.output / 1e6) * price.output;
  }, 0);
  const lineas = [
    {
      key: 'plan',
      concepto: pricing.concepts.plan,
      cantidad: 1,
      tarifa: pricing.plan.monthly,
      monto: pricing.plan.monthly,
    },
    overageLine(pricing, 'runs', consumo.runs, 'run-overage'),
    {
      key: 'ai',
      concepto: pricing.concepts.ai,
      cantidad: 1,
      tarifa: round2(tokens),
      monto: round2(tokens),
    },
    overageLine(pricing, 'rag_gb', consumo.rag_gb, 'rag-gb-overage'),
    overageLine(pricing, 'docs', consumo.docs, 'doc-overage'),
    overageLine(
      pricing,
      'integration_calls',
      consumo.integration_calls,
      'integration-call-overage',
    ),
    seatLine(pricing, 'constructor_seats', pricing.plan.seats.constructor, 'constructor-seat'),
    seatLine(pricing, 'operator_seats', pricing.plan.seats.operator, 'operator-seat'),
  ];
  const subtotal = round2(lineas.reduce((acc, line) => acc + line.monto, 0));
  const descuento = round2((subtotal * pricing.discountPercent) / 100);
  return {
    currency: pricing.currency,
    illustrative: pricing.illustrative,
    lineas,
    subtotal,
    descuento,
    total: round2(subtotal - descuento),
  };
}
