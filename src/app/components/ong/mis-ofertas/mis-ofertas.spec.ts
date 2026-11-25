import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MisOfertas } from './mis-ofertas';

const lote = (id: number, estado: string) => ({
  id, convocatoriaId: 7, emergenciaId: 12, tipoDesastre: 'Inundación', zonaAfectada: 'Barrio', fechaCierre: '2026-12-20T18:00:00',
  ventanaAbierta: true, tipoRecursoId: 1, codigoTipoRecurso: 'AGUA', tipoRecurso: 'Agua potable', cantidad: 300, descripcion: 'd',
  estado, organizacion: 'Cáritas', ofertaConjuntaId: null, numeroVersion: 1, fechaCreacion: '2026-11-14', fechaModificacion: null,
  fechaFinalizacion: null, informeFinalizacion: null, fueraDeEspecialidad: false, conjuntaValida: true, puedeEditar: estado === 'PENDIENTE',
  puedeFinalizar: false
});

describe('MisOfertas', () => {
  it('muestra el estado "No habilitada" en el historial', async () => {
    await TestBed.configureTestingModule({
      imports: [MisOfertas],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(MisOfertas);
    fixture.detectChanges();
    http.expectOne(r => r.url.endsWith('/ong/ofertas')).flush([lote(1, 'PENDIENTE'), lote(2, 'NO_HABILITADA')]);
    await fixture.whenStable();
    fixture.componentInstance.elegir('historial');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No habilitada');
  });

  it('separa adjudicadas en curso de finalizadas', async () => {
    await TestBed.configureTestingModule({
      imports: [MisOfertas],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(MisOfertas);
    fixture.detectChanges();
    http.expectOne(r => r.url.endsWith('/ong/ofertas'))
      .flush([lote(1, 'PENDIENTE'), lote(2, 'ADJUDICADA'), lote(3, 'FINALIZADA'), lote(4, 'RETIRADA')]);
    await fixture.whenStable();
    const c = fixture.componentInstance;
    expect(c.cantidad('activas')).toBe(1);
    expect(c.cantidad('adjudicadas')).toBe(1);
    expect(c.cantidad('historial')).toBe(2);
  });
});
