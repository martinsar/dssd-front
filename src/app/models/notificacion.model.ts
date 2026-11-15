// [Entrega final] Notificaciones de la ONG
export type TipoNotificacion =
  | 'NUEVA_CONVOCATORIA'
  | 'CONVOCATORIA_REABIERTA'
  | 'OFERTA_ADJUDICADA'
  | 'OFERTA_NO_SELECCIONADA';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaHora: string;
  emergenciaId: number | null;
  convocatoriaId: number | null;
  ofertaId: number | null;
}
