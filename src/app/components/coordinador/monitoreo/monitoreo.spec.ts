import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Monitoreo } from './monitoreo';

const fila = (id: number, etapa: string, requiereDecision: boolean) => ({
  emergenciaId: id, tipoDesastre: 'Inundación', nivelGravedad: 'Alto', zonaAfectada: 'Barrio', fechaCreacion: '2026-11-06', etapa,
  convocatoriaId: 7, fechaCierre: '2026-11-10T18:00:00', ronda: 1, lotesTotales: 3, lotesCubiertos: 1, ofertasActivas: 2,
  ofertasAdjudicadas: 0, ofertasFinalizadas: 0, progresoEjecucion: 0, requiereDecision
});

describe('Monitoreo', () => {
  it('alerta las emergencias que requieren decisión y filtra por etapa', async () => {
    await TestBed.configureTestingModule({
      imports: [Monitoreo],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Monitoreo);
    fixture.detectChanges();
    http.expectOne(r => r.urlWithParams.endsWith('/coordinador/monitoreo')).flush([fila(12, 'REQUIERE_DECISION', true), fila(10, 'EN_EJECUCION', false)]);
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('La emergencia N° 12 requiere una decisión');
    expect(el.querySelectorAll('tbody tr').length).toBe(2);

    fixture.componentInstance.cambiarEtapa('EN_EJECUCION');
    http.expectOne(r => r.urlWithParams.endsWith('/coordinador/monitoreo?etapa=EN_EJECUCION')).flush([fila(10, 'EN_EJECUCION', false)]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelectorAll('tbody tr').length).toBe(1);
  });
});
