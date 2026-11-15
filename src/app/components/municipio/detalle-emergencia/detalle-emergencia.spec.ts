import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { DetalleEmergencia } from './detalle-emergencia';

const detalle = (puedeSeleccionar: boolean) => ({
  id: 12, tipoDesastre: 'Inundación', nivelGravedad: 'Alto', zonaAfectada: 'Barrio', descripcion: 'Desc', fechaCreacion: '2026-11-06',
  etapa: 'EN_SELECCION', puedeSeleccionar, puedeDecidir: false,
  convocatoria: { id: 7, estado: 'PUBLICADA', fechaApertura: '2026-11-06T10:00:00', fechaCierre: '2026-11-10T18:00:00', ronda: 1, coberturaParcialAceptada: false },
  lotes: [{ necesidadId: 3, tipoRecursoId: 1, tipoRecurso: 'Agua potable', descripcion: 'd', cantidadRequerida: 500, cantidadOfertada: null, cantidadValidada: 400, cantidadAdjudicada: 0 }],
  proyecto: null
});

const validadas = [
  { id: 21, organizacion: 'Cáritas', tipoRecursoId: 1, tipoRecurso: 'Agua potable', cantidad: 300, descripcion: 'd', conjunta: false, estado: 'VALIDADA' },
  { id: 24, organizacion: 'Cruz Roja Argentina', tipoRecursoId: 1, tipoRecurso: 'Agua potable', cantidad: 200, descripcion: 'd', conjunta: true, estado: 'VALIDADA' }
];

describe('DetalleEmergencia', () => {
  async function crear(puedeSeleccionar: boolean) {
    await TestBed.configureTestingModule({
      imports: [DetalleEmergencia],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '12' }), queryParamMap: convertToParamMap({}) } } }
      ]
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(DetalleEmergencia);
    fixture.detectChanges();
    http.expectOne(r => r.url.endsWith('/municipio/emergencias/12')).flush(detalle(puedeSeleccionar));
    http.expectOne(r => r.url.endsWith('/ofertas-validadas')).flush(validadas);
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, http, el: fixture.nativeElement as HTMLElement };
  }

  it('muestra checkboxes solo si puedeSeleccionar', async () => {
    const con = await crear(true);
    expect(con.el.querySelectorAll('input[type="checkbox"]').length).toBe(2);
  });

  it('no permite seleccionar si puedeSeleccionar es falso', async () => {
    const sin = await crear(false);
    expect(sin.el.querySelectorAll('input[type="checkbox"]').length).toBe(0);
    expect(sin.el.textContent).not.toContain('Confirmar selección');
  });

  it('pide confirmación y envía los ids elegidos', async () => {
    const { fixture, http, el } = await crear(true);
    const c = fixture.componentInstance;
    c.alternar(21);
    c.pedirConfirmacion();
    fixture.detectChanges();
    expect(el.textContent).toContain('Confirmá la selección');
    http.expectNone(r => r.method === 'POST');
    c.confirmar();
    const req = http.expectOne(r => r.method === 'POST' && r.url.endsWith('/adjudicacion'));
    expect(req.request.body).toEqual({ ofertaIds: [21] });
    req.flush({ seleccionadas: 1, noSeleccionadas: 1, etapa: 'ADJUDICADA' });
    http.expectOne(r => r.url.endsWith('/municipio/emergencias/12')).flush(detalle(false));
    http.expectOne(r => r.url.endsWith('/ofertas-validadas')).flush(validadas);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.textContent).toContain('Selección registrada');
    expect(el.textContent).toContain('Adjudicada');
  });
});
