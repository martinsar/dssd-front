import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CargaOfertas } from './carga-ofertas';

describe('CargaOfertas', () => {
  let component: CargaOfertas;
  let fixture: ComponentFixture<CargaOfertas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargaOfertas],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CargaOfertas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
