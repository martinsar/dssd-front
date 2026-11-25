// [Entrega final] Textos y clases de estilo para etapas, estados y notificaciones
import { EtapaEmergencia } from '../models/emergencia.model';
import { EstadoOferta } from '../models/oferta.model';
import { TipoNotificacion } from '../models/notificacion.model';

export const ORDEN_ETAPAS: EtapaEmergencia[] = [
  'EN_RELEVAMIENTO',
  'CONVOCATORIA_ABIERTA',
  'EN_VALIDACION',
  'REQUIERE_DECISION',
  'EN_SELECCION',
  'ADJUDICADA',
  'EN_EJECUCION',
  'FINALIZADA'
];

// Pasos del indicador de avance (la decisión se muestra como alerta aparte)
export const PASOS_STEPPER: EtapaEmergencia[] = ORDEN_ETAPAS.filter(e => e !== 'REQUIERE_DECISION');

// Se devuelve la posición de la etapa en el indicador de avance
export function indiceEtapa(etapa: EtapaEmergencia): number {
  const equivalente: EtapaEmergencia = etapa === 'REQUIERE_DECISION' ? 'EN_VALIDACION' : etapa;
  return PASOS_STEPPER.indexOf(equivalente);
}

export const ETIQUETA_ETAPA: Record<EtapaEmergencia, string> = {
  EN_RELEVAMIENTO: 'En relevamiento',
  CONVOCATORIA_ABIERTA: 'Convocatoria abierta',
  EN_VALIDACION: 'Validando ofertas',
  REQUIERE_DECISION: 'Requiere decisión',
  EN_SELECCION: 'Selección de ofertas',
  ADJUDICADA: 'Adjudicada',
  EN_EJECUCION: 'En ejecución',
  FINALIZADA: 'Finalizada'
};

export const CLASE_ETAPA: Record<EtapaEmergencia, string> = {
  EN_RELEVAMIENTO: 'badge-etapa-neutra',
  CONVOCATORIA_ABIERTA: 'badge-etapa-info',
  EN_VALIDACION: 'badge-etapa-info',
  REQUIERE_DECISION: 'badge-etapa-alerta',
  EN_SELECCION: 'badge-etapa-alerta',
  ADJUDICADA: 'badge-etapa-info',
  EN_EJECUCION: 'badge-etapa-ok',
  FINALIZADA: 'badge-etapa-ok'
};

export const ETIQUETA_ESTADO_OFERTA: Record<EstadoOferta, string> = {
  PENDIENTE: 'Pendiente de validación',
  VALIDADA: 'Validada',
  NO_HABILITADA: 'No habilitada',
  SELECCIONADA: 'Seleccionada',
  ADJUDICADA: 'Adjudicada',
  NO_SELECCIONADA: 'No seleccionada',
  FINALIZADA: 'Finalizada',
  RETIRADA: 'Retirada'
};

export const CLASE_ESTADO_OFERTA: Record<EstadoOferta, string> = {
  PENDIENTE: 'badge-pendiente',
  VALIDADA: 'badge-validada',
  NO_HABILITADA: 'badge-no-habilitada',
  SELECCIONADA: 'badge-seleccionada',
  ADJUDICADA: 'badge-adjudicada',
  NO_SELECCIONADA: 'badge-no-seleccionada',
  FINALIZADA: 'badge-finalizada',
  RETIRADA: 'badge-retirada'
};

export const ETIQUETA_TIPO_NOTIFICACION: Record<TipoNotificacion, string> = {
  NUEVA_CONVOCATORIA: 'Nueva convocatoria',
  CONVOCATORIA_REABIERTA: 'Convocatoria reabierta',
  OFERTA_ADJUDICADA: 'Oferta adjudicada',
  OFERTA_NO_SELECCIONADA: 'Oferta no seleccionada',
  OFERTA_CONJUNTA_INVITACION: 'Oferta conjunta'
};

// Se traduce una etapa recibida como texto (por ejemplo en los gráficos)
export function etiquetaEtapa(clave: string): string {
  return (ETIQUETA_ETAPA as Record<string, string>)[clave] ?? clave;
}

// Se traduce un estado de oferta recibido como texto
export function etiquetaEstadoOferta(clave: string): string {
  return (ETIQUETA_ESTADO_OFERTA as Record<string, string>)[clave] ?? clave;
}
