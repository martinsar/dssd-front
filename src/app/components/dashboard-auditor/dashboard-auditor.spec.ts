import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { IndicadoresDto } from '../../models/indicadores.model';
import { AuthService } from '../../services/auth.service';
import { DashboardAuditorComponent } from './dashboard-auditor';

const MOCK_INDICADORES: IndicadoresDto = {
  fuente: 'DSSD_DB + BONITA_API',
  fuentesPorSeccion: {
    totales: 'DSSD_DB',
    proyectos: 'DSSD_DB',
    suministrosPorTipo: 'DSSD_DB',
    emergenciasPorEtapa: 'DSSD_DB',
    emergenciasPorGravedad: 'DSSD_DB',
    ofertasPorEstado: 'DSSD_DB',
    ofertasConjuntas: 'DSSD_DB',
    coberturaNecesidades: 'DSSD_DB',
    rankingOngs: 'DSSD_DB',
    tiemposPorEtapa: 'BONITA_API',
    cuellosDeBotellaBonita: 'BONITA_API',
    tiemposResolucionCruzados: 'DSSD_DB + BONITA_API',
    actividadUsuariosBonita: 'BONITA_API',
    estadosCasosBonita: 'BONITA_API',
    tiemposEsperaVsEjecucionBonita: 'BONITA_API',
  },
  generadoEn: '2026-11-22T00:00:00',
  desde: null,
  hasta: null,
  totales: {
    fuente: 'DSSD_DB',
    emergencias: 5,
    convocatoriasPublicadas: 4,
    ofertasRecibidas: 12,
    ofertasAdjudicadas: 8,
    proyectosEnCurso: 2,
    proyectosFinalizados: 2,
    suministrosMovilizados: 1450,
  },
  proyectos: {
    fuente: 'DSSD_DB',
    enCurso: 2,
    finalizados: 2,
    sinProyecto: 1,
    porcentajeFinalizados: 50,
    duracionPromedioFinalizadosHoras: 18.5,
  },
  suministrosPorTipo: [
    { etiqueta: 'Agua potable', cantidad: 1000 },
    { etiqueta: 'Raciones de alimento', cantidad: 450 },
  ],
  emergenciasPorEtapa: [
    { etiqueta: 'CONVOCATORIA_ABIERTA', cantidad: 2 },
    { etiqueta: 'FINALIZADA', cantidad: 3 },
  ],
  emergenciasPorGravedad: [
    { etiqueta: 'Crítico', cantidad: 2 },
    { etiqueta: 'Alto', cantidad: 3 },
  ],
  ofertasPorEstado: [
    { etiqueta: 'ADJUDICADA', cantidad: 8 },
    { etiqueta: 'PENDIENTE', cantidad: 4 },
  ],
  ofertasConjuntas: {
    fuente: 'DSSD_DB',
    ofertasAdjudicadas: 8,
    adjudicadasEnConjunta: 3,
    porcentajeOfertas: 37.5,
    unidadesAdjudicadas: 1450,
    unidadesEnConjunta: 600,
    porcentajeUnidades: 41.4,
    emergenciasConAdjudicacion: 4,
    emergenciasConConsorcio: 2,
    porcentajeEmergenciasConConsorcio: 50,
  },
  coberturaNecesidades: {
    fuente: 'DSSD_DB',
    unidadesRequeridas: 1600,
    unidadesOfertadas: 1550,
    unidadesValidadas: 1500,
    unidadesAdjudicadas: 1450,
    porcentajeCoberturaOfertada: 96.9,
    porcentajeCoberturaAdjudicada: 90.6,
    convocatoriasConReapertura: 1,
    convocatoriasConCoberturaParcial: 1,
    porTipoRecurso: [
      {
        recurso: 'Agua potable',
        unidadesRequeridas: 1000,
        unidadesOfertadas: 1000,
        unidadesAdjudicadas: 1000,
        porcentajeCoberturaAdjudicada: 100,
        fuente: 'DSSD_DB',
      },
    ],
  },
  rankingOngs: {
    fuente: 'DSSD_DB',
    totalOrganizacionesParticipantes: 2,
    organizaciones: [
      {
        organizacionId: 1,
        organizacionNombre: 'Cruz Roja Argentina',
        ofertasPresentadas: 6,
        ofertasAdjudicadas: 5,
        unidadesMovilizadas: 1000,
        participacionesEnConsorcio: 2,
        fuente: 'DSSD_DB',
      },
    ],
  },
  tiemposPorEtapa: {
    disponible: true,
    fuente: 'BONITA_API',
    mensaje: null,
    casosAnalizados: 5,
    casosFinalizadosEnBonita: 2,
    promedioResolucionTotalHoras: 24.5,
    etapas: [
      { etapa: 'Validar ofertas', promedioHoras: 4.2, minHoras: 1.0, maxHoras: 8.5, casos: 5, fuente: 'BONITA_API' },
    ],
  },
  cuellosDeBotellaBonita: {
    disponible: true,
    fuente: 'BONITA_API',
    mensaje: null,
    casosActivosEnBonita: 3,
    totalTareasPendientes: 2,
    pendientesPorEtapa: [
      {
        etapa: 'Adjudicar convocatoria',
        cantidadPendientes: 2,
        esperaPromedioHoras: 6.5,
        esperaMaximaHoras: 11.0,
        fuente: 'BONITA_API',
      },
    ],
  },
  tiemposResolucionCruzados: {
    disponible: true,
    fuente: 'DSSD_DB + BONITA_API',
    mensaje: null,
    porGravedad: [
      { etiqueta: 'Crítico', promedioHoras: 16.0, minHoras: 12.0, maxHoras: 20.0, casos: 2, fuente: 'DSSD_DB + BONITA_API' },
    ],
    porTipoDesastre: [
      { etiqueta: 'Inundación', promedioHoras: 18.0, minHoras: 12.0, maxHoras: 24.0, casos: 3, fuente: 'DSSD_DB + BONITA_API' },
    ],
  },
  actividadUsuariosBonita: {
    disponible: true,
    fuente: 'BONITA_API',
    mensaje: null,
    totalTareasCompletadas: 14,
    usuarios: [{ usuario: 'agente_coordinador_1', tareasCompletadas: 9, promedioHoras: 2.3, fuente: 'BONITA_API' }],
  },
  estadosCasosBonita: {
    disponible: true,
    fuente: 'BONITA_API',
    mensaje: null,
    versionesProcesoDesplegadas: 1,
    casosActivos: 3,
    casosFinalizados: 2,
    tareasFallidas: 0,
    tasaFinalizacionPorcentaje: 40,
    procesos: [{ id: '101', nombre: 'RescueSync', version: '1.0', estadoActivacion: 'ENABLED', fuente: 'BONITA_API' }],
  },
  tiemposEsperaVsEjecucionBonita: {
    disponible: true,
    fuente: 'BONITA_API',
    mensaje: null,
    esperaPromedioGlobalHoras: 3.5,
    ejecucionPromedioGlobalHoras: 1.5,
    porcentajeEsperaGlobal: 70,
    etapas: [
      {
        etapa: 'Validar ofertas',
        esperaPromedioHoras: 3.5,
        ejecucionPromedioHoras: 1.5,
        porcentajeEspera: 70,
        casos: 5,
        fuente: 'BONITA_API',
      },
    ],
  },
};

describe('DashboardAuditorComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DashboardAuditorComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debería mostrar el formulario de login si no hay sesión de auditor', () => {
    const fixture = TestBed.createComponent(DashboardAuditorComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.auth-card')).toBeTruthy();
    expect(compiled.textContent).toContain('Acceso de Auditor');
  });

  it('debería cargar y renderizar los indicadores al iniciar sesión como AUDITOR', () => {
    const auth = TestBed.inject(AuthService);
    const fixture = TestBed.createComponent(DashboardAuditorComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.loginForm.setValue({ username: 'auditor', password: 'bpm' });
    comp.iniciarSesion();

    const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush({
      token: 'tok-123',
      expiraEn: '2099-12-31T23:59:59',
      usuario: {
        id: 10,
        username: 'auditor',
        nombre: 'Adrián',
        apellido: 'Auditor',
        rol: 'AUDITOR',
        organizacionId: null,
        organizacionNombre: null,
      },
    });

    expect(auth.esAuditor()).toBe(true);

    const indReq = httpMock.expectOne(`${environment.apiUrl}/auditor/indicadores`);
    expect(indReq.request.method).toBe('GET');
    indReq.flush(MOCK_INDICADORES);

    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Indicadores Operativos — RescueSync');
    expect(text).toContain('Métricas de Proceso — Bonita BPM');
    expect(text).toContain('Cruz Roja Argentina');
    expect(text).toContain('Agua potable');
    expect(text).toContain('agente_coordinador_1');
    expect(text).toContain('Exportar datos estructurados');
    expect(text).toContain('JSON completo');
    expect(text).toContain('CSV completo');
    expect(text).toContain('XML');
  });
});
