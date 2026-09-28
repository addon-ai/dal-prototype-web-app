// Agentes mock de logistica (2/3): citas de descarga, alertas de retrasos y documentos aduaneros.
import { n, graphOf } from './builder.js';

export const CITAS = graphOf(
  'citas-descarga',
  'Programación de citas de descarga',
  [
    n('ent', 'entiende', 'Entender la solicitud de cita', 30, 120),
    n('sis', 'sistemas', 'Consultar muelles disponibles', 266, 120),
    n('reg', 'regla', '¿Hay muelle libre?', 502, 120, { regla: 'retraso-critico' }),
    n('con', 'avisa', 'Confirmar la cita al transportista', 738, 10, {
      mensaje: 'Tu cita de descarga quedó confirmada.',
    }),
    n('apr', 'aprobacion', 'Aprobación del coordinador', 738, 240, {
      pregunta: '¿Reprogramar la descarga?',
    }),
    n('rep', 'avisa', 'Proponer nuevo horario', 974, 240, { canal: 'mensaje' }),
  ],
  [
    ['ent', 'sis'],
    ['sis', 'reg'],
    ['reg', 'con', 'si hay muelle libre'],
    ['reg', 'apr', 'si no hay muelle libre'],
    ['apr', 'rep'],
  ],
);

export const ALERTAS = graphOf(
  'alertas-retrasos',
  'Alertas de retrasos a clientes',
  [
    n('sis', 'sistemas', 'Vigilar el estado de los envíos', 30, 120),
    n('pre', 'prepara', 'Ordenar datos del retraso', 266, 120, { detalle: 'Ordenar guía, ruta y demora' }),
    n('reg', 'regla', '¿Retraso crítico?', 502, 120),
    n('ent', 'entiende', 'Redactar el aviso', 738, 10, { creatividad: 0.3, largo: 200 }),
    n('seg', 'seguridad', 'Revisar el aviso antes de enviarlo', 974, 10),
    n('avi', 'avisa', 'Avisar al cliente', 1210, 10, { canal: 'mensaje', mensaje: 'Tu envío tiene un retraso.' }),
    n('doc', 'documentos', 'Consultar políticas de compensación', 738, 240, {
      fuente: 'politicas-compensacion',
    }),
  ],
  [
    ['sis', 'pre'],
    ['pre', 'reg'],
    ['reg', 'ent', 'si el retraso es crítico'],
    ['reg', 'doc', 'si el retraso es leve'],
    ['ent', 'seg'],
    ['seg', 'avi'],
    ['doc', 'ent'],
  ],
);

export const ADUANA = graphOf(
  'verificacion-aduanera',
  'Verificación de documentos aduaneros',
  [
    n('seg', 'seguridad', 'Verificar quién envía', 30, 120),
    n('lee', 'lee', 'Leer manifiesto y factura', 266, 120, { dudas: 'escalate' }),
    n('pre', 'prepara', 'Ordenar partidas y valores', 502, 120, { detalle: 'Ordenar partidas, valores y países' }),
    n('doc', 'documentos', 'Consultar normas aduaneras', 738, 10),
    n('reg', 'regla', '¿Falta un documento?', 738, 240, { regla: 'monto-alto' }),
    n('apr', 'aprobacion', 'Revisión del agente aduanero', 974, 240, { pregunta: '¿Continuar el trámite?' }),
    n('avi', 'avisa', 'Avisar el resultado', 1210, 120, { canal: 'correo' }),
    n('ent', 'entiende', 'Resumir observaciones', 974, 10, { largo: 500 }),
  ],
  [
    ['seg', 'lee'],
    ['lee', 'pre'],
    ['pre', 'doc'],
    ['pre', 'reg'],
    ['doc', 'ent'],
    ['reg', 'apr', 'si falta un documento'],
    ['reg', 'avi', 'si está completo'],
    ['ent', 'avi'],
    ['apr', 'avi'],
  ],
);
