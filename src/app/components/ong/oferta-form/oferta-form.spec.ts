import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { OfertaForm } from './oferta-form';

const convocatoria = {
  convocatoriaId: 7, emergenciaId: 12, tipoDesastre: 'Inundación', nivelGravedad: 'Alto', zonaAfectada: 'Barrio', descripcion: 'x',
  fechaApertura: '2026-11-01T10:00:00', fechaCierre: '2026-12-20T18:00:00', abierta: true,
  lotes: [{ necesidadId: 3, tipoRecursoId: 1, codigoTipoRecurso: 'AGUA', tipoRecurso: 'Agua potable', descripcion: 'd', cantidadRequerida: 500 }]
};

describe('OfertaForm', () => {
  async function crear() {
    await TestBed.configureTestingModule({
      imports: [OfertaForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', children: [] }]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ convocatoriaId: '7' }), queryParamMap: convertToParamMap({}) } } }
      ]
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(OfertaForm);
    fixture.detectChanges();
    const resp = (fin: string, cuerpo: object) => http.expectOne(r => r.url.endsWith(fin)).flush(cuerpo);
    resp('/ong/convocatorias', [convocatoria]);
    resp('/tipos-recurso', [{ id: 1, nombre: 'Agua potable' }, { id: 2, nombre: 'Mantas' }]);
    resp('/ong/especialidades', [{ tipoRecursoId: 1, codigo: 'AGUA', nombre: 'Agua potable' }]);
    resp('/ong/inventario', []);
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, http };
  }

  it('avisa cuando el tipo está fuera de las especialidades', async () => {
    const { fixture } = await crear();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('no está entre tus especialidades');
    fixture.componentInstance.form.controls.tipoRecursoId.setValue(2);
    fixture.detectChanges();
    expect(el.textContent).toContain('Este recurso no está entre tus especialidades; puede no ser validado');
    fixture.componentInstance.form.controls.tipoRecursoId.setValue(1);
    fixture.detectChanges();
    expect(el.textContent).not.toContain('no está entre tus especialidades');
  });

  it('envía el lote con ofertaConjuntaId nulo', async () => {
    const { fixture, http } = await crear();
    const c = fixture.componentInstance;
    c.form.setValue({ tipoRecursoId: 1, cantidad: 300, descripcion: 'bidones' });
    c.enviar();
    const req = http.expectOne(r => r.method === 'POST' && r.url.endsWith('/ong/ofertas'));
    expect(req.request.body).toEqual({ convocatoriaId: 7, tipoRecursoId: 1, cantidad: 300, descripcion: 'bidones', ofertaConjuntaId: null });
    req.flush({ id: 21, fueraDeEspecialidad: false });
  });

  it('no envía si el formulario es inválido', async () => {
    const { fixture, http } = await crear();
    fixture.componentInstance.enviar();
    http.expectNone(r => r.method === 'POST');
    expect(fixture.componentInstance.form.touched).toBe(true);
  });
});
