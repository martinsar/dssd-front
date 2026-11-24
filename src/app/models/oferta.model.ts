// [Entrega final] Modelos de lotes (ofertas), ofertas conjuntas y versiones
export type EstadoOferta =
  | 'PENDIENTE'
  | 'VALIDADA'
  | 'NO_HABILITADA'
  | 'SELECCIONADA'
  | 'ADJUDICADA'
  | 'NO_SELECCIONADA'
  | 'FINALIZADA'
  | 'RETIRADA';

// Cuerpo de POST /ong/ofertas (la organización sale de la sesión)
export interface OfertaRequest {
  convocatoriaId: number;
  tipoRecursoId: number;
  cantidad: number;
  descripcion: string;
  ofertaConjuntaId: number | null;
}

export interface OfertaEdicionRequest {
  tipoRecursoId: number;
  cantidad: number;
  descripcion: string;
  versionEsperada: number;
}

// Un lote de una ONG
export interface OfertaOng {
  id: number;
  convocatoriaId: number;
  emergenciaId: number;
  tipoDesastre: string;
  zonaAfectada: string;
  fechaCierre: string;
  ventanaAbierta: boolean;
  tipoRecursoId: number;
  codigoTipoRecurso: string;
  tipoRecurso: string;
  cantidad: number;
  descripcion: string;
  estado: EstadoOferta;
  organizacion: string;
  ofertaConjuntaId: number | null;
  numeroVersion: number;
  fechaCreacion: string;
  fechaModificacion: string | null;
  fechaFinalizacion: string | null;
  informeFinalizacion: string | null;
  fueraDeEspecialidad: boolean;
  conjuntaValida: boolean;
  puedeEditar: boolean;
  puedeFinalizar: boolean;
}

export interface OfertaVersion {
  numeroVersion: number;
  fechaHora: string;
  usuario: string | null;
  motivo: string;
  tipoRecurso: string;
  cantidad: number;
  descripcion: string;
  estado: EstadoOferta;
}

export interface EspecialidadOng {
  tipoRecursoId: number;
  codigo: string;
  nombre: string;
}

export interface OrganizacionResumen {
  id: number;
  codigoOng: string;
  nombre: string;
}

export interface ParticipanteConjunta {
  organizacionId: number;
  codigoOng: string;
  nombre: string;
  lotesCargados: number;
}

export interface OfertaConjuntaRequest {
  convocatoriaId: number;
  participantesIds: number[];
}

export interface OfertaConjuntaOng {
  id: number;
  convocatoriaId: number;
  emergenciaId: number;
  tipoDesastre: string;
  fechaCierre: string;
  ventanaAbierta: boolean;
  organizacionDuena: { id: number; nombre: string };
  esDuena: boolean;
  participantes: ParticipanteConjunta[];
  valida: boolean;
  faltan: string[];
  lotes: OfertaOng[];
}

// Lote validado que ve el municipio
export interface OfertaValidada {
  id: number;
  organizacion: string;
  tipoRecursoId: number;
  tipoRecurso: string;
  cantidad: number;
  descripcion: string;
  conjunta: boolean;
  estado: EstadoOferta;
}

export interface AdjudicacionResponse {
  seleccionadas: number;
  noSeleccionadas: number;
  etapa: string;
}

// Lote que ve el coordinador
export interface OfertaSeguimiento {
  id: number;
  organizacion: string;
  tipoRecurso: string;
  cantidad: number;
  descripcion: string;
  estado: EstadoOferta;
  conjunta?: boolean;
  ofertaConjuntaId?: number | null;
  numeroVersion: number;
  fechaModificacion: string | null;
  fechaAdjudicacion?: string | null;
  fechaFinalizacion: string | null;
  informeFinalizacion: string | null;
}
