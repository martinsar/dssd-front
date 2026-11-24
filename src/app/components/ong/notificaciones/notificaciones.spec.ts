import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Notificaciones } from './notificaciones';

const notificacion = (id: number, leida: boolean) => ({
  id, tipo: 'OFERTA_ADJUDICADA', titulo: 'Oferta adjudicada', mensaje: 'Mensaje ' + id, leida, fechaHora: '2026-11-14T10:00:00',
  emergenciaId: 12, convocatoriaId: 7, ofertaId: 21
});

describe('Notificaciones', () => {
  it('marca una y todas como leídas', async () => {
    await TestBed.configureTestingModule({
      imports: [Notificaciones],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Notificaciones);
    fixture.detectChanges();
    http.expectOne(r => r.method === 'GET' && r.url.endsWith('/ong/notificaciones')).flush([notificacion(1, false), notificacion(2, false)]);
    await fixture.whenStable();
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(c.sinLeer()).toBe(2);

    c.marcarLeida(c.lista()[0]);
    http.expectOne(r => r.method === 'POST' && r.url.endsWith('/ong/notificaciones/1/lectura')).flush(null);
    http.expectOne(r => r.url.endsWith('/no-leidas')).flush({ cantidad: 1 });
    expect(c.sinLeer()).toBe(1);

    c.marcarTodas();
    http.expectOne(r => r.method === 'POST' && r.url.endsWith('/ong/notificaciones/lectura')).flush(null);
    http.expectOne(r => r.url.endsWith('/no-leidas')).flush({ cantidad: 0 });
    expect(c.sinLeer()).toBe(0);
  });
});
