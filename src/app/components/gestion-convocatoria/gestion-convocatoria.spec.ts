// [Entrega 2 · Tarea 4] ARCHIVO NUEVO. Test mínimo del componente (mismo formato que el resto de los .spec.ts).
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GestionConvocatoria } from './gestion-convocatoria';

describe('GestionConvocatoria', () => {
  let component: GestionConvocatoria;
  let fixture: ComponentFixture<GestionConvocatoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionConvocatoria],
      // El componente pide datos al backend: en el test se usa un HttpClient de prueba (no hace pedidos reales)
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionConvocatoria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
