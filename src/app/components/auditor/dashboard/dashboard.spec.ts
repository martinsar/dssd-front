import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DashboardAuditor } from './dashboard';

const indicadores = {
  generadoEn: '2026-11-06T10:00:00', desde: null, hasta: null,
  totales: { emergencias: 12, convocatoriasPublicadas: 9, ofertasRecibidas: 40, ofertasAdjudicadas: 15, proyectosEnCurso: 3, proyectosFinalizados: 4, suministrosMovilizados: 5400 },
  suministrosPorTipo: [{ etiqueta: 'Agua potable', cantidad: 2000 }],
  emergenciasPorEtapa: [{ etiqueta: 'EN_EJECUCION', cantidad: 3 }],
  emergenciasPorGravedad: [{ etiqueta: 'Alto', cantidad: 4 }],
  ofertasPorEstado: [{ etiqueta: 'VALIDADA', cantidad: 7 }],
  ofertasConjuntas: { ofertasAdjudicadas: 15, adjudicadasEnConjunta: 5, porcentajeOfertas: 33.3, unidadesAdjudicadas: 5400, unidadesEnConjunta: 1800, porcentajeUnidades: 33.3 },
  tiemposPorEtapa: { disponible: false, fuente: 'Bonita', etapas: [] }
};

describe('DashboardAuditor', () => {
  async function crear() {
    await TestBed.configureTestingModule({
      imports: [DashboardAuditor],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(DashboardAuditor);
    fixture.detectChanges();
    return { fixture, http };
  }

  it('muestra KPIs, ofertas conjuntas y tiempos "Disponible próximamente"', async () => {
    const { fixture, http } = await crear();
    http.expectOne(r => r.url.endsWith('/auditor/indicadores')).flush(indicadores);
    http.expectOne(r => r.url.endsWith('/auditor/emergencias')).flush([]);
    await fixture.whenStable();
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Suministros movilizados');
    expect(texto).toContain('5400');
    expect(texto).toContain('Proyectos en curso');
    expect(texto).toContain('33.3%');
    expect(texto).toContain('Disponible próximamente');
    expect(texto).not.toContain('onsorcio');
  });

  it('manda el filtro de fechas', async () => {
    const { fixture, http } = await crear();
    http.expectOne(r => r.url.endsWith('/auditor/indicadores')).flush(indicadores);
    http.expectOne(r => r.url.endsWith('/auditor/emergencias')).flush([]);
    const c = fixture.componentInstance;
    c.desde.setValue('2026-10-01');
    c.hasta.setValue('2026-11-30');
    c.cargar();
    http.expectOne(r => r.urlWithParams.endsWith('/auditor/indicadores?desde=2026-10-01&hasta=2026-11-30')).flush(indicadores);
    http.expectOne(r => r.urlWithParams.endsWith('/auditor/emergencias?desde=2026-10-01&hasta=2026-11-30')).flush([]);
  });

  it('rechaza un rango de fechas invertido', async () => {
    const { fixture, http } = await crear();
    http.expectOne(r => r.url.endsWith('/auditor/indicadores')).flush(indicadores);
    http.expectOne(r => r.url.endsWith('/auditor/emergencias')).flush([]);
    const c = fixture.componentInstance;
    c.desde.setValue('2026-12-01');
    c.hasta.setValue('2026-11-01');
    c.cargar();
    http.expectNone(r => r.url.endsWith('/auditor/indicadores'));
    expect(c.error()).toContain('no puede ser posterior');
  });
});
