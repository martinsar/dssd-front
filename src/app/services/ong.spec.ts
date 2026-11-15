// [Entrega final] Pruebas del servicio de la ONG contra el contrato de API
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OngService } from './ong';

describe('OngService', () => {
  let servicio: OngService;
  let http: HttpTestingController;

  const esperar = (metodo: string, fin: string) => http.expectOne(r => r.method === metodo && r.url.endsWith(fin));

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servicio = TestBed.inject(OngService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta convocatorias, especialidades y organizaciones', () => {
    servicio.convocatorias().subscribe();
    servicio.especialidades().subscribe();
    servicio.organizaciones().subscribe();
    esperar('GET', '/api/ong/convocatorias').flush([]);
    esperar('GET', '/api/ong/especialidades').flush([]);
    esperar('GET', '/api/ong/organizaciones').flush([]);
  });

  it('crea un lote con ofertaConjuntaId', () => {
    const cuerpo = { convocatoriaId: 7, tipoRecursoId: 1, cantidad: 300, descripcion: 'x', ofertaConjuntaId: 5 };
    servicio.crearOferta(cuerpo).subscribe();
    const req = esperar('POST', '/api/ong/ofertas');
    expect(req.request.body).toEqual(cuerpo);
    req.flush({});
  });

  it('edita con versionEsperada, retira y consulta versiones', () => {
    const edicion = { tipoRecursoId: 1, cantidad: 10, descripcion: 'y', versionEsperada: 2 };
    servicio.editarOferta(21, edicion).subscribe();
    const put = esperar('PUT', '/api/ong/ofertas/21');
    expect(put.request.body).toEqual(edicion);
    put.flush({});

    servicio.retirar(21).subscribe();
    esperar('POST', '/api/ong/ofertas/21/retiro').flush({});
    servicio.versiones(21).subscribe();
    esperar('GET', '/api/ong/ofertas/21/versiones').flush([]);
  });

  it('finaliza con informe opcional', () => {
    servicio.finalizar(21, '').subscribe();
    const req = esperar('POST', '/api/ong/ofertas/21/finalizacion');
    expect(req.request.body).toEqual({ informe: null });
    req.flush({});
  });

  it('crea y consulta ofertas conjuntas', () => {
    servicio.crearOfertaConjunta({ convocatoriaId: 7, participantesIds: [2, 3] }).subscribe();
    const req = esperar('POST', '/api/ong/ofertas-conjuntas');
    expect(req.request.body).toEqual({ convocatoriaId: 7, participantesIds: [2, 3] });
    req.flush({});
    servicio.ofertasConjuntas().subscribe();
    esperar('GET', '/api/ong/ofertas-conjuntas').flush([]);
    servicio.ofertaConjunta(5).subscribe();
    esperar('GET', '/api/ong/ofertas-conjuntas/5').flush({});
  });

  it('administra el inventario', () => {
    servicio.inventario().subscribe();
    esperar('GET', '/api/ong/inventario').flush([]);
    servicio.guardarInventario(1, { cantidadDisponible: 1000, descripcion: 'Depósito' }).subscribe();
    esperar('PUT', '/api/ong/inventario/1').flush({});
    servicio.quitarInventario(1).subscribe();
    esperar('DELETE', '/api/ong/inventario/1').flush(null);
  });

  it('no tiene operaciones de invitaciones', () => {
    const metodos = Object.getOwnPropertyNames(Object.getPrototypeOf(servicio)).join(' ').toLowerCase();
    expect(metodos).not.toContain('invitaci');
    expect(metodos).not.toContain('aceptar');
    expect(metodos).not.toContain('rechazar');
  });
});
