// Agentes mock de logistica (1/3): reclamos, cotizacion y conciliacion.
import { n, graphOf } from './builder.js';

export const RECLAMOS = graphOf(
  'atencion-reclamos',
  'Atención de reclamos',
  [
    n('seg', 'seguridad', 'Proteger datos del cliente', 30, 120),
    n('ent', 'entiende', 'Entender el reclamo', 266, 120, { creatividad: 0.2 }),
    n('sis', 'sistemas', 'Revisar el envío en el sistema', 502, 10),
    n('pol', 'documentos', 'Consultar políticas de compensación', 502, 240, {
      fuente: 'politicas-compensacion',
    }),
    n('reg', 'regla', '¿Compensación de monto alto?', 738, 120, { regla: 'monto-alto' }),
    n('apr', 'aprobacion', 'Aprobación del supervisor', 974, 10, { pregunta: '¿Autorizar la compensación?' }),
    n('res', 'avisa', 'Avisar al cliente', 1210, 120, { mensaje: 'Tu reclamo fue resuelto.' }),
  ],
  [
    ['seg', 'ent'],
    ['ent', 'sis'],
    ['ent', 'pol'],
    ['sis', 'reg'],
    ['pol', 'reg'],
    ['reg', 'apr', 'si el monto es alto'],
    ['reg', 'res', 'si el monto es normal'],
    ['apr', 'res'],
  ],
);

export const COTIZACION = graphOf(
  'cotizacion-fletes',
  'Cotización de fletes',
  [
    n('ent', 'entiende', 'Entender la solicitud', 30, 120, { creatividad: 0.1 }),
    n('pre', 'prepara', 'Ordenar origen, destino y carga', 266, 120, {
      detalle: 'Ordenar origen, destino, peso y volumen',
    }),
    n('tar', 'sistemas', 'Consultar tarifas', 502, 120, { sistema: 'gestion' }),
    n('reg', 'regla', '¿Carga especial?', 738, 120, { regla: 'monto-alto' }),
    n('apr', 'aprobacion', 'Aprobación comercial', 974, 10, { rol: 'gerente' }),
    n('res', 'entiende', 'Redactar la cotización', 974, 240, { largo: 400 }),
  ],
  [
    ['ent', 'pre'],
    ['pre', 'tar'],
    ['tar', 'reg'],
    ['reg', 'apr', 'si es carga especial'],
    ['reg', 'res', 'si es carga estándar'],
    ['apr', 'res'],
  ],
);

export const CONCILIACION = graphOf(
  'conciliacion-facturas',
  'Conciliación de facturas de transporte',
  [
    n('seg', 'seguridad', 'Verificar el origen del documento', 30, 120),
    n('lee', 'lee', 'Leer la factura', 266, 120),
    n('pre', 'prepara', 'Ordenar líneas de la factura', 502, 120, {
      detalle: 'Ordenar tarifa, kilos y recargos',
    }),
    n('sis', 'sistemas', 'Comparar con las guías', 738, 10, { sistema: 'gestion' }),
    n('doc', 'documentos', 'Revisar condiciones del contrato', 738, 240),
    n('reg', 'regla', '¿Diferencia de monto alto?', 974, 120, { regla: 'monto-alto' }),
    n('apr', 'aprobacion', 'Revisión de finanzas', 1210, 120, {
      pregunta: '¿Aceptar la diferencia?',
      rol: 'gerente',
    }),
  ],
  [
    ['seg', 'lee'],
    ['lee', 'pre'],
    ['pre', 'sis'],
    ['pre', 'doc'],
    ['sis', 'reg'],
    ['doc', 'reg'],
    ['reg', 'apr', 'si hay diferencia'],
  ],
);
