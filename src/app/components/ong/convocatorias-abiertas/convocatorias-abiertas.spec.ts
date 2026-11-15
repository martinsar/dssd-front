import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ConvocatoriasAbiertas } from './convocatorias-abiertas';
import { ConvocatoriaAbierta } from '../../../models/convocatoria.model';

function convocatoria(id: number, abierta: boolean, minutosAlCierre: number): ConvocatoriaAbierta {
  return {
    convocatoriaId: id, emergenciaId: id, tipoDesastre: 'Inundación', nivelGravedad: 'Alto',
    zonaAfectada: 'Zona', descripcion: '', fechaApertura: new Date().toISOString(),
    fechaCierre: new Date(Date.now() + minutosAlCierre * 60000).toISOString(), abierta, lotes: []
  };
}

describe('ConvocatoriasAbiertas', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvocatoriasAbiertas],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(ConvocatoriasAbiertas);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra solo las convocatorias que todavía reciben ofertas', () => {
    const fixture = TestBed.createComponent(ConvocatoriasAbiertas);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(r => r.url.endsWith('/convocatorias')).flush([
      convocatoria(1, true, 30),
      convocatoria(2, false, -30),
      convocatoria(3, true, -1)
    ]);
    expect(fixture.componentInstance.convocatorias().map(c => c.convocatoriaId)).toEqual([1]);
    http.verify();
  });
});
