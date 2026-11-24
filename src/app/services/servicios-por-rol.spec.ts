// [Entrega final] Pruebas de los servicios del municipio, el coordinador, el auditor y las notificaciones
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MunicipioService } from './municipio';
import { CoordinadorService } from './coordinador';
import { AuditorService } from './auditor';
import { NotificacionService } from './notificacion';

describe('Servicios por rol', () => {
  let http: HttpTestingController;
  const esperar = (metodo: string, fin: string) => http.expectOne(r => r.method === metodo && r.urlWithParams.endsWith(fin));

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('municipio: emergencias, detalle, ofertas validadas y adjudicación', () => {
    const s = TestBed.inject(MunicipioService);
    s.misEmergencias().subscribe();
    esperar('GET', '/api/municipio/emergencias').flush([]);
    s.detalle(12).subscribe();
    esperar('GET', '/api/municipio/emergencias/12').flush({});
    s.ofertasValidadas(12).subscribe();
    esperar('GET', '/api/municipio/emergencias/12/ofertas-validadas').flush([]);
    s.adjudicar(12, [21, 24]).subscribe();
    const req = esperar('POST', '/api/municipio/emergencias/12/adjudicacion');
    expect(req.request.body).toEqual({ ofertaIds: [21, 24] });
    req.flush({ seleccionadas: 2, noSeleccionadas: 3, etapa: 'ADJUDICADA' });
  });

  it('coordinador: monitoreo con filtro, seguimiento y decisión', () => {
    const s = TestBed.inject(CoordinadorService);
    s.monitoreo('EN_EJECUCION').subscribe();
    esperar('GET', '/api/coordinador/monitoreo?etapa=EN_EJECUCION').flush([]);
    s.monitoreo('').subscribe();
    esperar('GET', '/api/coordinador/monitoreo').flush([]);
    s.seguimiento(12).subscribe();
    esperar('GET', '/api/coordinador/emergencias/12').flush({});
    const decision = { accion: 'REABRIR' as const, fechaCierre: '2026-11-20T18:00:00', necesidades: null };
    s.decidir(7, decision).subscribe();
    const req = esperar('POST', '/api/coordinador/convocatorias/7/decision');
    expect(req.request.body).toEqual(decision);
    req.flush({});
  });

  it('auditor: indicadores y emergencias filtrados por fechas', () => {
    const s = TestBed.inject(AuditorService);
    s.indicadores('2026-10-01', '2026-11-30').subscribe();
    esperar('GET', '/api/auditor/indicadores?desde=2026-10-01&hasta=2026-11-30').flush({});
    s.emergencias().subscribe();
    esperar('GET', '/api/auditor/emergencias').flush([]);
  });

  it('notificaciones: contador, lectura individual y total', () => {
    const s = TestBed.inject(NotificacionService);
    s.refrescarNoLeidas();
    esperar('GET', '/api/ong/notificaciones/no-leidas').flush({ cantidad: 3 });
    expect(s.noLeidas()).toBe(3);
    s.listar().subscribe();
    esperar('GET', '/api/ong/notificaciones').flush([]);
    s.marcarLeida(4).subscribe();
    esperar('POST', '/api/ong/notificaciones/4/lectura').flush(null);
    s.marcarTodas().subscribe();
    esperar('POST', '/api/ong/notificaciones/lectura').flush(null);
  });
});
