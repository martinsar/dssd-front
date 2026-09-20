import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AltaEmergencia } from './alta-emergencia';

describe('AltaEmergencia', () => {
  let component: AltaEmergencia;
  let fixture: ComponentFixture<AltaEmergencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AltaEmergencia],
    }).compileComponents();

    fixture = TestBed.createComponent(AltaEmergencia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
