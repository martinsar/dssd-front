export interface Emergencia {
  id?: number;
  tipoDesastre: string;
  nivelGravedad: string;
  zonaAfectada: string;
  descripcion: string;
  estado?: string;
}

// [Entrega final] Tipo de desastre devuelto por GET /tipos-emergencia
export interface TipoEmergencia {
  id: number;
  tipoDesastre: string;
}

// [Entrega final] Etapa calculada de la emergencia
export type EtapaEmergencia =
  | 'EN_RELEVAMIENTO'
  | 'CONVOCATORIA_ABIERTA'
  | 'EN_VALIDACION'
  | 'REQUIERE_DECISION'
  | 'EN_SELECCION'
  | 'ADJUDICADA'
  | 'EN_EJECUCION'
  | 'FINALIZADA';

export interface EmergenciaResumen {
  id: number;
  tipoDesastre: string;
  nivelGravedad: string;
  zonaAfectada: string;
  descripcion: string;
  fechaCreacion: string;
  etapa: EtapaEmergencia;
  fechaCierre: string | null;
  ofertasValidadas: number;
}

export interface LoteCobertura {
  necesidadId: number;
  tipoRecursoId: number;
  tipoRecurso: string;
  descripcion: string;
  cantidadRequerida: number;
  cantidadOfertada: number | null;
  cantidadValidada: number;
  cantidadAdjudicada: number;
}

export interface ProyectoResumen {
  id: number;
  nombre: string;
  estado: string;
  fechaInicio: string | null;
  fechaFin: string | null;
}

export interface ConvocatoriaDetalle {
  id: number;
  estado: string;
  fechaApertura: string | null;
  fechaCierre: string | null;
  ronda: number;
  coberturaParcialAceptada: boolean;
}

export interface EmergenciaDetalle {
  id: number;
  tipoDesastre: string;
  nivelGravedad: string;
  zonaAfectada: string;
  descripcion: string;
  fechaCreacion: string;
  etapa: EtapaEmergencia;
  puedeSeleccionar: boolean;
  puedeDecidir: boolean;
  convocatoria: ConvocatoriaDetalle | null;
  lotes: LoteCobertura[];
  proyecto: ProyectoResumen | null;
}
