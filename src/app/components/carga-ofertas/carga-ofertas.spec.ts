import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CargaOfertas } from './carga-ofertas';

describe('CargaOfertas', () => {
  let component: CargaOfertas;
  let fixture: ComponentFixture<CargaOfertas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargaOfertas],
    }).compileComponents();

    fixture = TestBed.createComponent(CargaOfertas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
