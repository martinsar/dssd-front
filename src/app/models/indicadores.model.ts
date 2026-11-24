export interface TotalesDto {
  fuente: string;
  emergencias: number;
  convocatoriasPublicadas: number;
  ofertasRecibidas: number;
  ofertasAdjudicadas: number;
  proyectosEnCurso: number;
  proyectosFinalizados: number;
  suministrosMovilizados: number;
}

export interface ProyectosIndicadorDto {
  fuente: string;
  enCurso: number;
  finalizados: number;
  sinProyecto: number;
  porcentajeFinalizados: number;
  duracionPromedioFinalizadosHoras: number | null;
}

export interface CantidadPorEtiquetaDto {
  etiqueta: string;
  cantidad: number;
}

export interface OfertasConjuntasIndicadorDto {
  fuente: string;
  ofertasAdjudicadas: number;
  adjudicadasEnConjunta: number;
  porcentajeOfertas: number;
  unidadesAdjudicadas: number;
  unidadesEnConjunta: number;
  porcentajeUnidades: number;
  emergenciasConAdjudicacion: number;
  emergenciasConConsorcio: number;
  porcentajeEmergenciasConConsorcio: number;
}

export interface CoberturaRecursoDto {
  recurso: string;
  unidadesRequeridas: number;
  unidadesOfertadas: number;
  unidadesAdjudicadas: number;
  porcentajeCoberturaAdjudicada: number;
  fuente: string;
}

export interface CoberturaNecesidadesDto {
  fuente: string;
  unidadesRequeridas: number;
  unidadesOfertadas: number;
  unidadesValidadas: number;
  unidadesAdjudicadas: number;
  porcentajeCoberturaOfertada: number;
  porcentajeCoberturaAdjudicada: number;
  convocatoriasConReapertura: number;
  convocatoriasConCoberturaParcial: number;
  porTipoRecurso: CoberturaRecursoDto[];
}

export interface RankingOngItemDto {
  organizacionId: number | null;
  organizacionNombre: string;
  ofertasPresentadas: number;
  ofertasAdjudicadas: number;
  unidadesMovilizadas: number;
  participacionesEnConsorcio: number;
  fuente: string;
}

export interface RankingOngsDto {
  fuente: string;
  totalOrganizacionesParticipantes: number;
  organizaciones: RankingOngItemDto[];
}

export interface TiempoEtapaDto {
  etapa: string;
  promedioHoras: number;
  minHoras: number;
  maxHoras: number;
  casos: number;
  fuente: string;
}

export interface TiemposEtapasDto {
  disponible: boolean;
  fuente: string;
  mensaje: string | null;
  casosAnalizados: number;
  casosFinalizadosEnBonita: number;
  promedioResolucionTotalHoras: number | null;
  etapas: TiempoEtapaDto[];
}

export interface TareaPendienteEtapaDto {
  etapa: string;
  cantidadPendientes: number;
  esperaPromedioHoras: number;
  esperaMaximaHoras: number;
  fuente: string;
}

export interface CuellosDeBotellaBonitaDto {
  disponible: boolean;
  fuente: string;
  mensaje: string | null;
  casosActivosEnBonita: number;
  totalTareasPendientes: number;
  pendientesPorEtapa: TareaPendienteEtapaDto[];
}

export interface TiempoGrupoDto {
  etiqueta: string;
  promedioHoras: number;
  minHoras: number;
  maxHoras: number;
  casos: number;
  fuente: string;
}

export interface TiemposResolucionCruzadosDto {
  disponible: boolean;
  fuente: string;
  mensaje: string | null;
  porGravedad: TiempoGrupoDto[];
  porTipoDesastre: TiempoGrupoDto[];
}

export interface ActividadUsuarioDto {
  usuario: string;
  tareasCompletadas: number;
  promedioHoras: number;
  fuente: string;
}

export interface ActividadUsuariosBonitaDto {
  disponible: boolean;
  fuente: string;
  mensaje: string | null;
  totalTareasCompletadas: number;
  usuarios: ActividadUsuarioDto[];
}

export interface ProcesoBonitaResumenDto {
  id: string;
  nombre: string;
  version: string;
  estadoActivacion: string;
  fuente: string;
}

export interface EstadosCasosBonitaDto {
  disponible: boolean;
  fuente: string;
  mensaje: string | null;
  versionesProcesoDesplegadas: number;
  casosActivos: number;
  casosFinalizados: number;
  tareasFallidas: number;
  tasaFinalizacionPorcentaje: number;
  procesos: ProcesoBonitaResumenDto[];
}

export interface EsperaEjecucionEtapaDto {
  etapa: string;
  esperaPromedioHoras: number;
  ejecucionPromedioHoras: number;
  porcentajeEspera: number;
  casos: number;
  fuente: string;
}

export interface TiemposEsperaEjecucionBonitaDto {
  disponible: boolean;
  fuente: string;
  mensaje: string | null;
  esperaPromedioGlobalHoras: number | null;
  ejecucionPromedioGlobalHoras: number | null;
  porcentajeEsperaGlobal: number | null;
  etapas: EsperaEjecucionEtapaDto[];
}

export interface IndicadoresDto {
  fuente: string;
  fuentesPorSeccion: Record<string, string>;
  generadoEn: string;
  desde: string | null;
  hasta: string | null;
  totales: TotalesDto;
  proyectos: ProyectosIndicadorDto;
  suministrosPorTipo: CantidadPorEtiquetaDto[];
  emergenciasPorEtapa: CantidadPorEtiquetaDto[];
  emergenciasPorGravedad: CantidadPorEtiquetaDto[];
  ofertasPorEstado: CantidadPorEtiquetaDto[];
  ofertasConjuntas: OfertasConjuntasIndicadorDto;
  coberturaNecesidades: CoberturaNecesidadesDto;
  rankingOngs: RankingOngsDto;
  tiemposPorEtapa: TiemposEtapasDto;
  cuellosDeBotellaBonita: CuellosDeBotellaBonitaDto;
  tiemposResolucionCruzados: TiemposResolucionCruzadosDto;
  actividadUsuariosBonita: ActividadUsuariosBonitaDto;
  estadosCasosBonita: EstadosCasosBonitaDto;
  tiemposEsperaVsEjecucionBonita: TiemposEsperaEjecucionBonitaDto;
}
