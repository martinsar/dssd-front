import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EmergenciaService } from './emergencia';

describe('Emergencia', () => {
  let service: EmergenciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(EmergenciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
