import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { SeguimientoEmergencia } from './seguimiento-emergencia';

const seguimiento = (puedeDecidir: boolean) => ({
  emergencia: {
    id: 12, tipoDesastre: 'Inundación', nivelGravedad: 'Alto', zonaAfectada: 'Barrio', descripcion: 'Desc', fechaCreacion: '2026-11-06',
    etapa: puedeDecidir ? 'REQUIERE_DECISION' : 'EN_EJECUCION', puedeSeleccionar: false, puedeDecidir,
    convocatoria: { id: 7, estado: 'PUBLICADA', fechaApertura: '2026-11-06T10:00:00', fechaCierre: '2026-11-10T18:00:00', ronda: 1, coberturaParcialAceptada: false },
    lotes: [{ necesidadId: 3, tipoRecursoId: 1, tipoRecurso: 'Agua potable', descripcion: 'd', cantidadRequerida: 500, cantidadOfertada: 300, cantidadValidada: 300, cantidadAdjudicada: 0 }],
    proyecto: null
  },
  ofertas: [
    { id: 21, organizacion: 'Cáritas', tipoRecurso: 'Agua potable', cantidad: 300, descripcion: 'd', estado: 'ADJUDICADA', numeroVersion: 1, fechaModificacion: null, fechaFinalizacion: null, informeFinalizacion: null },
    { id: 22, organizacion: 'Cruz Roja Argentina', tipoRecurso: 'Agua potable', cantidad: 100, descripcion: 'd', estado: 'FINALIZADA', numeroVersion: 2, fechaModificacion: null, fechaFinalizacion: '2026-11-12T10:00:00', informeFinalizacion: 'Listo' }
  ]
});

describe('SeguimientoEmergencia', () => {
  async function crear(puedeDecidir: boolean) {
    await TestBed.configureTestingModule({
      imports: [SeguimientoEmergencia],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '12' }), queryParamMap: convertToParamMap({}) } } }
      ]
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(SeguimientoEmergencia);
    fixture.detectChanges();
    http.expectOne(r => r.url.endsWith('/coordinador/emergencias/12')).flush(seguimiento(puedeDecidir));
    if (puedeDecidir) {
      http.expectOne(r => r.url.endsWith('/tipos-recurso')).flush([{ id: 1, nombre: 'Agua potable' }]);
    }
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, http, el: fixture.nativeElement as HTMLElement };
  }

  it('muestra las tres decisiones cuando corresponde', async () => {
    const { el } = await crear(true);
    expect(el.textContent).toContain('Reabrir la convocatoria');
    expect(el.textContent).toContain('Reformular lotes');
    expect(el.textContent).toContain('Continuar con cobertura parcial');
  });

  it('no muestra decisiones ni infiere progreso sin adjudicadas', async () => {
    const { el } = await crear(false);
    expect(el.textContent).not.toContain('Aplicar decisión');
    expect(el.textContent).toContain('1 de 2 actividades finalizadas');
  });

  it('reabre con la nueva fecha de cierre', async () => {
    const { fixture, http } = await crear(true);
    const c = fixture.componentInstance;
    const futura = new Date(Date.now() + 86400000 * 3);
    const pad = (n: number) => String(n).padStart(2, '0');
    c.fechaCierre.setValue(`${futura.getFullYear()}-${pad(futura.getMonth() + 1)}-${pad(futura.getDate())}T18:00`);
    c.aplicar();
    const req = http.expectOne(r => r.method === 'POST' && r.url.endsWith('/coordinador/convocatorias/7/decision'));
    expect(req.request.body.accion).toBe('REABRIR');
    expect(req.request.body.fechaCierre).toMatch(/T18:00:00$/);
    expect(req.request.body.necesidades).toBeNull();
    req.flush({ id: 7, estado: 'PUBLICADA' });
    http.expectOne(r => r.url.endsWith('/coordinador/emergencias/12')).flush(seguimiento(false));
  });

  it('continuar con cobertura parcial pide confirmación y no envía fecha', async () => {
    const { fixture, http } = await crear(true);
    const c = fixture.componentInstance;
    c.elegirAccion('CONTINUAR_PARCIAL');
    c.aplicar();
    http.expectNone(r => r.method === 'POST');
    expect(c.confirmandoParcial()).toBe(true);
    c.aplicar();
    const req = http.expectOne(r => r.method === 'POST' && r.url.endsWith('/decision'));
    expect(req.request.body).toEqual({ accion: 'CONTINUAR_PARCIAL', fechaCierre: null, necesidades: null });
    req.flush({ id: 7, estado: 'PUBLICADA' });
    http.expectOne(r => r.url.endsWith('/coordinador/emergencias/12')).flush(seguimiento(false));
  });
});
