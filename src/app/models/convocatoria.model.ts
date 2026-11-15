// [Entrega final] Convocatoria tal como la devuelve el backend
import { Emergencia } from './emergencia.model';

export type EstadoConvocatoria = 'BORRADOR' | 'PUBLICADA';

export interface Convocatoria {
  id: number;
  estado: EstadoConvocatoria | string;
  fechaCreacion?: string | null;
  fechaApertura?: string | null;
  fechaCierre?: string | null;
  emergencia?: Emergencia | null;
}

// [Entrega final] Convocatoria abierta a ofertas (vista de la ONG)
export interface LoteAbierto {
  necesidadId: number;
  tipoRecursoId: number;
  codigoTipoRecurso: string;
  tipoRecurso: string;
  descripcion: string;
  cantidadRequerida: number;
}

export interface ConvocatoriaAbierta {
  convocatoriaId: number;
  emergenciaId: number;
  tipoDesastre: string;
  nivelGravedad: string;
  zonaAfectada: string;
  descripcion: string;
  fechaApertura: string;
  fechaCierre: string;
  abierta: boolean;
  lotes: LoteAbierto[];
}

// [Entrega final] Resumen devuelto al decidir sobre la convocatoria
export interface ConvocatoriaResumen {
  id: number;
  estado: string;
  fechaApertura?: string | null;
  fechaCierre?: string | null;
  ronda?: number | null;
  coberturaParcialAceptada?: boolean;
}

// [Entrega final] Decisión del coordinador ante cobertura insuficiente
export type AccionConvocatoria = 'REABRIR' | 'REFORMULAR' | 'CONTINUAR_PARCIAL';

export interface DecisionConvocatoriaRequest {
  accion: AccionConvocatoria;
  fechaCierre: string | null;
  necesidades: { tipoRecursoId: number; cantidad: number; descripcion: string }[] | null;
}
