// [Entrega final] Indicadores del auditor
import { EtapaEmergencia } from './emergencia.model';

export interface CantidadPorEtiqueta {
  etiqueta: string;
  cantidad: number;
}

export interface TotalesIndicadores {
  emergencias: number;
  convocatoriasPublicadas: number;
  ofertasRecibidas: number;
  ofertasAdjudicadas: number;
  proyectosEnCurso: number;
  proyectosFinalizados: number;
  suministrosMovilizados: number;
}

export interface OfertasConjuntasIndicadores {
  ofertasAdjudicadas: number;
  adjudicadasEnConjunta: number;
  porcentajeOfertas: number;
  unidadesAdjudicadas: number;
  unidadesEnConjunta: number;
  porcentajeUnidades: number;
}

export interface TiempoEtapa {
  etapa: string;
  promedioHoras: number;
  casos: number;
}

export interface TiemposPorEtapa {
  disponible: boolean;
  fuente: string;
  etapas: TiempoEtapa[];
}

export interface Indicadores {
  generadoEn: string;
  desde: string | null;
  hasta: string | null;
  totales: TotalesIndicadores;
  suministrosPorTipo: CantidadPorEtiqueta[];
  emergenciasPorEtapa: CantidadPorEtiqueta[];
  emergenciasPorGravedad: CantidadPorEtiqueta[];
  ofertasPorEstado: CantidadPorEtiqueta[];
  ofertasConjuntas: OfertasConjuntasIndicadores;
  tiemposPorEtapa: TiemposPorEtapa;
}

export interface AuditoriaEmergencia {
  id: number;
  tipoDesastre: string;
  nivelGravedad: string;
  zonaAfectada: string;
  fechaCreacion: string;
  etapa: EtapaEmergencia;
  fechaCierreConvocatoria: string | null;
  ofertas: number;
  ofertasAdjudicadas: number;
  unidadesMovilizadas: number;
  ofertasEnConjunta: number;
  proyectoEstado: string | null;
}
