// [Entrega final] Modelos del monitoreo del coordinador
import { EmergenciaDetalle, EtapaEmergencia } from './emergencia.model';
import { OfertaSeguimiento } from './oferta.model';

export interface MonitoreoFila {
  emergenciaId: number;
  tipoDesastre: string;
  nivelGravedad: string;
  zonaAfectada: string;
  fechaCreacion: string;
  etapa: EtapaEmergencia;
  convocatoriaId: number | null;
  fechaCierre: string | null;
  ronda: number | null;
  lotesTotales: number;
  lotesCubiertos: number;
  ofertasActivas: number;
  ofertasAdjudicadas: number;
  ofertasFinalizadas: number;
  progresoEjecucion: number;
  requiereDecision: boolean;
}

export interface SeguimientoEmergencia {
  emergencia: EmergenciaDetalle;
  ofertas: OfertaSeguimiento[];
}
