import { TestBed } from '@angular/core/testing';
import { IndicadoresDto } from '../models/indicadores.model';
import { ExportacionAuditorService } from './exportacion-auditor.service';

const MOCK_DATA: IndicadoresDto = {
  fuente: 'DSSD_DB + BONITA_API',
  fuentesPorSeccion: {
    suministrosPorTipo: 'DSSD_DB',
    emergenciasPorEtapa: 'DSSD_DB',
    emergenciasPorGravedad: 'DSSD_DB',
    ofertasPorEstado: 'DSSD_DB',
  },
  generadoEn: '2026-11-23T08:00:00',
  desde: '2026-11-01',
  hasta: '2026-11-23',
  totales: {
    fuente: 'DSSD_DB',
    emergencias: 3,
    convocatoriasPublicadas: 2,
    ofertasRecibidas: 6,
    ofertasAdjudicadas: 4,
    proyectosEnCurso: 1,
    proyectosFinalizados: 1,
    suministrosMovilizados: 500,
  },
  proyectos: {
    fuente: 'DSSD_DB',
    enCurso: 1,
    finalizados: 1,
    sinProyecto: 1,
    porcentajeFinalizados: 50,
    duracionPromedioFinalizadosHoras: 12.5,
  },
  suministrosPorTipo: [{ etiqueta: 'Agua potable, bidones "5L"', cantidad: 500 }],
  emergenciasPorEtapa: [{ etiqueta: 'FINALIZADA', cantidad: 1 }],
  emergenciasPorGravedad: [{ etiqueta: 'Crítico', cantidad: 2 }],
  ofertasPorEstado: [{ etiqueta: 'ADJUDICADA', cantidad: 4 }],
  ofertasConjuntas: {
    fuente: 'DSSD_DB',
    ofertasAdjudicadas: 4,
    adjudicadasEnConjunta: 2,
    porcentajeOfertas: 50,
    unidadesAdjudicadas: 500,
    unidadesEnConjunta: 250,
    porcentajeUnidades: 50,
    emergenciasConAdjudicacion: 2,
    emergenciasConConsorcio: 1,
    porcentajeEmergenciasConConsorcio: 50,
  },
  coberturaNecesidades: {
    fuente: 'DSSD_DB',
    unidadesRequeridas: 600,
    unidadesOfertadas: 550,
    unidadesValidadas: 500,
    unidadesAdjudicadas: 500,
    porcentajeCoberturaOfertada: 91.7,
    porcentajeCoberturaAdjudicada: 83.3,
    convocatoriasConReapertura: 1,
    convocatoriasConCoberturaParcial: 1,
    porTipoRecurso: [
      {
        recurso: 'Agua potable',
        unidadesRequeridas: 600,
        unidadesOfertadas: 550,
        unidadesAdjudicadas: 500,
        porcentajeCoberturaAdjudicada: 83.3,
        fuente: 'DSSD_DB',
      },
    ],
  },
  rankingOngs: {
    fuente: 'DSSD_DB',
    totalOrganizacionesParticipantes: 1,
    organizaciones: [
      {
        organizacionId: 1,
        organizacionNombre: 'Cruz Roja & Asociados',
        ofertasPresentadas: 3,
        ofertasAdjudicadas: 2,
        unidadesMovilizadas: 500,
        participacionesEnConsorcio: 1,
        fuente: 'DSSD_DB',
      },
    ],
  },
  tiemposPorEtapa: {
    disponible: true,
    fuente: 'BONITA_API',
    mensaje: null,
    casosAnalizados: 2,
    casosFinalizadosEnBonita: 1,
    promedioResolucionTotalHoras: 10,
    etapas: [{ etapa: 'Validar', promedioHoras: 2, minHoras: 1, maxHoras: 3, casos: 2, fuente: 'BONITA_API' }],
  },
  cuellosDeBotellaBonita: {
    disponible: true,
    fuente: 'BONITA_API',
    mensaje: null,
    casosActivosEnBonita: 1,
    totalTareasPendientes: 1,
    pendientesPorEtapa: [
      { etapa: 'Adjudicar', cantidadPendientes: 1, esperaPromedioHoras: 4, esperaMaximaHoras: 4, fuente: 'BONITA_API' },
    ],
  },
  tiemposResolucionCruzados: {
    disponible: true,
    fuente: 'DSSD_DB + BONITA_API',
    mensaje: null,
    porGravedad: [{ etiqueta: 'Crítico', promedioHoras: 8, minHoras: 8, maxHoras: 8, casos: 1, fuente: 'DSSD_DB + BONITA_API' }],
    porTipoDesastre: [{ etiqueta: 'Inundación', promedioHoras: 8, minHoras: 8, maxHoras: 8, casos: 1, fuente: 'DSSD_DB + BONITA_API' }],
  },
  actividadUsuariosBonita: {
    disponible: true,
    fuente: 'BONITA_API',
    mensaje: null,
    totalTareasCompletadas: 5,
    usuarios: [{ usuario: 'agente_coordinador_1', tareasCompletadas: 5, promedioHoras: 1.5, fuente: 'BONITA_API' }],
  },
  estadosCasosBonita: {
    disponible: true,
    fuente: 'BONITA_API',
    mensaje: null,
    versionesProcesoDesplegadas: 1,
    casosActivos: 1,
    casosFinalizados: 1,
    tareasFallidas: 0,
    tasaFinalizacionPorcentaje: 50,
    procesos: [{ id: '1', nombre: 'RescueSync', version: '1.0', estadoActivacion: 'ENABLED', fuente: 'BONITA_API' }],
  },
  tiemposEsperaVsEjecucionBonita: {
    disponible: true,
    fuente: 'BONITA_API',
    mensaje: null,
    esperaPromedioGlobalHoras: 2,
    ejecucionPromedioGlobalHoras: 1,
    porcentajeEsperaGlobal: 66.7,
    etapas: [
      { etapa: 'Validar', esperaPromedioHoras: 2, ejecucionPromedioHoras: 1, porcentajeEspera: 66.7, casos: 2, fuente: 'BONITA_API' },
    ],
  },
};

describe('ExportacionAuditorService', () => {
  let service: ExportacionAuditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportacionAuditorService);
  });

  it('debería construir el nombre de archivo con el período', () => {
    expect(service.construirNombreArchivo('indicadores-auditoria', 'csv', MOCK_DATA)).toBe(
      'indicadores-auditoria_2026-11-01_a_2026-11-23.csv',
    );
  });

  it('debería generar JSON estructurado válido', () => {
    const json = service.generarJson(MOCK_DATA);
    const parsed = JSON.parse(json) as IndicadoresDto;
    expect(parsed.totales.suministrosMovilizados).toBe(500);
    expect(parsed.estadosCasosBonita.casosFinalizados).toBe(1);
  });

  it('debería generar CSV completo escapando comas y comillas', () => {
    const csv = service.generarCsvCompleto(MOCK_DATA);
    expect(csv).toContain('Seccion,Fuente,Item,Metrica,Valor,Detalle');
    expect(csv).toContain('"Agua potable, bidones ""5L"""');
    expect(csv).toContain('Bonita - Actividad Usuarios');
  });

  it('debería generar CSV por tabla específica', () => {
    const csvCobertura = service.generarCsvTabla('cobertura', MOCK_DATA);
    expect(csvCobertura).toContain('Recurso,Unidades Requeridas');
    expect(csvCobertura).toContain('Agua potable,600,550,500,83.3,DSSD_DB');

    const csvOngs = service.generarCsvTabla('ranking-ongs', MOCK_DATA);
    expect(csvOngs).toContain('Cruz Roja & Asociados');
  });

  it('debería generar XML válido escapando caracteres especiales', () => {
    const xml = service.generarXml(MOCK_DATA);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('Cruz Roja &amp; Asociados');
    expect(xml).toContain('<indicadoresAuditoria>');
    expect(xml).toContain('</indicadoresAuditoria>');
  });
});
