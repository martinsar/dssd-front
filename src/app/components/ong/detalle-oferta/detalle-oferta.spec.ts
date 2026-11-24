import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { DetalleOferta } from './detalle-oferta';

const lote = (extra: object) => ({
  id: 21, convocatoriaId: 7, emergenciaId: 12, tipoDesastre: 'Inundación', zonaAfectada: 'Barrio', fechaCierre: '2026-12-20T18:00:00',
  ventanaAbierta: true, tipoRecursoId: 1, codigoTipoRecurso: 'AGUA', tipoRecurso: 'Agua potable', cantidad: 300, descripcion: 'd',
  estado: 'PENDIENTE', organizacion: 'Cáritas', ofertaConjuntaId: null, numeroVersion: 2, fechaCreacion: '2026-11-14',
  fechaModificacion: null, fechaFinalizacion: null, informeFinalizacion: null, fueraDeEspecialidad: false, conjuntaValida: true,
  puedeEditar: true, puedeFinalizar: false, ...extra
});

describe('DetalleOferta', () => {
  async function crear(extra: object) {
    await TestBed.configureTestingModule({
      imports: [DetalleOferta],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '21' }), queryParamMap: convertToParamMap({}) } } }
      ]
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(DetalleOferta);
    fixture.detectChanges();
    http.expectOne(r => r.url.endsWith('/ong/ofertas/21')).flush(lote(extra));
    http.expectOne(r => r.url.endsWith('/ong/ofertas/21/versiones')).flush([
      { numeroVersion: 2, fechaHora: '2026-11-14T10:00:00', usuario: null, motivo: 'Modificación', tipoRecurso: 'Agua potable', cantidad: 300, descripcion: 'd', estado: 'PENDIENTE' }
    ]);
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, http, el: fixture.nativeElement as HTMLElement };
  }

  it('muestra el historial de versiones y pide confirmación para retirar', async () => {
    const { fixture, http, el } = await crear({});
    expect(el.textContent).toContain('Historial de versiones');
    expect(el.textContent).toContain('Versión 2');
    fixture.componentInstance.pedirRetiro();
    fixture.detectChanges();
    expect(el.textContent).toContain('¿Querés retirar este lote?');
    http.expectNone(r => r.url.endsWith('/retiro'));
    fixture.componentInstance.retirar();
    http.expectOne(r => r.method === 'POST' && r.url.endsWith('/ong/ofertas/21/retiro')).flush(lote({ estado: 'RETIRADA', puedeEditar: false }));
    http.expectOne(r => r.url.endsWith('/versiones')).flush([]);
  });

  it('ofrece finalizar solo cuando puedeFinalizar', async () => {
    const { el } = await crear({ estado: 'ADJUDICADA', puedeEditar: false, puedeFinalizar: true });
    expect(el.textContent).toContain('Marcar actividad como finalizada');
    expect(el.textContent).not.toContain('Retirar lote');
  });

  it('avisa si el recurso está fuera de especialidad', async () => {
    const { el } = await crear({ fueraDeEspecialidad: true });
    expect(el.textContent).toContain('no está entre tus especialidades');
  });
});
