import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ConjuntaForm } from './conjunta-form';

const convocatoria = {
  convocatoriaId: 7, emergenciaId: 12, tipoDesastre: 'Inundación', nivelGravedad: 'Alto', zonaAfectada: 'Barrio', descripcion: 'x',
  fechaApertura: '2026-11-01T10:00:00', fechaCierre: '2026-12-20T18:00:00', abierta: true, lotes: []
};

describe('ConjuntaForm', () => {
  async function crear() {
    await TestBed.configureTestingModule({
      imports: [ConjuntaForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: '**', children: [] }])]
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ConjuntaForm);
    fixture.detectChanges();
    http.expectOne(r => r.url.endsWith('/ong/convocatorias')).flush([convocatoria]);
    http.expectOne(r => r.url.endsWith('/ong/organizaciones')).flush([
      { id: 2, codigoOng: 'ONG-CRUZ-ROJA', nombre: 'Cruz Roja Argentina' },
      { id: 3, codigoOng: 'ONG-X', nombre: 'Otra ONG' }
    ]);
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, http };
  }

  it('lista las ONGs con checkboxes y avisa que la lista no se puede cambiar', async () => {
    const { fixture } = await crear();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('input[type="checkbox"]').length).toBe(2);
    expect(el.textContent).toContain('no se puede cambiar');
    expect(el.textContent).toContain('No hay invitaciones');
  });

  it('exige convocatoria y al menos una ONG', async () => {
    const { fixture, http } = await crear();
    fixture.componentInstance.crear();
    http.expectNone(r => r.method === 'POST');
    expect(fixture.componentInstance.puedeEnviar()).toBe(false);
  });

  it('envía los participantes elegidos', async () => {
    const { fixture, http } = await crear();
    const c = fixture.componentInstance;
    c.elegirConvocatoria('7');
    c.alternar(2, true);
    c.alternar(3, true);
    c.alternar(3, false);
    c.crear();
    const req = http.expectOne(r => r.method === 'POST' && r.url.endsWith('/ong/ofertas-conjuntas'));
    expect(req.request.body).toEqual({ convocatoriaId: 7, participantesIds: [2] });
    req.flush({ id: 5 });
  });
});
