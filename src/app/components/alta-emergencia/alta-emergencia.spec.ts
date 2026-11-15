import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AltaEmergenciaComponent } from './alta-emergencia';

describe('AltaEmergencia', () => {
  let component: AltaEmergenciaComponent;
  let fixture: ComponentFixture<AltaEmergenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AltaEmergenciaComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AltaEmergenciaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
