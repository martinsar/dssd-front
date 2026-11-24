import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { DetalleConjunta } from './detalle-conjunta';

const conjunta = {
  id: 5, convocatoriaId: 7, emergenciaId: 12, tipoDesastre: 'Inundación', fechaCierre: '2026-12-20T18:00:00', ventanaAbierta: true,
  organizacionDuena: { id: 1, nombre: 'Cáritas' }, esDuena: true,
  participantes: [
    { organizacionId: 1, codigoOng: 'ONG-CARITAS', nombre: 'Cáritas', lotesCargados: 2 },
    { organizacionId: 2, codigoOng: 'ONG-CRUZ-ROJA', nombre: 'Cruz Roja Argentina', lotesCargados: 0 }
  ],
  valida: false, faltan: ['Cruz Roja Argentina'], lotes: []
};

describe('DetalleConjunta', () => {
  it('muestra las ONGs que faltan y los lotes cargados por cada una', async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleConjunta],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '5' }), queryParamMap: convertToParamMap({}) } } }
      ]
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(DetalleConjunta);
    fixture.detectChanges();
    http.expectOne(r => r.url.endsWith('/ong/ofertas-conjuntas/5')).flush(conjunta);
    await fixture.whenStable();
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('todavía no es válida');
    expect(texto).toContain('Faltan lotes de');
    expect(texto).toContain('Cruz Roja Argentina');
    expect(texto).toContain('Cargar lote');
  });
});
